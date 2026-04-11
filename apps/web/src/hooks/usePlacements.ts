'use client';

/**
 * TanStack Query хуки для размещения книг на полках.
 *
 * Все мутации принимают `bookcaseId` — после успеха инвалидируют:
 * 1. Конкретный шкаф (QUERY_KEYS.bookcase) → ShelfRow обновляет книги
 * 2. Список книг (QUERY_KEYS.books) → UnplacedBooksPanel обновляется
 *
 * Связанные фичи: F-03, F-05
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPlacement, updatePlacement, deletePlacement } from '@/lib/api/placements';
import { QUERY_KEYS } from '@/lib/constants';
import type { CreatePlacementPayload, UpdatePlacementPayload } from '@visual-library/types';

/** Мутация: разместить книгу на полке */
export function useCreatePlacement(bookcaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlacementPayload) => createPlacement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcase(bookcaseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      toast.success('Книга поставлена на полку');
    },
    onError: () => {
      toast.error('Не удалось поставить книгу на полку');
    },
  });
}

/** Мутация: переместить книгу (другая полка или позиция) */
export function useUpdatePlacement(bookcaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdatePlacementPayload) =>
      updatePlacement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcase(bookcaseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      toast.success('Книга перемещена');
    },
    onError: () => {
      toast.error('Не удалось переместить книгу');
    },
  });
}

/** Мутация: убрать книгу с полки (книга остаётся в каталоге) */
export function useDeletePlacement(bookcaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placementId: string) => deletePlacement(placementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookcase(bookcaseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      toast.success('Книга убрана с полки');
    },
    onError: () => {
      toast.error('Не удалось убрать книгу с полки');
    },
  });
}
