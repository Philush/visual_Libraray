import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

/**
 * Сервис экспорта библиотеки.
 *
 * Поддерживает форматы: CSV, XLSX, JSON.
 * - CSV/XLSX: только книги (поля без placement)
 * - JSON: книги + расположение на полках (для полного резервного копирования)
 *
 * Связанные фичи: F-07
 */

const COLUMNS = [
  { key: 'title',       label: 'Название',      width: 30 },
  { key: 'author',      label: 'Автор',         width: 25 },
  { key: 'isbn',        label: 'ISBN',          width: 15 },
  { key: 'pageCount',   label: 'Страниц',       width: 10 },
  { key: 'genre',       label: 'Жанр',          width: 18 },
  { key: 'publishYear', label: 'Год издания',   width: 13 },
  { key: 'notes',       label: 'Заметки',       width: 40 },
  { key: 'spineColor',  label: 'Цвет корешка',  width: 14 },
];

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  private async fetchBooks() {
    return this.prisma.book.findMany({
      include: {
        placement: {
          include: {
            shelf: {
              include: { bookcase: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Экспорт в CSV (UTF-8 с BOM для корректного открытия в Excel).
   * Заголовок — русские названия колонок.
   */
  async exportToCsv(): Promise<Buffer> {
    const books = await this.fetchBooks();

    const escape = (val: string | number | null | undefined): string => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = COLUMNS.map((c) => c.label).join(',');
    const rows = books.map((b) =>
      COLUMNS.map((c) => escape((b as Record<string, unknown>)[c.key] as string | number | null)).join(',')
    );

    const csv = [header, ...rows].join('\n');
    // BOM (\uFEFF) — Excel открывает UTF-8 файлы без него как ANSI на Windows
    return Buffer.from('\uFEFF' + csv, 'utf-8');
  }

  /**
   * Экспорт в XLSX через ExcelJS.
   * Первая строка — стилизованный заголовок (amber).
   */
  async exportToXlsx(): Promise<Buffer> {
    const books = await this.fetchBooks();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Visual Library';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Книги');

    sheet.columns = COLUMNS.map((c) => ({
      header: c.label,
      key: c.key,
      width: c.width,
    }));

    // Стиль заголовочной строки
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB45309' }, // amber-700
    };
    headerRow.alignment = { vertical: 'middle' };
    headerRow.height = 20;

    // Данные
    books.forEach((b) => {
      sheet.addRow({
        title:       b.title,
        author:      b.author,
        isbn:        b.isbn ?? '',
        pageCount:   b.pageCount ?? '',
        genre:       b.genre ?? '',
        publishYear: b.publishYear ?? '',
        notes:       b.notes ?? '',
        spineColor:  b.spineColor ?? '',
      });
    });

    // Перенос текста в колонке «Заметки»
    sheet.getColumn('notes').alignment = { wrapText: true };

    // Freeze header row
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Экспорт в JSON — полный snapshot библиотеки.
   * Включает книги + placements для восстановления на другом инстансе.
   */
  async exportToJson(): Promise<object> {
    const books = await this.fetchBooks();

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      books: books.map((b) => ({
        title:       b.title,
        author:      b.author,
        isbn:        b.isbn ?? null,
        pageCount:   b.pageCount ?? null,
        genre:       b.genre ?? null,
        publishYear: b.publishYear ?? null,
        notes:       b.notes ?? null,
        spineColor:  b.spineColor ?? null,
        coverUrl:    b.coverUrl ?? null,
      })),
      placements: books
        .filter((b) => b.placement)
        .map((b) => ({
          bookTitle:    b.title,
          bookAuthor:   b.author,
          bookcaseName: b.placement!.shelf.bookcase.name,
          shelfPosition: b.placement!.shelf.position,
          shelfLabel:   b.placement!.shelf.label ?? null,
        })),
    };
  }
}
