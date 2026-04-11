'use client';

/**
 * TanStack Query хуки для работы со шкафами.
 *
 * Разделение ответственности:
 * - useBookcases()        — список шкафов (используется в Sidebar и LibraryPage)
 * - useBookcase(id)       — шкаф с полками и книгами (страница визуализации)
 * - useCreateBookcase()   — мутация создания шкафа
 * - useUpdateBookcase()   — мутация обновления шкафа
 * - useDeleteBookcase()   — мутация удаления шкафа
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookcases,
  getBookcase,
  createBookcase,
  updateBookcase,
  deleteBookcase,
} from '@/lib/api/bookcases';
import { QUERY_KEYS } from '@/lib/constants';
import type { CreateBookcasePayload, UpdateBookcasePayload } from '@visual-library/types';

/** Список всех шкафов */
export function useBookcases() {
  return useQuery({
    queryKey: QUERY_KEYS.bookcases,
    queryFn: getBookcases,
  });
}

/** Шкаф по ID с полками и книгами */
export function useBookcase(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.bookcase(id),
    queryFn: () => getBookcase(id),
    // Данные шкафа запрашиваем только если id задан
    enabled: Boolean(id),
  });
}

/** Мутация: создание шкафа */
export function useCreateBookcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookcasePayload) => createBookcase(data),
    onSuccess: () => {
      // Инвалидируем список шкафов — Sidebar и LibraryPage перезагрузятся
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcases });
    },
  });
}

/** Мутация: обновление шкафа */
export function useUpdateBookcase(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBookcasePayload) => updateBookcase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcases });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcase(id) });
    },
  });
}

/** Мутация: удаление шкафа */
export function useDeleteBookcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBookcase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcases });
      // Инвалидируем книги — некоторые могут стать unplaced
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
    },
  });
}
