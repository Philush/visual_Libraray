'use client';

/**
 * /library — главная страница приложения.
 *
 * Отображает:
 * - Сетку карточек книжных шкафов
 * - Кнопку создания нового шкафа
 * - Empty state если шкафов нет
 *
 * Связанные фичи: F-01
 */

import { Library, Plus } from 'lucide-react';
import { Button, EmptyState, PageSpinner } from '@/components/ui';
import { BookcaseCard } from '@/components/bookcase/BookcaseCard';
import { useBookcases } from '@/hooks/useBookcases';
import { useOpenCreateModal } from '../layout';

export default function LibraryPage() {
  const { data: bookcases, isLoading, isError } = useBookcases();
  const openCreateModal = useOpenCreateModal();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={Library}
        title="Ошибка загрузки"
        description="Не удалось загрузить шкафы. Проверьте соединение с сервером."
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Шапка страницы */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Моя библиотека</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bookcases && bookcases.length > 0
              ? `${bookcases.length} ${bookcaseWord(bookcases.length)}`
              : 'Начните с создания первого шкафа'}
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Добавить шкаф
        </Button>
      </div>

      {/* Пустое состояние */}
      {bookcases?.length === 0 && (
        <EmptyState
          icon={Library}
          title="Шкафов пока нет"
          description="Создайте первый шкаф и начните расставлять книги по полкам"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Создать первый шкаф
            </Button>
          }
        />
      )}

      {/* Сетка шкафов */}
      {bookcases && bookcases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookcases.map((bc) => (
            <BookcaseCard key={bc.id} bookcase={bc} />
          ))}
        </div>
      )}
    </div>
  );
}

function bookcaseWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'шкафов';
  if (mod10 === 1) return 'шкаф';
  if (mod10 >= 2 && mod10 <= 4) return 'шкафа';
  return 'шкафов';
}
