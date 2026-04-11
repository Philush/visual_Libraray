/**
 * Утилиты для пагинации.
 *
 * Используются в сервисах для вычисления offset и формирования
 * стандартного мета-объекта в ответе.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Вычисляет offset для SQL-запроса из номера страницы.
 *
 * @example
 * getOffset({ page: 3, limit: 20 }) → 40
 */
export function getOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

/**
 * Формирует мета-объект пагинации для ответа API.
 */
export function buildPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
