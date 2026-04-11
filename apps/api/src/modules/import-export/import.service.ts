import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Сервис импорта данных в библиотеку.
 *
 * TODO: реализовать в шаге 12
 * - importFromCsv(buffer, onDuplicate): парсит CSV, создаёт книги
 * - importFromJson(buffer, mode): восстанавливает шкафы, книги и расположения
 */
@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}
}
