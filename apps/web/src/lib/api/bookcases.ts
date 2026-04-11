/**
 * API-методы для работы со шкафами и полками.
 *
 * Все методы — тонкая обёртка над базовым client.ts.
 * Типизация через @visual-library/types (shared пакет).
 */

import { get, post, patch, del } from './client';
import type {
  BookcaseListItem,
  BookcaseWithShelves,
  CreateBookcasePayload,
  UpdateBookcasePayload,
  CreateShelfPayload,
  UpdateShelfPayload,
  Shelf,
} from '@visual-library/types';

/** Получить список всех шкафов */
export const getBookcases = () => get<BookcaseListItem[]>('/bookcases');

/** Получить шкаф с полками и книгами */
export const getBookcase = (id: string) => get<BookcaseWithShelves>(`/bookcases/${id}`);

/** Создать шкаф */
export const createBookcase = (data: CreateBookcasePayload) =>
  post<BookcaseWithShelves>('/bookcases', data);

/** Обновить шкаф */
export const updateBookcase = (id: string, data: UpdateBookcasePayload) =>
  patch<BookcaseWithShelves>(`/bookcases/${id}`, data);

/** Удалить шкаф */
export const deleteBookcase = (id: string) => del(`/bookcases/${id}`);

/** Добавить полку в шкаф */
export const createShelf = (bookcaseId: string, data: CreateShelfPayload) =>
  post<Shelf>(`/bookcases/${bookcaseId}/shelves`, data);

/** Обновить полку */
export const updateShelf = (bookcaseId: string, shelfId: string, data: UpdateShelfPayload) =>
  patch<Shelf>(`/bookcases/${bookcaseId}/shelves/${shelfId}`, data);

/** Удалить полку */
export const deleteShelf = (bookcaseId: string, shelfId: string) =>
  del(`/bookcases/${bookcaseId}/shelves/${shelfId}`);
