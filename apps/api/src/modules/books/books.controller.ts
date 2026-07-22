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
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';

/**
 * Контроллер книг.
 *
 * Маршруты (все с префиксом /api/v1/):
 * GET    /books              — список книг (с поиском, фильтрацией, пагинацией)
 * GET    /books/authors      — уникальные авторы (для автокомплита)
 * GET    /books/genres       — уникальные жанры (для автокомплита)
 * POST   /books/upload-cover — загрузка обложки (multipart/form-data)
 * POST   /books              — создать книгу
 * GET    /books/:id          — получить книгу
 * PATCH  /books/:id          — обновить книгу
 * DELETE /books/:id          — удалить книгу
 *
 * ВАЖНО: статические маршруты (/authors, /genres, /upload-cover) должны
 * быть объявлены ДО параметрического /:id, иначе NestJS их не найдёт.
 *
 * Связанные фичи: F-02, F-06, F-07
 */
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get('authors')
  getAuthors() {
    return this.booksService.getAuthors();
  }

  @Get('genres')
  getGenres() {
    return this.booksService.getGenres();
  }

  @Post('upload-cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/covers',
        filename: (_req, file, cb) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${suffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Можно загружать только изображения'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  uploadCover(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('Файл не передан');
    const coverUrl = `${req.protocol}://${req.get('host')}/uploads/covers/${file.filename}`;
    return { coverUrl };
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
