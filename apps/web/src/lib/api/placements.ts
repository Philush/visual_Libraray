/**
 * API-методы для размещения книг на полках.
 */

import { post, patch, del } from './client';
import type {
  BookPlacement,
  CreatePlacementPayload,
  UpdatePlacementPayload,
} from '@visual-library/types';

/** Разместить книгу на полке */
export const createPlacement = (data: CreatePlacementPayload) =>
  post<BookPlacement>('/placements', data);

/** Переместить книгу (другая полка или позиция) */
export const updatePlacement = (id: string, data: UpdatePlacementPayload) =>
  patch<BookPlacement>(`/placements/${id}`, data);

/** Убрать книгу с полки */
export const deletePlacement = (id: string) => del(`/placements/${id}`);
