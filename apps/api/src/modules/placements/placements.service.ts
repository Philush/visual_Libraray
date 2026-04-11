import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';

/**
 * Сервис размещения книг на полках.
 *
 * Ключевые инварианты (enforcement на уровне БД + логики):
 * 1. Книга может стоять только на одной полке (UNIQUE bookId в book_placements)
 * 2. На одной позиции полки не может быть двух книг (UNIQUE shelfId+position)
 *
 * При перемещении позиции других книг пересчитываются транзакционно.
 *
 * Связанные фичи: F-03, F-05
 */
@Injectable()
export class PlacementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Размещает книгу на полке.
   *
   * Алгоритм:
   * 1. Если книга уже стоит где-то — старый placement удаляется
   * 2. Если position не указана — ставим в конец полки
   * 3. Сдвигаем существующие книги для освобождения позиции
   * 4. Создаём новый placement
   *
   * Всё выполняется в одной транзакции.
   */
  async create(dto: CreatePlacementDto) {
    const { bookId, shelfId, position } = dto;

    // Проверяем существование книги и полки
    await this.ensureBookExists(bookId);
    await this.ensureShelfExists(shelfId);

    return this.prisma.$transaction(async (tx) => {
      // Удаляем старое расположение книги (если есть)
      await tx.bookPlacement.deleteMany({ where: { bookId } });

      // Определяем позицию: в конец если не указана
      let targetPosition = position;
      if (!targetPosition) {
        const lastBook = await tx.bookPlacement.findFirst({
          where: { shelfId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        targetPosition = (lastBook?.position ?? 0) + 1;
      }

      // Сдвигаем книги на целевой позиции и правее вправо (+1)
      await tx.bookPlacement.updateMany({
        where: { shelfId, position: { gte: targetPosition } },
        data: { position: { increment: 1 } },
      });

      return tx.bookPlacement.create({
        data: { bookId, shelfId, position: targetPosition },
        include: { book: true, shelf: true },
      });
    });
  }

  /**
   * Перемещает книгу: другая полка или другая позиция на той же полке.
   *
   * Алгоритм (транзакционный):
   * 1. Удаляем текущий placement (книга временно "без полки")
   * 2. Нормализуем позиции на старой полке (соседи сдвигаются влево)
   * 3. Определяем целевую позицию (конец полки если не указана)
   * 4. Сдвигаем книги на целевой полке вправо
   * 5. Создаём новый placement
   *
   * Порядок важен: нельзя сдвигать соседей пока книга ещё на старой позиции —
   * это нарушало бы UNIQUE(shelfId, position).
   */
  async update(id: string, dto: UpdatePlacementDto) {
    const placement = await this.prisma.bookPlacement.findUnique({ where: { id } });
    if (!placement) {
      throw new NotFoundException(`Placement с ID ${id} не найден`);
    }

    const targetShelfId = dto.shelfId ?? placement.shelfId;
    const targetPosition = dto.position;

    if (dto.shelfId && dto.shelfId !== placement.shelfId) {
      await this.ensureShelfExists(dto.shelfId);
    }

    const { bookId } = placement;

    return this.prisma.$transaction(async (tx) => {
      // Шаг 1: удаляем текущий placement — книга временно «без полки»
      await tx.bookPlacement.delete({ where: { id } });

      // Шаг 2: нормализуем позиции на старой полке (сдвигаем соседей влево)
      await tx.bookPlacement.updateMany({
        where: { shelfId: placement.shelfId, position: { gt: placement.position } },
        data: { position: { decrement: 1 } },
      });

      // Шаг 3: определяем новую позицию
      let newPosition = targetPosition;
      if (!newPosition) {
        const lastBook = await tx.bookPlacement.findFirst({
          where: { shelfId: targetShelfId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        newPosition = (lastBook?.position ?? 0) + 1;
      }

      // Шаг 4: освобождаем целевую позицию (сдвигаем соседей вправо)
      await tx.bookPlacement.updateMany({
        where: { shelfId: targetShelfId, position: { gte: newPosition } },
        data: { position: { increment: 1 } },
      });

      // Шаг 5: создаём новый placement
      return tx.bookPlacement.create({
        data: { bookId, shelfId: targetShelfId, position: newPosition },
        include: { book: true, shelf: true },
      });
    });
  }

  /**
   * Убирает книгу с полки. Книга остаётся в каталоге (таблица books).
   * Позиции соседних книг сдвигаются влево.
   */
  async remove(id: string) {
    const placement = await this.prisma.bookPlacement.findUnique({ where: { id } });
    if (!placement) {
      throw new NotFoundException(`Placement с ID ${id} не найден`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bookPlacement.delete({ where: { id } });

      // Нормализуем позиции: сдвигаем всё, что было правее
      await tx.bookPlacement.updateMany({
        where: { shelfId: placement.shelfId, position: { gt: placement.position } },
        data: { position: { decrement: 1 } },
      });
    });
  }

  private async ensureBookExists(bookId: string) {
    const exists = await this.prisma.book.findUnique({ where: { id: bookId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Книга с ID ${bookId} не найдена`);
  }

  private async ensureShelfExists(shelfId: string) {
    const exists = await this.prisma.shelf.findUnique({ where: { id: shelfId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Полка с ID ${shelfId} не найдена`);
  }
}
