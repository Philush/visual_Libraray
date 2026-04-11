import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

/**
 * Модуль управления книгами (каталог).
 *
 * Отвечает за F-02 (CRUD книг) и F-06 (список с фильтрацией).
 */
@Module({
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
