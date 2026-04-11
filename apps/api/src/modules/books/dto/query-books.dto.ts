import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Поля для сортировки книг.
 */
export enum SortByField {
  TITLE = 'title',
  AUTHOR = 'author',
  YEAR = 'publishYear',
  CREATED_AT = 'createdAt',
}

/**
 * Направление сортировки.
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * DTO query-параметров для списка книг.
 *
 * Все параметры опциональны — список работает без фильтрации.
 * Transform декораторы нужны, т.к. query params приходят как строки.
 */
export class QueryBooksDto {
  /** Поиск по названию и автору (регистронезависимый) */
  @IsString()
  @IsOptional()
  search?: string;

  /** Фильтр по наличию на полке: true = на полке, false = без полки */
  @IsBoolean()
  @IsOptional()
  // @Type(() => String) отключает enableImplicitConversion для этого поля,
  // иначе Boolean('false') = true перезаписывает @Transform результат.
  @Type(() => String)
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  placed?: boolean;

  /** Фильтр по жанру */
  @IsString()
  @IsOptional()
  genre?: string;

  @IsEnum(SortByField)
  @IsOptional()
  sortBy?: SortByField;

  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;
}
