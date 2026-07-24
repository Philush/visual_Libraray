import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';

/**
 * Сервис размещения книг на полках.
 *
 * Ключевые инварианты:
 * 1. Книга может стоять только на одной полке (UNIQUE bookId в book_placements)
 * 2. На одной позиции полки не может быть двух книг (UNIQUE shelfId+position)
 * 3. Пользователь может размещать только свои книги на своих полках (F-09)
 *
 * Связанные фичи: F-03, F-05, F-09
 */
@Injectable()
export class PlacementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Размещает книгу на полке.
   * Проверяет, что и книга, и шкаф принадлежат текущему пользователю.
   */
  async create(dto: CreatePlacementDto, userId: string) {
    const { bookId, shelfId, position } = dto;

    await this.ensureBookOwned(bookId, userId);
    await this.ensureShelfOwned(shelfId, userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.bookPlacement.deleteMany({ where: { bookId } });

      let targetPosition = position;
      if (!targetPosition) {
        const lastBook = await tx.bookPlacement.findFirst({
          where: { shelfId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        targetPosition = (lastBook?.position ?? 0) + 1;
      }

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
   * Проверяет, что placement принадлежит пользователю (через книгу).
   */
  async update(id: string, dto: UpdatePlacementDto, userId: string) {
    const placement = await this.prisma.bookPlacement.findUnique({
      where: { id },
      include: { book: { select: { userId: true } } },
    });

    if (!placement || placement.book.userId !== userId) {
      throw new NotFoundException(`Placement с ID ${id} не найден`);
    }

    const targetShelfId = dto.shelfId ?? placement.shelfId;
    const targetPosition = dto.position;

    if (dto.shelfId && dto.shelfId !== placement.shelfId) {
      await this.ensureShelfOwned(dto.shelfId, userId);
    }

    const { bookId } = placement;

    return this.prisma.$transaction(async (tx) => {
      await tx.bookPlacement.delete({ where: { id } });

      await tx.bookPlacement.updateMany({
        where: { shelfId: placement.shelfId, position: { gt: placement.position } },
        data: { position: { decrement: 1 } },
      });

      let newPosition = targetPosition;
      if (!newPosition) {
        const lastBook = await tx.bookPlacement.findFirst({
          where: { shelfId: targetShelfId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        newPosition = (lastBook?.position ?? 0) + 1;
      }

      await tx.bookPlacement.updateMany({
        where: { shelfId: targetShelfId, position: { gte: newPosition } },
        data: { position: { increment: 1 } },
      });

      return tx.bookPlacement.create({
        data: { bookId, shelfId: targetShelfId, position: newPosition },
        include: { book: true, shelf: true },
      });
    });
  }

  /** Убирает книгу с полки. Проверяет, что placement принадлежит пользователю. */
  async remove(id: string, userId: string) {
    const placement = await this.prisma.bookPlacement.findUnique({
      where: { id },
      include: { book: { select: { userId: true } } },
    });

    if (!placement || placement.book.userId !== userId) {
      throw new NotFoundException(`Placement с ID ${id} не найден`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bookPlacement.delete({ where: { id } });

      await tx.bookPlacement.updateMany({
        where: { shelfId: placement.shelfId, position: { gt: placement.position } },
        data: { position: { decrement: 1 } },
      });
    });
  }

  private async ensureBookOwned(bookId: string, userId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id: bookId, userId },
      select: { id: true },
    });
    if (!book) throw new NotFoundException(`Книга с ID ${bookId} не найдена`);
  }

  private async ensureShelfOwned(shelfId: string, userId: string) {
    const shelf = await this.prisma.shelf.findFirst({
      where: { id: shelfId, bookcase: { userId } },
      select: { id: true },
    });
    if (!shelf) throw new NotFoundException(`Полка с ID ${shelfId} не найдена`);
  }
}
