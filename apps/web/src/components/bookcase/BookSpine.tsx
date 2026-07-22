'use client';

/**
 * Визуальный корешок книги на полке.
 *
 * Поддерживает drag & drop через @dnd-kit/sortable:
 * - useSortable совмещает draggable + sortable-анимации внутри полки
 * - transform из useSortable анимирует соседние корешки при сортировке
 * - При перетаскивании корешок становится полупрозрачным (opacity 0.35)
 * - DragOverlay рендерит ghost-копию правильной ширины в BookcaseDndContext
 *
 * Клик по корешку (без перетаскивания) открывает BookDetailModal.
 * Различение клика и drag: отслеживаем isDragging через ref.
 * Если isDragging был true в течение этой сессии — клик игнорируется.
 *
 * Данные drag-элемента (active.data.current):
 *   bookId      — ID книги (для createPlacement)
 *   placementId — ID placement (для updatePlacement при перемещении)
 *   shelfId     — текущая полка (для определения reorder vs cross-shelf)
 *   position    — текущая позиция на полке
 *   title       — для DragOverlay
 *   spineColor  — для DragOverlay
 *   spineWidth  — для DragOverlay (правильная ширина ghost'а)
 *
 * Связанные фичи: F-04, F-05
 */

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BookPlacementWithBook } from '@visual-library/types';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { getSpineWidth } from '@/lib/utils/spineWidth';
import { getSpineHeight } from '@/lib/utils/spineHeight';
import { getContrastColor, getLighterColor } from '@/lib/utils/contrastColor';
import { BookDetailModal } from '@/features/bookcase/BookDetailModal';

interface BookSpineProps {
  placement: BookPlacementWithBook;
  bookcaseId: string;
  shelfId: string;
  shelfPosition: number;
  shelfLabel: string | null;
}

export function BookSpine({ placement, bookcaseId, shelfId, shelfPosition, shelfLabel }: BookSpineProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { book } = placement;

  const baseColor = book.spineColor ?? generateSpineColor(book.title, book.author);
  const textColor = getContrastColor(baseColor);
  const width = getSpineWidth(book.pageCount);
  const height = getSpineHeight(book.title);

  // useSortable: заменяет useDraggable и добавляет sortable-анимации.
  // transform — смещение для анимации соседних элементов при перетаскивании.
  // data.current используется в onDragEnd BookcaseDndContext.
  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({
    id: `spine-${placement.id}`,
    data: {
      bookId: book.id,
      placementId: placement.id,
      shelfId,
      position: placement.position,
      title: book.title,
      spineColor: baseColor,
      spineWidth: width,
    },
  });

  // Различение клика и drag:
  // Если в течение pointer-сессии isDragging стал true — это был drag, не клик.
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    if (isDragging) wasDraggingRef.current = true;
  }, [isDragging]);

  const handleClick = () => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setIsDetailOpen(true);
  };

  const spineColor = isHovered && !isDragging ? getLighterColor(baseColor) : baseColor;

  // Комбинируем sortable-трансформ (анимация при сортировке) с hover-подъёмом.
  const sortableTransform = CSS.Transform.toString(transform);
  const hoverTranslate = isHovered && !isDragging ? 'translateY(-6px)' : '';
  const combinedTransform = [sortableTransform, hoverTranslate].filter(Boolean).join(' ') || undefined;

  return (
    <>
      {/* ref, listeners и attributes — на одном элементе, как требует dnd-kit. */}
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="relative flex items-center justify-center rounded-t-[2px] cursor-grab active:cursor-grabbing select-none shrink-0 overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: spineColor,
          opacity: isDragging ? 0.35 : 1,
          transform: combinedTransform,
          transition: isDragging ? undefined : (transition ?? 'transform 150ms ease'),
          boxShadow: isHovered && !isDragging
            ? 'inset -2px 0 4px rgba(0,0,0,0.15), 2px 2px 8px rgba(0,0,0,0.2)'
            : 'inset -1px 0 3px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Обложка книги — если загружена */}
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt={book.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Название книги — вертикальный текст (только без обложки) */}
        {!book.coverUrl && width >= 18 && (
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

      {isDetailOpen && (
        <BookDetailModal
          placement={placement}
          bookcaseId={bookcaseId}
          shelfPosition={shelfPosition}
          shelfLabel={shelfLabel}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
}
