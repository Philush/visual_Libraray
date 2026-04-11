/**
 * Глобальные константы приложения.
 * При добавлении новых — группировать по смыслу.
 */

/** Пагинация */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Ограничения полей */
export const MAX_BOOKCASE_NAME_LENGTH = 100;
export const MAX_BOOK_NOTES_LENGTH = 2000;
export const MAX_SHELVES_PER_BOOKCASE = 20;
export const MIN_SHELVES_PER_BOOKCASE = 1;

/** Импорт/экспорт */
export const MAX_IMPORT_FILE_SIZE_MB = 10;
export const MAX_IMPORT_FILE_SIZE_BYTES = MAX_IMPORT_FILE_SIZE_MB * 1024 * 1024;

/** Ключи для TanStack Query (инвалидация кэша) */
export const QUERY_KEYS = {
  bookcases: ['bookcases'] as const,
  bookcase: (id: string) => ['bookcases', id] as const,
  books: ['books'] as const,
  book: (id: string) => ['books', id] as const,
  placements: ['placements'] as const,
} as const;
