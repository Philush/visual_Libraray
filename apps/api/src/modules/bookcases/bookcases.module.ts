import { Module } from '@nestjs/common';
import { BookcasesController } from './bookcases.controller';
import { BookcasesService } from './bookcases.service';
import { ShelvesController } from './shelves.controller';
import { ShelvesService } from './shelves.service';

/**
 * Модуль управления книжными шкафами и полками.
 *
 * Отвечает за F-01: создание шкафов, управление полками.
 * PrismaService инжектируется автоматически (глобальный модуль).
 */
@Module({
  controllers: [BookcasesController, ShelvesController],
  providers: [BookcasesService, ShelvesService],
  // Экспортируем сервисы на случай если другой модуль (например, placements)
  // захочет проверить существование полки.
  exports: [BookcasesService, ShelvesService],
})
export class BookcasesModule {}
