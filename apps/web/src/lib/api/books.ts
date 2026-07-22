/**
 * API-методы для работы с книгами.
 */

import { get, post, patch, del, API_BASE_URL } from './client';
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

/** Загрузить обложку книги, вернуть URL */
export async function uploadBookCover(file: File): Promise<{ coverUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/books/upload-cover`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить обложку');
  }

  return response.json() as Promise<{ coverUrl: string }>;
}

/** Уникальные авторы для автокомплита */
export const getBookAuthors = () => get<string[]>('/books/authors');

/** Уникальные жанры для автокомплита */
export const getBookGenres = () => get<string[]>('/books/genres');
