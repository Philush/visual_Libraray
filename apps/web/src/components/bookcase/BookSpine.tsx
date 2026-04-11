'use client';

/**
 * Визуальный корешок книги на полке.
 *
 * Поддерживает drag & drop через @dnd-kit/core:
 * - useDraggable даёт ref, listeners и attributes для захвата
 * - При перетаскивании корешок становится полупрозрачным (opacity 0.4)
 * - DragOverlay рендерит ghost-копию в BookcaseDndContext
 *
 * Данные drag-элемента (active.data.current):
 *   bookId      — ID книги (для createPlacement)
 *   placementId — ID placement (для updatePlacement при перемещении между полками)
 *   title       — для DragOverlay
 *   spineColor  — для DragOverlay
 *
 * Связанные фичи: F-04, F-05
 */

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { BookPlacementWithBook } from '@visual-library/types';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { getSpineWidth } from '@/lib/utils/spineWidth';
import { getSpineHeight } from '@/lib/utils/spineHeight';
import { getContrastColor, getLighterColor } from '@/lib/utils/contrastColor';

interface BookSpineProps {
  placement: BookPlacementWithBook;
}

export function BookSpine({ placement }: BookSpineProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { book } = placement;

  const baseColor = book.spineColor ?? generateSpineColor(book.title, book.author);
  const textColor = getContrastColor(baseColor);
  const width = getSpineWidth(book.pageCount);
  const height = getSpineHeight(book.title);

  // DnD: useDraggable регистрирует этот элемент как перетаскиваемый.
  // data.current используется в onDragEnd BookcaseDndContext.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `spine-${placement.id}`,
    data: {
      bookId: book.id,
      placementId: placement.id,
      title: book.title,
      spineColor: baseColor,
    },
  });

  const spineColor = isHovered && !isDragging ? getLighterColor(baseColor) : baseColor;

  return (
    <div className="relative group" ref={setNodeRef}>
      <div
        // listeners — mouse/touch события для начала drag
        // attributes — aria-* атрибуты для доступности
        {...listeners}
        {...attributes}
        className="relative flex items-center justify-center rounded-t-[2px] cursor-grab active:cursor-grabbing select-none transition-transform duration-150"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: spineColor,
          // При перетаскивании — полупрозрачный «след» на исходном месте
          opacity: isDragging ? 0.35 : 1,
          // Книга «выезжает» вверх при наведении (только если не тащим)
          transform: isHovered && !isDragging ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: isHovered && !isDragging
            ? 'inset -2px 0 4px rgba(0,0,0,0.15), 2px 2px 8px rgba(0,0,0,0.2)'
            : 'inset -1px 0 3px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Название книги — вертикальный текст */}
        {width >= 18 && (
          <span
            className="absolute inset-x-0 overflow-hidden font-medium pointer-events-none"
            style={{
              fontSize: width < 24 ? '8px' : '9px',
              color: textColor,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              lineHeight: 1.2,
              padding: '4px 2px',
              maxHeight: `${height - 8}px`,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {book.title}
          </span>
        )}

        {/* Декоративная полоска сверху */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] rounded-t-[2px] pointer-events-none"
          style={{
            backgroundColor:
              textColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* Tooltip — только при наведении и когда не тащим */}
      {isHovered && !isDragging && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
          style={{ minWidth: '160px' }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            <p className="font-medium leading-snug">{book.title}</p>
            <p className="text-gray-400 mt-0.5">{book.author}</p>
            {(book.pageCount || book.genre) && (
              <div className="mt-1.5 pt-1.5 border-t border-gray-700 flex gap-2 text-gray-400">
                {book.pageCount && <span>{book.pageCount} стр.</span>}
                {book.genre && <span>{book.genre}</span>}
              </div>
            )}
            <p className="mt-1 text-gray-500 text-[10px]">Перетащи на другую полку</p>
          </div>
        </div>
      )}
    </div>
  );
}
