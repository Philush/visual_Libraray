'use client';

/**
 * Визуальная полка с книгами.
 *
 * Drag & drop через @dnd-kit:
 * - useDroppable регистрирует зону как место для сброса (cross-shelf)
 * - SortableContext + horizontalListSortingStrategy: sortable-анимации внутри полки
 * - При наведении (isOver) — янтарная подсветка + пунктирная граница
 *
 * Управление полкой:
 * - Кнопка × появляется при hover на label-области (удаление полки)
 * - Удаление отключено если полка единственная в шкафу
 * - При удалении с книгами — подтверждение через window.confirm
 *
 * Связанные фичи: F-04, F-05
 */

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { X } from 'lucide-react';
import { BookSpine } from './BookSpine';
import { useDeleteShelf } from '@/hooks/useBookcases';
import type { ShelfWithBooks } from '@visual-library/types';
import { SPINE_HEIGHT_BASE } from '@/lib/utils/spineHeight';

interface ShelfRowProps {
  shelf: ShelfWithBooks;
  bookcaseId: string;
  isLastShelf: boolean;
  bookAreaHeight?: number;
}

const SHELF_BOARD_HEIGHT = 14;

// +24px: 13px вариация сверху + 6px анимация подъёма + 5px запас
export function ShelfRow({ shelf, bookcaseId, isLastShelf, bookAreaHeight = SPINE_HEIGHT_BASE + 24 }: ShelfRowProps) {
  const [labelHovered, setLabelHovered] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: `shelf-${shelf.id}`,
    data: { shelfId: shelf.id },
  });

  const { mutate: deleteShelf, isPending: isDeleting } = useDeleteShelf(bookcaseId);

  const handleDelete = () => {
    if (shelf.books.length > 0) {
      const ok = window.confirm(
        `Полка содержит ${shelf.books.length} кн. Книги перейдут в «Без полки». Удалить?`,
      );
      if (!ok) return;
    }
    deleteShelf(shelf.id);
  };

  const isEmpty = shelf.books.length === 0;

  // IDs для SortableContext — должны совпадать с id в useSortable в BookSpine
  const sortableIds = shelf.books.map((p) => `spine-${p.id}`);

  return (
    <div className="flex items-stretch">
      {/* Label-зона: метка + кнопка удаления */}
      <div
        className="flex items-center justify-center shrink-0 relative group"
        style={{ width: '28px' }}
        onMouseEnter={() => setLabelHovered(true)}
        onMouseLeave={() => setLabelHovered(false)}
      >
        {/* Метка полки — скрывается когда показывается кнопка × */}
        <span
          className="text-[10px] text-amber-300/60 font-medium select-none transition-opacity duration-100"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            opacity: labelHovered ? 0 : 1,
          }}
        >
          {shelf.label ?? `П${shelf.position}`}
        </span>

        {/* Кнопка удаления полки */}
        {labelHovered && !isLastShelf && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute inset-0 flex items-center justify-center rounded-sm text-amber-300/40 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40"
            title="Удалить полку"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Зона полки: книги + доска */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Зона книг — droppable контейнер */}
        <div
          ref={setNodeRef}
          className="flex items-end gap-[2px] px-2 overflow-x-auto overflow-y-visible transition-colors duration-150"
          style={{
            height: `${bookAreaHeight}px`,
            backgroundColor: isOver ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
            outline: isOver ? '1.5px dashed rgba(217, 119, 6, 0.5)' : 'none',
            outlineOffset: '-2px',
            borderRadius: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(180,130,70,0.3) transparent',
          }}
        >
          {isEmpty && !isOver && (
            <div className="flex-1 flex items-end pb-1">
              <div className="w-full h-8 border border-dashed border-amber-700/25 rounded flex items-center justify-center">
                <span className="text-[10px] text-amber-700/35 select-none">
                  Перетащи книгу сюда
                </span>
              </div>
            </div>
          )}

          {isEmpty && isOver && (
            <div className="flex-1 flex items-end pb-2">
              <div className="w-full h-10 border-2 border-dashed border-amber-500/60 rounded flex items-center justify-center">
                <span className="text-[11px] text-amber-400 font-medium select-none">
                  Отпусти здесь
                </span>
              </div>
            </div>
          )}

          {/* SortableContext обеспечивает анимацию сортировки внутри полки.
              items должны совпадать с id в useSortable каждого BookSpine. */}
          <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
            {shelf.books.map((placement) => (
              <BookSpine
                key={placement.id}
                placement={placement}
                bookcaseId={bookcaseId}
                shelfId={shelf.id}
                shelfPosition={shelf.position}
                shelfLabel={shelf.label}
              />
            ))}
          </SortableContext>
        </div>

        {/* Доска полки */}
        <div
          className="shrink-0 mx-1 rounded-sm"
          style={{
            height: `${SHELF_BOARD_HEIGHT}px`,
            background: 'linear-gradient(180deg, #92400e 0%, #78350f 60%, #451a03 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}
