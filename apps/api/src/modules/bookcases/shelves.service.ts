import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

/**
 * Сервис управления полками внутри шкафа.
 *
 * Все операции проверяют принадлежность шкафа текущему пользователю.
 * Связанные фичи: F-01, F-09
 */
@Injectable()
export class ShelvesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(bookcaseId: string, dto: CreateShelfDto, userId: string) {
    await this.ensureBookcaseExists(bookcaseId, userId);

    let position = dto.position;

    if (!position) {
      const lastShelf = await this.prisma.shelf.findFirst({
        where: { bookcaseId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      position = (lastShelf?.position ?? 0) + 1;
    }

    return this.prisma.shelf.create({
      data: { bookcaseId, position, label: dto.label },
    });
  }

  async update(bookcaseId: string, shelfId: string, dto: UpdateShelfDto, userId: string) {
    await this.ensureShelfExists(bookcaseId, shelfId, userId);

    return this.prisma.shelf.update({
      where: { id: shelfId },
      data: dto,
    });
  }

  async remove(bookcaseId: string, shelfId: string, userId: string) {
    await this.ensureShelfExists(bookcaseId, shelfId, userId);

    const shelvesCount = await this.prisma.shelf.count({ where: { bookcaseId } });
    if (shelvesCount <= 1) {
      throw new ConflictException('Нельзя удалить единственную полку в шкафу');
    }

    return this.prisma.shelf.delete({ where: { id: shelfId } });
  }

  private async ensureBookcaseExists(bookcaseId: string, userId: string) {
    const exists = await this.prisma.bookcase.findFirst({
      where: { id: bookcaseId, userId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Шкаф с ID ${bookcaseId} не найден`);
    }
  }

  private async ensureShelfExists(bookcaseId: string, shelfId: string, userId: string) {
    const exists = await this.prisma.shelf.findFirst({
      where: { id: shelfId, bookcaseId, bookcase: { userId } },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Полка с ID ${shelfId} не найдена в шкафу ${bookcaseId}`);
    }
  }
}
