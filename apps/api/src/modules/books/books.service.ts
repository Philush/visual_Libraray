import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto, SortByField, SortOrder } from './dto/query-books.dto';
import { getOffset, buildPaginationMeta } from '../../shared/utils/pagination';

/**
 * Сервис управления книгами.
 *
 * Все методы принимают userId — данные фильтруются по владельцу.
 * Связанные фичи: F-02 (CRUD), F-06 (список с фильтрацией), F-09
 */
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryBooksDto, userId: string) {
    const { search, placed, genre, sortBy, order, page, limit } = query;

    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(genre && { genre: { equals: genre, mode: 'insensitive' as const } }),
      ...(placed !== undefined && {
        placement: placed ? { isNot: null } : null,
      }),
    };

    const [total, books] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        include: {
          placement: {
            include: {
              shelf: {
                include: {
                  bookcase: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { [sortBy ?? SortByField.CREATED_AT]: order ?? SortOrder.DESC },
        skip: getOffset({ page: page ?? 1, limit: limit ?? 20 }),
        take: limit ?? 20,
      }),
    ]);

    return {
      data: books,
      meta: buildPaginationMeta(total, { page: page ?? 1, limit: limit ?? 20 }),
    };
  }

  async create(dto: CreateBookDto, userId: string) {
    return this.prisma.book.create({ data: { ...dto, userId } });
  }

  async findOne(id: string, userId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
      include: {
        placement: {
          include: {
            shelf: {
              include: { bookcase: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Книга с ID ${id} не найдена`);
    }

    return book;
  }

  async update(id: string, dto: UpdateBookDto, userId: string) {
    await this.ensureExists(id, userId);
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.ensureExists(id, userId);
    return this.prisma.book.delete({ where: { id } });
  }

  async getAuthors(userId: string): Promise<string[]> {
    const results = await this.prisma.book.findMany({
      where: { userId },
      distinct: ['author'],
      select: { author: true },
      orderBy: { author: 'asc' },
    });
    return results.map((r) => r.author);
  }

  async getGenres(userId: string): Promise<string[]> {
    const results = await this.prisma.book.findMany({
      where: { userId, genre: { not: null } },
      distinct: ['genre'],
      select: { genre: true },
      orderBy: { genre: 'asc' },
    });
    return results.map((r) => r.genre!);
  }

  private async ensureExists(id: string, userId: string) {
    const exists = await this.prisma.book.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Книга с ID ${id} не найдена`);
    }
  }
}
