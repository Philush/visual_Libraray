import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Сервис экспорта библиотеки.
 *
 * TODO: реализовать в шаге 12
 * - exportToCsv(): возвращает строку CSV
 * - exportToJson(): возвращает объект для сериализации в JSON
 */
@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}
}
