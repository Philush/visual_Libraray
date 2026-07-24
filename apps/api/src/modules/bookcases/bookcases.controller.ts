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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { BookcasesService } from './bookcases.service';
import { CreateBookcaseDto } from './dto/create-bookcase.dto';
import { UpdateBookcaseDto } from './dto/update-bookcase.dto';

/**
 * Контроллер книжных шкафов.
 *
 * Все маршруты защищены JWT. Данные фильтруются по владельцу (F-09).
 *
 * Маршруты (все с префиксом /api/v1/):
 * GET    /bookcases           — список шкафов текущего пользователя
 * POST   /bookcases           — создать шкаф
 * GET    /bookcases/:id       — получить шкаф с полками и книгами
 * PATCH  /bookcases/:id       — обновить шкаф
 * DELETE /bookcases/:id       — удалить шкаф
 *
 * Связанные фичи: F-01, F-09
 */
@UseGuards(JwtAuthGuard)
@Controller('bookcases')
export class BookcasesController {
  constructor(private readonly bookcasesService: BookcasesService) {}

  @Get()
  findAll(@CurrentUser() userId: string) {
    return this.bookcasesService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookcaseDto, @CurrentUser() userId: string) {
    return this.bookcasesService.create(dto, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() userId: string) {
    return this.bookcasesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookcaseDto,
    @CurrentUser() userId: string,
  ) {
    return this.bookcasesService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() userId: string) {
    return this.bookcasesService.remove(id, userId);
  }
}
