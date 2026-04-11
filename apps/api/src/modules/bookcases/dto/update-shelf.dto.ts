import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * DTO обновления полки. Все поля опциональны.
 */
export class UpdateShelfDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;
}
