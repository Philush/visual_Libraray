import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO размещения книги на полке.
 */
export class CreatePlacementDto {
  @IsUUID('4', { message: 'bookId должен быть валидным UUID' })
  bookId!: string;

  @IsUUID('4', { message: 'shelfId должен быть валидным UUID' })
  shelfId!: string;

  /** Позиция на полке (слева направо). Если не указана — ставится в конец. */
  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;
}
