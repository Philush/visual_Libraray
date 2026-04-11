/**
 * Типы API-запросов и ответов.
 * Контракты между фронтендом и бэкендом.
 */

/** Стандартный формат ошибки от API */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

/** DTO создания шкафа */
export interface CreateBookcasePayload {
  name: string;
  description?: string;
  shelvesCount: number;
}

/** DTO обновления шкафа */
export interface UpdateBookcasePayload {
  name?: string;
  description?: string;
}

/** DTO создания полки */
export interface CreateShelfPayload {
  position?: number;
  label?: string;
}

/** DTO обновления полки */
export interface UpdateShelfPayload {
  position?: number;
  label?: string;
}

/** DTO размещения книги */
export interface CreatePlacementPayload {
  bookId: string;
  shelfId: string;
  position?: number;
}

/** DTO перемещения книги */
export interface UpdatePlacementPayload {
  shelfId?: string;
  position?: number;
}
