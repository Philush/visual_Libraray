import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

/**
 * Сервис импорта данных в библиотеку.
 *
 * Поддерживает форматы: CSV, XLSX, JSON.
 * - CSV/XLSX: только книги (без placement; книги попадают в "без полки")
 * - JSON: книги + расположение на полках (полное восстановление)
 *
 * Стратегия дублей (onDuplicate):
 * - 'skip'   — если книга с таким title+author уже есть, пропустить
 * - 'update' — обновить существующую книгу новыми полями (кроме title/author)
 *
 * Все данные привязываются к userId (F-09).
 *
 * Связанные фичи: F-07, F-09
 */

export type OnDuplicate = 'skip' | 'update';

interface BookRow {
  title: string;
  author: string;
  isbn?: string;
  pageCount?: number;
  genre?: string;
  publishYear?: number;
  notes?: string;
  spineColor?: string;
  coverUrl?: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CSV ──────────────────────────────────────────────

  private parseCsvRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  async importFromCsv(buffer: Buffer, onDuplicate: OnDuplicate = 'skip', userId: string): Promise<ImportResult> {
    let text = buffer.toString('utf-8');
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) throw new BadRequestException('Файл пустой или содержит только заголовок');

    const headers = this.parseCsvRow(lines[0]);
    const dataRows = lines.slice(1).map((line) => {
      const values = this.parseCsvRow(line);
      return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim() ?? '']));
    });

    const { books, errors } = this.normalizeRows(dataRows);
    return this.upsertBooks(books, onDuplicate, errors, userId);
  }

  // ─── XLSX ─────────────────────────────────────────────

  async importFromXlsx(buffer: Buffer, onDuplicate: OnDuplicate = 'skip', userId: string): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('XLSX файл не содержит листов');

    const rows: Record<string, string>[] = [];
    let headers: string[] = [];

    sheet.eachRow((row, rowNumber) => {
      const values = (row.values as (ExcelJS.CellValue | undefined)[]).slice(1);

      if (rowNumber === 1) {
        headers = values.map((v) => String(v ?? '').trim());
      } else {
        const rowObj: Record<string, string> = {};
        headers.forEach((h, i) => {
          rowObj[h] = String(values[i] ?? '').trim();
        });
        if (Object.values(rowObj).some((v) => v)) rows.push(rowObj);
      }
    });

    const { books, errors } = this.normalizeRows(rows);
    return this.upsertBooks(books, onDuplicate, errors, userId);
  }

  // ─── JSON ─────────────────────────────────────────────

  async importFromJson(
    data: unknown,
    onDuplicate: OnDuplicate = 'skip',
    userId: string,
  ): Promise<{ books: ImportResult; placements: { created: number; skipped: number; errors: string[] } }> {
    if (
      typeof data !== 'object' ||
      data === null ||
      !('version' in data) ||
      !Array.isArray((data as Record<string, unknown>).books)
    ) {
      throw new BadRequestException('Невалидный формат JSON. Ожидается объект с полями version и books.');
    }

    const payload = data as unknown as {
      books: unknown[];
      placements?: unknown[];
    };

    const { books, errors: bookErrors } = this.normalizeRows(payload.books as Record<string, string>[]);
    const booksResult = await this.upsertBooks(books, onDuplicate, bookErrors, userId);

    const placements = Array.isArray(payload.placements) ? payload.placements : [];
    let placementsCreated = 0;
    let placementsSkipped = 0;
    const placementErrors: string[] = [];

    for (const p of placements) {
      if (typeof p !== 'object' || p === null) continue;
      const placement = p as Record<string, unknown>;

      try {
        const book = await this.prisma.book.findFirst({
          where: {
            userId,
            title:  { equals: String(placement.bookTitle ?? ''),  mode: 'insensitive' },
            author: { equals: String(placement.bookAuthor ?? ''), mode: 'insensitive' },
          },
          select: { id: true },
        });
        if (!book) { placementsSkipped++; continue; }

        const bookcase = await this.prisma.bookcase.findFirst({
          where: {
            userId,
            name: { equals: String(placement.bookcaseName ?? ''), mode: 'insensitive' },
          },
          select: { id: true },
        });
        if (!bookcase) { placementsSkipped++; continue; }

        const shelf = await this.prisma.shelf.findFirst({
          where: { bookcaseId: bookcase.id, position: Number(placement.shelfPosition) },
          select: { id: true },
        });
        if (!shelf) { placementsSkipped++; continue; }

        const existing = await this.prisma.bookPlacement.findUnique({
          where: { bookId: book.id },
        });
        if (existing) { placementsSkipped++; continue; }

        const last = await this.prisma.bookPlacement.findFirst({
          where: { shelfId: shelf.id },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        const position = (last?.position ?? 0) + 1;

        await this.prisma.bookPlacement.create({
          data: { bookId: book.id, shelfId: shelf.id, position },
        });
        placementsCreated++;
      } catch (err) {
        placementErrors.push(
          `Ошибка при размещении "${placement.bookTitle}": ${(err as Error).message}`,
        );
      }
    }

    return {
      books: booksResult,
      placements: { created: placementsCreated, skipped: placementsSkipped, errors: placementErrors },
    };
  }

  // ─── Вспомогательные ──────────────────────────────────

  private normalizeRows(rows: Record<string, string>[]): { books: BookRow[]; errors: string[] } {
    const books: BookRow[] = [];
    const errors: string[] = [];

    const pick = (row: Record<string, string>, ...keys: string[]): string | undefined => {
      for (const key of keys) {
        const val = row[key]?.trim();
        if (val) return val;
      }
      return undefined;
    };

    rows.forEach((row, idx) => {
      const title  = pick(row, 'title',  'Название');
      const author = pick(row, 'author', 'Автор');

      if (!title || !author) {
        errors.push(`Строка ${idx + 2}: пропущены обязательные поля «Название» / «Автор»`);
        return;
      }

      const pageCountRaw   = pick(row, 'pageCount',   'Страниц');
      const publishYearRaw = pick(row, 'publishYear', 'Год издания');
      const spineColorRaw  = pick(row, 'spineColor',  'Цвет корешка');

      const pageCount   = pageCountRaw   ? parseInt(pageCountRaw, 10)   : undefined;
      const publishYear = publishYearRaw ? parseInt(publishYearRaw, 10) : undefined;

      books.push({
        title,
        author,
        isbn:        pick(row, 'isbn',     'ISBN'),
        pageCount:   pageCount   && !isNaN(pageCount)   ? pageCount   : undefined,
        genre:       pick(row, 'genre',    'Жанр'),
        publishYear: publishYear && !isNaN(publishYear) ? publishYear : undefined,
        notes:       pick(row, 'notes',    'Заметки'),
        spineColor:  spineColorRaw?.match(/^#[0-9A-Fa-f]{6}$/) ? spineColorRaw : undefined,
        coverUrl:    pick(row, 'coverUrl'),
      });
    });

    return { books, errors };
  }

  private async upsertBooks(
    books: BookRow[],
    onDuplicate: OnDuplicate,
    existingErrors: string[],
    userId: string,
  ): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [...existingErrors];

    for (const book of books) {
      try {
        const existing = await this.prisma.book.findFirst({
          where: {
            userId,
            title:  { equals: book.title,  mode: 'insensitive' },
            author: { equals: book.author, mode: 'insensitive' },
          },
          select: { id: true },
        });

        if (existing) {
          if (onDuplicate === 'update') {
            await this.prisma.book.update({
              where: { id: existing.id },
              data: {
                isbn:        book.isbn        ?? undefined,
                pageCount:   book.pageCount   ?? undefined,
                genre:       book.genre       ?? undefined,
                publishYear: book.publishYear ?? undefined,
                notes:       book.notes       ?? undefined,
                spineColor:  book.spineColor  ?? undefined,
                coverUrl:    book.coverUrl    ?? undefined,
              },
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await this.prisma.book.create({ data: { ...book, userId } });
          created++;
        }
      } catch (err) {
        errors.push(`Ошибка при сохранении «${book.title}»: ${(err as Error).message}`);
      }
    }

    return { created, updated, skipped, errors };
  }
}
