'use client';

/**
 * DnD-контекст страницы шкафа.
 *
 * Оборачивает BookcaseCanvas и UnplacedBooksPanel в DndContext.
 * Содержит всю логику перетаскивания:
 *
 * 1. Перетащить из UnplacedBooksPanel на полку → createPlacement
 * 2. Перетащить книгу с одной полки на другую  → updatePlacement
 * 3. Сброс вне полки                          → no-op (книга возвращается)
 *
 * DragOverlay — ghost-элемент, следующий за курсором.
 * Рендерится отдельно от DOM-дерева (через Portal) чтобы не вызывать
 * z-index проблем внутри шкафа.
 *
 * active.data.current структура:
 *   { bookId, title, spineColor }              — для unplaced книги
 *   { bookId, placementId, title, spineColor } — для книги на полке
 *
 * over.data.current структура:
 *   { shelfId }                                — целевая полка
 *
 * Связанные фичи: F-05
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useCreatePlacement, useUpdatePlacement } from '@/hooks/usePlacements';
import { getContrastColor } from '@/lib/utils/contrastColor';

interface ActiveDragData {
  bookId: string;
  placementId?: string;
  title: string;
  spineColor: string;
}

interface BookcaseDndContextProps {
  bookcaseId: string;
  children: React.ReactNode;
}

export function BookcaseDndContext({ bookcaseId, children }: BookcaseDndContextProps) {
  // Данные активного перетаскивания — нужны для рендера DragOverlay
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);

  const { mutate: createPlacement } = useCreatePlacement(bookcaseId);
  const { mutate: updatePlacement } = useUpdatePlacement(bookcaseId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as ActiveDragData);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);

      // Сброс вне зоны полки — ничего не делаем
      if (!over) return;

      const activeData = active.data.current as ActiveDragData | undefined;
      const overData = over.data.current as { shelfId: string } | undefined;

      if (!activeData?.bookId || !overData?.shelfId) return;

      const { bookId, placementId } = activeData;
      const { shelfId } = overData;

      if (placementId) {
        // Книга уже на полке → перемещаем (updatePlacement).
        // Позицию не передаём — ставится в конец (сервис определяет).
        updatePlacement({ id: placementId, shelfId });
      } else {
        // Книга без полки → размещаем (createPlacement)
        createPlacement({ bookId, shelfId });
      }
    },
    [createPlacement, updatePlacement],
  );

  return (
    <DndContext
      // pointerWithin: полка подсвечивается когда указатель внутри её области.
      // Более интуитивно чем closestCenter для больших drop-зон.
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      {/* DragOverlay — ghost-элемент, следует за курсором во время drag.
          Рендерится через Portal, не влияет на layout. */}
      <DragOverlay>
        {activeDrag && <DragGhost data={activeDrag} />}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Визуальный ghost-элемент при перетаскивании.
 * Имитирует корешок книги с тенью и вращением.
 */
function DragGhost({ data }: { data: ActiveDragData }) {
  const textColor = getContrastColor(data.spineColor);

  return (
    <div
      className="flex items-center justify-center rounded-sm shadow-2xl"
      style={{
        width: '36px',
        height: '110px',
        backgroundColor: data.spineColor,
        // Лёгкий наклон создаёт эффект «захваченного» предмета
        transform: 'rotate(3deg) scale(1.05)',
        boxShadow: '4px 8px 20px rgba(0,0,0,0.45)',
        cursor: 'grabbing',
      }}
    >
      <span
        className="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
        style={{
          fontSize: '9px',
          color: textColor,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          maxHeight: '100px',
          padding: '4px 2px',
        }}
      >
        {data.title}
      </span>
    </div>
  );
}
