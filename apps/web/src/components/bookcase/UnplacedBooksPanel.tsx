'use client';

/**
 * Панель книг без полки (unplaced).
 *
 * Отображается под шкафом. Содержит книги, которые не стоят ни на одной полке.
 * Каждую книгу можно перетащить на любую полку шкафа.
 *
 * Поведение:
 * - Сворачивается/разворачивается кликом по заголовку
 * - Показывает счётчик книг на заголовке даже в свёрнутом виде
 * - При перетаскивании книга становится полупрозрачной
 * - После успешного размещения — исчезает из панели (TanStack Query)
 *
 * useDraggable данные (active.data.current):
 *   { bookId, title, spineColor }  ← нет placementId, значит это unplaced
 *
 * Связанные фичи: F-05
 */

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronUp, ChevronDown, BookCopy } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { getContrastColor } from '@/lib/utils/contrastColor';
import { getSpineWidth } from '@/lib/utils/spineWidth';
import { Spinner } from '@/components/ui';
import type { BookWithPlacement } from '@visual-library/types';

export function UnplacedBooksPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, isLoading } = useBooks({ placed: false, limit: 100 });
  const books = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Заголовок панели — клик сворачивает/разворачивает */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookCopy className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Книги без полки</span>
          {total > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              {total}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Содержимое панели */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}

          {!isLoading && books.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">
              Все книги расставлены по полкам
            </p>
          )}

          {!isLoading && books.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Перетащи книгу на любую полку шкафа
              </p>

              {/* Горизонтальная лента книг */}
              <div
                className="flex gap-2 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
              >
                {books.map((book) => (
                  <DraggableUnplacedBook key={book.id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Карточка перетаскиваемой книги без полки.
 * Компактный вид: цветной корешок + название + автор.
 */
function DraggableUnplacedBook({ book }: { book: BookWithPlacement }) {
  const spineColor = book.spineColor ?? generateSpineColor(book.title, book.author);
  const textColor = getContrastColor(spineColor);
  const spineWidth = getSpineWidth(book.pageCount);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `unplaced-${book.id}`,
    data: {
      bookId: book.id,
      title: book.title,
      spineColor,
      // placementId отсутствует — сигнал для onDragEnd что это unplaced книга
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col items-center gap-1.5 shrink-0 cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
    >
      {/* Мини-корешок */}
      <div
        className="rounded-t-[2px] flex items-center justify-center"
        style={{
          width: `${Math.max(spineWidth, 32)}px`,
          height: '56px',
          backgroundColor: spineColor,
          boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.1)',
        }}
      >
        <span
          className="overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            fontSize: '8px',
            color: textColor,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            maxHeight: '48px',
            padding: '2px',
          }}
        >
          {book.title}
        </span>
      </div>

      {/* Подпись под корешком */}
      <div
        className="text-center"
        style={{ width: `${Math.max(spineWidth, 32) + 12}px` }}
      >
        <p className="text-[10px] font-medium text-gray-700 truncate">{book.title}</p>
        <p className="text-[9px] text-gray-400 truncate">{book.author}</p>
      </div>
    </div>
  );
}
