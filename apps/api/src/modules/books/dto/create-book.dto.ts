import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsUrl,
  Matches,
} from 'class-validator';

/**
 * DTO создания книги.
 *
 * Обязательные поля: title, author.
 * Остальные — опциональны, могут быть заполнены позже или через F-11 (внешние API).
 */
export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Название книги не может быть пустым' })
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Автор книги не может быть пустым' })
  @MaxLength(500)
  author!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  isbn?: string;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Количество страниц должно быть больше 0' })
  pageCount?: number;

  @IsUrl({}, { message: 'coverUrl должен быть валидным URL' })
  @IsOptional()
  coverUrl?: string;

  /**
   * Цвет корешка в HEX формате (#RRGGBB).
   * Если не указан — генерируется на фронтенде из title+author.
   */
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'spineColor должен быть в формате #RRGGBB' })
  spineColor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  genre?: string;

  @IsInt()
  @IsOptional()
  @Min(1000)
  @Max(new Date().getFullYear())
  publishYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Заметки не могут превышать 2000 символов' })
  notes?: string;
}
