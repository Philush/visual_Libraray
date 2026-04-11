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
} from '@nestjs/common';
import { ShelvesService } from './shelves.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

/**
 * Контроллер полок (nested resource под шкафом).
 *
 * Маршруты (все с префиксом /api/v1/):
 * POST   /bookcases/:bookcaseId/shelves          — добавить полку
 * PATCH  /bookcases/:bookcaseId/shelves/:shelfId — обновить полку
 * DELETE /bookcases/:bookcaseId/shelves/:shelfId — удалить полку
 *
 * Связанные фичи: F-01
 */
@Controller('bookcases/:bookcaseId/shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Body() dto: CreateShelfDto,
  ) {
    return this.shelvesService.create(bookcaseId, dto);
  }

  @Patch(':shelfId')
  update(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
    @Body() dto: UpdateShelfDto,
  ) {
    return this.shelvesService.update(bookcaseId, shelfId, dto);
  }

  @Delete(':shelfId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('bookcaseId', ParseUUIDPipe) bookcaseId: string,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
  ) {
    return this.shelvesService.remove(bookcaseId, shelfId);
  }
}
