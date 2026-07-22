import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto, SortByField, SortOrder } from './dto/query-books.dto';
import { getOffset, buildPaginationMeta } from '../../shared/utils/pagination';

/**
 * Сервис управления книгами.
 *
 * Связанные фичи: F-02 (CRUD), F-06 (список с фильтрацией)
 */
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает список книг с пагинацией, поиском и фильтрацией.
   *
   * Поиск по title и author — регистронезависимый (mode: 'insensitive').
   * Пагинация — offset-based (подходит для текущего масштаба).
   */
  async findAll(query: QueryBooksDto) {
    const { search, placed, genre, sortBy, order, page, limit } = query;

    // Строим условие WHERE динамически
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(genre && { genre: { equals: genre, mode: 'insensitive' as const } }),
      // Фильтр по наличию на полке: placed=true → есть placement, false → нет
      ...(placed !== undefined && {
        placement: placed ? { isNot: null } : null,
      }),
    };

    const [total, books] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        include: {
          // Включаем данные о расположении книги
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

  async create(dto: CreateBookDto) {
    return this.prisma.book.create({ data: dto });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
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

  async update(id: string, dto: UpdateBookDto) {
    await this.ensureExists(id);
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  /**
   * Удаляет книгу.
   * BookPlacement удаляется каскадно (настроено в Prisma schema).
   */
  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.book.delete({ where: { id } });
  }

  async getAuthors(): Promise<string[]> {
    const results = await this.prisma.book.findMany({
      distinct: ['author'],
      select: { author: true },
      orderBy: { author: 'asc' },
    });
    return results.map((r) => r.author);
  }

  async getGenres(): Promise<string[]> {
    const results = await this.prisma.book.findMany({
      distinct: ['genre'],
      select: { genre: true },
      where: { genre: { not: null } },
      orderBy: { genre: 'asc' },
    });
    return results.map((r) => r.genre!);
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.book.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Книга с ID ${id} не найдена`);
    }
  }
}
