import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * DTO создания полки в шкафу.
 */
export class CreateShelfDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  position?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;
}
