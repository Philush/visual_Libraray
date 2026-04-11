import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookcasesService } from './bookcases.service';
import { CreateBookcaseDto } from './dto/create-bookcase.dto';
import { UpdateBookcaseDto } from './dto/update-bookcase.dto';

/**
 * Контроллер книжных шкафов.
 *
 * Маршруты (все с префиксом /api/v1/):
 * GET    /bookcases           — список всех шкафов
 * POST   /bookcases           — создать шкаф
 * GET    /bookcases/:id       — получить шкаф с полками и книгами
 * PATCH  /bookcases/:id       — обновить шкаф
 * DELETE /bookcases/:id       — удалить шкаф
 *
 * Связанные фичи: F-01
 */
@Controller('bookcases')
export class BookcasesController {
  constructor(private readonly bookcasesService: BookcasesService) {}

  @Get()
  findAll() {
    return this.bookcasesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookcaseDto) {
    return this.bookcasesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookcasesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookcaseDto) {
    return this.bookcasesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookcasesService.remove(id);
  }
}
