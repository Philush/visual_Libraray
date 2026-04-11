import { Module } from '@nestjs/common';
import { PlacementsController } from './placements.controller';
import { PlacementsService } from './placements.service';

/**
 * Модуль размещения книг на полках.
 *
 * Отвечает за F-03 (привязка книги к полке) и F-05 (drag & drop на бэкенде).
 * Является связующим звеном между Books и Bookcases/Shelves.
 */
@Module({
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule {}
