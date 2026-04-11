import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO обновления книжного шкафа.
 * Все поля опциональны — обновляем только то, что передано.
 */
export class UpdateBookcaseDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
