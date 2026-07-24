import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookcaseDto } from './dto/create-bookcase.dto';
import { UpdateBookcaseDto } from './dto/update-bookcase.dto';

/**
 * Сервис управления книжными шкафами.
 *
 * Все методы принимают userId — данные фильтруются по владельцу.
 * Связанные фичи: F-01, F-09
 */
@Injectable()
export class BookcasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const bookcases = await this.prisma.bookcase.findMany({
      where: { userId },
      include: {
        shelves: {
          include: {
            books: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return bookcases.map((bc) => ({
      id: bc.id,
      name: bc.name,
      description: bc.description,
      shelvesCount: bc.shelves.length,
      booksCount: bc.shelves.reduce((sum, shelf) => sum + shelf.books.length, 0),
      createdAt: bc.createdAt,
      updatedAt: bc.updatedAt,
    }));
  }

  async create(dto: CreateBookcaseDto, userId: string) {
    return this.prisma.bookcase.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
        shelves: {
          create: Array.from({ length: dto.shelvesCount }, (_, i) => ({
            position: i + 1,
          })),
        },
      },
      include: { shelves: { orderBy: { position: 'asc' } } },
    });
  }

  async findOne(id: string, userId: string) {
    const bookcase = await this.prisma.bookcase.findFirst({
      where: { id, userId },
      include: {
        shelves: {
          orderBy: { position: 'asc' },
          include: {
            books: {
              orderBy: { position: 'asc' },
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    pageCount: true,
                    spineColor: true,
                    coverUrl: true,
                    genre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!bookcase) {
      throw new NotFoundException(`Шкаф с ID ${id} не найден`);
    }

    return bookcase;
  }

  async update(id: string, dto: UpdateBookcaseDto, userId: string) {
    await this.ensureExists(id, userId);

    return this.prisma.bookcase.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureExists(id, userId);

    return this.prisma.bookcase.delete({ where: { id } });
  }

  private async ensureExists(id: string, userId: string) {
    const exists = await this.prisma.bookcase.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Шкаф с ID ${id} не найден`);
    }
  }
}
