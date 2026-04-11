'use client';

/**
 * Визуальная полка с книгами.
 *
 * Поддерживает drag & drop через @dnd-kit/core:
 * - useDroppable регистрирует зону книг как место для сброса
 * - При наведении (isOver) — янтарная подсветка + пунктирная граница
 * - Данные droppable (over.data.current): { shelfId }
 *
 * Состоит из:
 * - Зоны книг (horizontally scrollable, книги выровнены по низу)
 * - Доски полки (горизонтальная «деревянная» полоска снизу)
 * - Метки полки слева (номер или label)
 *
 * Связанные фичи: F-04, F-05
 */

import { useDroppable } from '@dnd-kit/core';
import { BookSpine } from './BookSpine';
import type { ShelfWithBooks } from '@visual-library/types';
import { SPINE_HEIGHT_BASE } from '@/lib/utils/spineHeight';

interface ShelfRowProps {
  shelf: ShelfWithBooks;
  bookcaseId: string;
  bookAreaHeight?: number;
}

const SHELF_BOARD_HEIGHT = 14;

// +24px: 13px вариация сверху + 6px анимация подъёма + 5px запас
export function ShelfRow({ shelf, bookcaseId, bookAreaHeight = SPINE_HEIGHT_BASE + 24 }: ShelfRowProps) {
  // useDroppable: регистрируем зону книг как место для сброса.
  // id должен быть уникальным в рамках DndContext.
  // data.current.shelfId используется в onDragEnd BookcaseDndContext.
  const { isOver, setNodeRef } = useDroppable({
    id: `shelf-${shelf.id}`,
    data: { shelfId: shelf.id },
  });

  const isEmpty = shelf.books.length === 0;

  return (
    <div className="flex items-stretch">
      {/* Номер / метка полки — вертикальный текст слева */}
      <div className="flex items-center justify-center shrink-0" style={{ width: '28px' }}>
        <span
          className="text-[10px] text-amber-300/60 font-medium select-none"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {shelf.label ?? `П${shelf.position}`}
        </span>
      </div>

      {/* Зона полки: книги + доска */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Зона книг — droppable контейнер */}
        <div
          ref={setNodeRef}
          className="flex items-end gap-[2px] px-2 overflow-x-auto overflow-y-visible transition-colors duration-150"
          style={{
            height: `${bookAreaHeight}px`,
            // Подсветка при наведении перетаскиваемого элемента
            backgroundColor: isOver ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
            // Пунктирная граница при наведении
            outline: isOver ? '1.5px dashed rgba(217, 119, 6, 0.5)' : 'none',
            outlineOffset: '-2px',
            borderRadius: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(180,130,70,0.3) transparent',
          }}
        >
          {isEmpty && !isOver && (
            /* Пустая полка без наведения — тихая подсказка */
            <div className="flex-1 flex items-end pb-1">
              <div className="w-full h-8 border border-dashed border-amber-700/25 rounded flex items-center justify-center">
                <span className="text-[10px] text-amber-700/35 select-none">
                  Перетащи книгу сюда
                </span>
              </div>
            </div>
          )}

          {isEmpty && isOver && (
            /* Явный placeholder при наведении на пустую полку */
            <div className="flex-1 flex items-end pb-2">
              <div className="w-full h-10 border-2 border-dashed border-amber-500/60 rounded flex items-center justify-center">
                <span className="text-[11px] text-amber-400 font-medium select-none">
                  Отпусти здесь
                </span>
              </div>
            </div>
          )}

          {/* Книги на полке */}
          {shelf.books.map((placement) => (
            <BookSpine
              key={placement.id}
              placement={placement}
              bookcaseId={bookcaseId}
              shelfPosition={shelf.position}
              shelfLabel={shelf.label}
            />
          ))}
        </div>

        {/* Доска полки (нижняя поверхность) */}
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
