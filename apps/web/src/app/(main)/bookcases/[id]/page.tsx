'use client';

/**
 * /bookcases/[id] — страница визуализации и управления шкафом.
 *
 * Структура страницы:
 * ┌─────────────────────────────────────┐
 * │ Заголовок (название, статистика)    │
 * ├─────────────────────────────────────┤
 * │ BookcaseDndContext                  │
 * │  ├── BookcaseCanvas (полки + книги) │
 * │  └── UnplacedBooksPanel (drag src) │
 * └─────────────────────────────────────┘
 *
 * DnD flow:
 * 1. Пользователь захватывает книгу из UnplacedBooksPanel или с полки
 * 2. Тащит на полку в BookcaseCanvas (ShelfRow подсвечивается)
 * 3. BookcaseDndContext.onDragEnd вызывает createPlacement / updatePlacement
 * 4. TanStack Query инвалидирует кэш → UI обновляется
 *
 * Связанные фичи: F-04, F-05
 */

import { use } from 'react';
import { Library, BookCopy } from 'lucide-react';
import { PageSpinner, EmptyState } from '@/components/ui';
import { BookcaseCanvas } from '@/components/bookcase/BookcaseCanvas';
import { UnplacedBooksPanel } from '@/components/bookcase/UnplacedBooksPanel';
import { BookcaseDndContext } from '@/features/bookcase/BookcaseDndContext';
import { useBookcase } from '@/hooks/useBookcases';

interface BookcasePageProps {
  params: Promise<{ id: string }>;
}

export default function BookcasePage({ params }: BookcasePageProps) {
  const { id } = use(params);
  const { data: bookcase, isLoading, isError } = useBookcase(id);

  if (isLoading) return <PageSpinner />;

  if (isError || !bookcase) {
    return (
      <EmptyState
        icon={Library}
        title="Шкаф не найден"
        description="Возможно, шкаф был удалён или ссылка устарела"
      />
    );
  }

  const totalBooks = bookcase.shelves?.reduce(
    (sum, shelf) => sum + shelf.books.length,
    0,
  ) ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-600 shrink-0" />
          {bookcase.name}
        </h1>

        {bookcase.description && (
          <p className="text-sm text-gray-500 mt-1 ml-7">{bookcase.description}</p>
        )}

        <div className="flex gap-4 mt-1.5 ml-7 text-xs text-gray-400">
          <span>{bookcase.shelves?.length ?? 0} полок</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <BookCopy className="w-3 h-3" />
            {totalBooks} книг на полках
          </span>
        </div>
      </div>

      {/* DnD-контекст оборачивает шкаф и панель unplaced книг */}
      <BookcaseDndContext bookcaseId={id}>
        {/* Визуализация шкафа */}
        <BookcaseCanvas bookcase={bookcase} />

        {/* Панель книг без полки — источник для перетаскивания */}
        <UnplacedBooksPanel />
      </BookcaseDndContext>
    </div>
  );
}
