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
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';

/**
 * Контроллер размещения книг.
 *
 * Маршруты (все с префиксом /api/v1/):
 * POST   /placements       — разместить книгу на полке
 * PATCH  /placements/:id   — переместить книгу (другая полка или позиция)
 * DELETE /placements/:id   — убрать книгу с полки (книга остаётся в каталоге)
 *
 * Связанные фичи: F-03, F-05
 */
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePlacementDto) {
    return this.placementsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlacementDto) {
    return this.placementsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.placementsService.remove(id);
  }
}
