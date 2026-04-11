'use client';

/**
 * TanStack Query хуки для работы с книгами.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks, getBook, createBook, updateBook, deleteBook, type GetBooksParams } from '@/lib/api/books';
import { QUERY_KEYS } from '@/lib/constants';
import type { CreateBookPayload } from '@visual-library/types';

/** Список книг с фильтрацией и пагинацией */
export function useBooks(params: GetBooksParams = {}) {
  return useQuery({
    // Включаем params в ключ — при изменении фильтров идёт новый запрос
    queryKey: [...QUERY_KEYS.books, params],
    queryFn: () => getBooks(params),
  });
}

/** Книга по ID */
export function useBook(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.book(id),
    queryFn: () => getBook(id),
    enabled: Boolean(id),
  });
}

/** Мутация: создание книги */
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookPayload) => createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
    },
  });
}

/** Мутация: обновление книги */
export function useUpdateBook(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateBookPayload>) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.book(id) });
    },
  });
}

/** Мутация: удаление книги */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
    },
  });
}
