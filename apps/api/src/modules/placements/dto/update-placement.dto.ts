import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO обновления расположения книги.
 * Хотя бы одно поле должно быть передано (проверяется в сервисе).
 */
export class UpdatePlacementDto {
  /** Переместить на другую полку */
  @IsUUID('4')
  @IsOptional()
  shelfId?: string;

  /** Изменить позицию на полке */
  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;
}
