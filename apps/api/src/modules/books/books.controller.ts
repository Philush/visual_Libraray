import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

/**
 * Контроллер книг.
 *
 * Маршруты (все с префиксом /api/v1/):
 * GET    /books       — список книг (с поиском, фильтрацией, пагинацией)
 * POST   /books       — создать книгу
 * GET    /books/:id   — получить книгу
 * PATCH  /books/:id   — обновить книгу
 * DELETE /books/:id   — удалить книгу
 *
 * Связанные фичи: F-02, F-06
 */
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}
