import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookcaseDto } from './dto/create-bookcase.dto';
import { UpdateBookcaseDto } from './dto/update-bookcase.dto';

/**
 * Сервис управления книжными шкафами.
 *
 * Содержит всю бизнес-логику работы со шкафами.
 * Контроллер только маршрутизирует запросы, логика — здесь.
 *
 * Связанные фичи: F-01
 */
@Injectable()
export class BookcasesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает все шкафы с количеством полок и книг.
   * Используется для списка шкафов на главной странице.
   */
  async findAll() {
    const bookcases = await this.prisma.bookcase.findMany({
      include: {
        shelves: {
          include: {
            // Считаем книги на каждой полке
            books: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Агрегируем счётчики на уровне приложения (не SQL) для простоты
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

  /**
   * Создаёт шкаф с указанным количеством полок.
   * Полки нумеруются сверху вниз: position 1 = верхняя.
   */
  async create(dto: CreateBookcaseDto) {
    return this.prisma.bookcase.create({
      data: {
        name: dto.name,
        description: dto.description,
        shelves: {
          // Создаём все полки одной транзакцией через вложенный create
          create: Array.from({ length: dto.shelvesCount }, (_, i) => ({
            position: i + 1,
          })),
        },
      },
      include: { shelves: { orderBy: { position: 'asc' } } },
    });
  }

  /**
   * Возвращает шкаф с полками и книгами на них.
   * Используется для страницы визуализации шкафа (F-04).
   */
  async findOne(id: string) {
    const bookcase = await this.prisma.bookcase.findUnique({
      where: { id },
      include: {
        shelves: {
          orderBy: { position: 'asc' },
          include: {
            books: {
              orderBy: { position: 'asc' },
              include: {
                // Включаем данные книги для рендера корешка
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

  async update(id: string, dto: UpdateBookcaseDto) {
    await this.ensureExists(id);

    return this.prisma.bookcase.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Удаляет шкаф.
   *
   * Все book_placements, привязанные к полкам этого шкафа, удаляются каскадно
   * (настроено в Prisma schema через onDelete: Cascade на Shelf → BookPlacement).
   * Сами книги (таблица books) НЕ удаляются — только их расположение.
   */
  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.bookcase.delete({ where: { id } });
  }

  /**
   * Проверяет существование шкафа. Бросает 404 если не найден.
   * Используется перед update/delete для явного сообщения об ошибке.
   */
  private async ensureExists(id: string) {
    const exists = await this.prisma.bookcase.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException(`Шкаф с ID ${id} не найден`);
    }
  }
}
