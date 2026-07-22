/**
 * Типы для книг и их расположения.
 * Используются и на фронтенде, и на бэкенде.
 */

/** Полные данные книги */
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  pageCount: number | null;
  coverUrl: string | null;
  spineColor: string | null;
  genre: string | null;
  publishYear: number | null;
  notes: string | null;
  rating: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Размещение книги на полке */
export interface BookPlacement {
  id: string;
  bookId: string;
  shelfId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

/** Информация о расположении книги (для отображения в списке) */
export interface BookPlacementInfo {
  shelfId: string;
  bookcaseId: string;
  bookcaseName: string;
  shelfPosition: number;
  positionOnShelf: number;
}

/** Книга с данными о расположении */
export interface BookWithPlacement extends Book {
  placement: BookPlacementInfo | null;
}

/** Мета-информация пагинации */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Пагинированный список */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** DTO создания книги (используется в форме на фронтенде) */
export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  pageCount?: number;
  coverUrl?: string;
  spineColor?: string;
  genre?: string;
  publishYear?: number;
  notes?: string;
  rating?: number;
}
