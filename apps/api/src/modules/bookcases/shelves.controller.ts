import {
  Controller,
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
import { ShelvesService } from './shelves.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

/**
 * Контроллер полок (nested resource под шкафом).
 *
 * Все маршруты защищены JWT. Операции проверяют принадлежность шкафа пользователю (F-09).
 *
 * Маршруты (все с префиксом /api/v1/):
 * POST   /bookcases/:bookcaseId/shelves          — добавить полку
 * PATCH  /bookcases/:bookcaseId/shelves/:shelfId — обновить полку
 * DELETE /bookcases/:bookcaseId/shelves/:shelfId — удалить полку
 *
 * Связанные фичи: F-01, F-09
 */
@UseGuards(JwtAuthGuard)
@Controller('bookcases/:bookcaseId/shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Body() dto: CreateShelfDto,
    @CurrentUser() userId: string,
  ) {
    return this.shelvesService.create(bookcaseId, dto, userId);
  }

  @Patch(':shelfId')
  update(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
    @Body() dto: UpdateShelfDto,
    @CurrentUser() userId: string,
  ) {
    return this.shelvesService.update(bookcaseId, shelfId, dto, userId);
  }

  @Delete(':shelfId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
    @CurrentUser() userId: string,
  ) {
    return this.shelvesService.remove(bookcaseId, shelfId, userId);
  }
}
