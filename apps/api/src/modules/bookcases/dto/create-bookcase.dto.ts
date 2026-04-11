import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

/**
 * DTO создания книжного шкафа.
 * Валидируется автоматически через глобальный ValidationPipe.
 */
export class CreateBookcaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Название шкафа не может быть пустым' })
  @MaxLength(100, { message: 'Название шкафа не может превышать 100 символов' })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Количество полок должно быть целым числом' })
  @Min(1, { message: 'Минимальное количество полок: 1' })
  @Max(20, { message: 'Максимальное количество полок: 20' })
  shelvesCount!: number;
}
