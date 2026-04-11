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
import { toast } from 'sonner';
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcases });
      toast.success('Шкаф создан');
    },
    onError: () => {
      toast.error('Не удалось создать шкаф');
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
      toast.success('Шкаф обновлён');
    },
    onError: () => {
      toast.error('Не удалось обновить шкаф');
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      toast.success('Шкаф удалён');
    },
    onError: () => {
      toast.error('Не удалось удалить шкаф');
    },
  });
}
