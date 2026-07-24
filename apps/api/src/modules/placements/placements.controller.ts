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
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';

/**
 * Контроллер размещения книг.
 *
 * Все маршруты защищены JWT. Проверяет принадлежность книг и шкафов пользователю (F-09).
 *
 * Маршруты (все с префиксом /api/v1/):
 * POST   /placements       — разместить книгу на полке
 * PATCH  /placements/:id   — переместить книгу (другая полка или позиция)
 * DELETE /placements/:id   — убрать книгу с полки (книга остаётся в каталоге)
 *
 * Связанные фичи: F-03, F-05, F-09
 */
@UseGuards(JwtAuthGuard)
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePlacementDto, @CurrentUser() userId: string) {
    return this.placementsService.create(dto, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlacementDto,
    @CurrentUser() userId: string,
  ) {
    return this.placementsService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() userId: string) {
    return this.placementsService.remove(id, userId);
  }
}
