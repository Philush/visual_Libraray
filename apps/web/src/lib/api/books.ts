/**
 * API-методы для работы с книгами.
 */

import { get, post, patch, del } from './client';
import type {
  Book,
  BookWithPlacement,
  PaginatedResponse,
  CreateBookPayload,
} from '@visual-library/types';

/** Параметры запроса списка книг */
export interface GetBooksParams {
  search?: string;
  placed?: boolean;
  genre?: string;
  sortBy?: 'title' | 'author' | 'publishYear' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Построить query string из параметров */
function buildQuery(params: GetBooksParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

/** Получить список книг */
export const getBooks = (params: GetBooksParams = {}) =>
  get<PaginatedResponse<BookWithPlacement>>(`/books${buildQuery(params)}`);

/** Получить книгу по ID */
export const getBook = (id: string) => get<BookWithPlacement>(`/books/${id}`);

/** Создать книгу */
export const createBook = (data: CreateBookPayload) => post<Book>('/books', data);

/** Обновить книгу */
export const updateBook = (id: string, data: Partial<CreateBookPayload>) =>
  patch<Book>(`/books/${id}`, data);

/** Удалить книгу */
export const deleteBook = (id: string) => del(`/books/${id}`);
