import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

/**
 * Сервис управления полками внутри шкафа.
 *
 * Связанные фичи: F-01
 */
@Injectable()
export class ShelvesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Добавляет полку в шкаф.
   *
   * Если position не указана — полка добавляется в конец
   * (position = max(existing positions) + 1).
   */
  async create(bookcaseId: string, dto: CreateShelfDto) {
    await this.ensureBookcaseExists(bookcaseId);

    let position = dto.position;

    if (!position) {
      // Определяем следующую позицию (в конец)
      const lastShelf = await this.prisma.shelf.findFirst({
        where: { bookcaseId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = (lastShelf?.position ?? 0) + 1;
    }

    return this.prisma.shelf.create({
      data: {
        bookcaseId,
        position,
        label: dto.label,
      },
    });
  }

  async update(bookcaseId: string, shelfId: string, dto: UpdateShelfDto) {
    await this.ensureShelfExists(bookcaseId, shelfId);

    return this.prisma.shelf.update({
      where: { id: shelfId },
      data: dto,
    });
  }

  /**
   * Удаляет полку из шкафа.
   *
   * Ограничения:
   * - Нельзя удалить последнюю полку в шкафу (минимум 1).
   * - BookPlacements удаляются каскадно (Prisma schema).
   * - Книги (books) не удаляются.
   */
  async remove(bookcaseId: string, shelfId: string) {
    await this.ensureShelfExists(bookcaseId, shelfId);

    // Проверяем, что это не последняя полка
    const shelvesCount = await this.prisma.shelf.count({ where: { bookcaseId } });
    if (shelvesCount <= 1) {
      throw new ConflictException('Нельзя удалить единственную полку в шкафу');
    }

    return this.prisma.shelf.delete({ where: { id: shelfId } });
  }

  private async ensureBookcaseExists(bookcaseId: string) {
    const exists = await this.prisma.bookcase.findUnique({
      where: { id: bookcaseId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Шкаф с ID ${bookcaseId} не найден`);
    }
  }

  private async ensureShelfExists(bookcaseId: string, shelfId: string) {
    const exists = await this.prisma.shelf.findFirst({
      where: { id: shelfId, bookcaseId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Полка с ID ${shelfId} не найдена в шкафу ${bookcaseId}`);
    }
  }
}
