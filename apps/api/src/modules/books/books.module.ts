import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookLookupService } from './book-lookup.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, BookLookupService],
  exports: [BooksService],
})
export class BooksModule {}
