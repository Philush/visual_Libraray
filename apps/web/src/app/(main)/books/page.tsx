'use client';

/**
 * /books — страница каталога всех книг.
 *
 * Отображает:
 * - Таблицу книг с поиском и фильтрацией
 * - Пагинацию
 * - Кнопку добавления книги
 *
 * Связанные фичи: F-02, F-06
 */

import { useState } from 'react';
import { BookCopy, Plus } from 'lucide-react';
import { Button, EmptyState, PageSpinner } from '@/components/ui';
import { BookFilters } from '@/components/books/BookFilters';
import { BookRow } from '@/components/books/BookRow';
import { AddBookModal } from '@/features/books/AddBookModal';
import { EditBookModal } from '@/features/books/EditBookModal';
import { ImportExportPanel } from '@/features/books/ImportExportPanel';
import { useBooks } from '@/hooks/useBooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { GetBooksParams } from '@/lib/api/books';
import type { BookWithPlacement } from '@visual-library/types';

export default function BooksPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookWithPlacement | null>(null);
  const [filterParams, setFilterParams] = useState<GetBooksParams>({
    sortBy: 'createdAt',
    order: 'desc',
    limit: 50,
  });

  // Дебаунс поиска — не посылаем запрос на каждый символ
  const debouncedParams = useDebounce(filterParams, 300);

  const { data, isLoading, isError } = useBooks(debouncedParams);

  if (isLoading) return <PageSpinner />;

  if (isError) {
    return (
      <EmptyState
        icon={BookCopy}
        title="Ошибка загрузки"
        description="Не удалось загрузить список книг. Проверьте соединение."
      />
    );
  }

  const books = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Все книги</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} ${bookWord(total)}` : 'Библиотека пока пустая'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExportPanel />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Добавить книгу
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-4">
        <BookFilters params={filterParams} onChange={setFilterParams} />
      </div>

      {/* Пустое состояние — нет книг вообще */}
      {total === 0 && !filterParams.search && filterParams.placed === undefined && (
        <EmptyState
          icon={BookCopy}
          title="Библиотека пустая"
          description="Добавьте первую книгу — вручную или через импорт"
          action={
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Добавить книгу
            </Button>
          }
        />
      )}

      {/* Пустое состояние — фильтр не дал результатов */}
      {books.length === 0 && (filterParams.search || filterParams.placed !== undefined) && (
        <EmptyState
          icon={BookCopy}
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска или фильтры"
        />
      )}

      {/* Таблица книг */}
      {books.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="pl-4 py-2.5 w-10" />
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-gray-500">
                  Название / Автор
                </th>
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-gray-500 hidden md:table-cell">
                  Жанр
                </th>
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">
                  Год
                </th>
                <th className="py-2.5 pr-4 text-left text-xs font-medium text-gray-500">
                  Расположение
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <BookRow key={book.id} book={book} onClick={setEditingBook} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модал добавления книги */}
      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Модал редактирования книги */}
      <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} />
    </div>
  );
}

function bookWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'книг';
  if (mod10 === 1) return 'книга';
  if (mod10 >= 2 && mod10 <= 4) return 'книги';
  return 'книг';
}
