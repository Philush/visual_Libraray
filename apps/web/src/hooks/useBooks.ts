'use client';

/**
 * TanStack Query хуки для работы с книгами.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBooks, getBook, createBook, updateBook, deleteBook, getBookAuthors, getBookGenres, type GetBooksParams } from '@/lib/api/books';
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
      toast.success('Книга добавлена в каталог');
    },
    onError: () => {
      toast.error('Не удалось добавить книгу');
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
      toast.success('Данные книги сохранены');
    },
    onError: () => {
      toast.error('Не удалось сохранить изменения');
    },
  });
}

/** Уникальные авторы для автокомплита */
export function useBookAuthors() {
  return useQuery({
    queryKey: ['books', 'authors'],
    queryFn: getBookAuthors,
    staleTime: 60_000,
  });
}

/** Уникальные жанры для автокомплита */
export function useBookGenres() {
  return useQuery({
    queryKey: ['books', 'genres'],
    queryFn: getBookGenres,
    staleTime: 60_000,
  });
}

/** Мутация: удаление книги */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      toast.success('Книга удалена из каталога');
    },
    onError: () => {
      toast.error('Не удалось удалить книгу');
    },
  });
}
