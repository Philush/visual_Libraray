'use client';

/**
 * DnD-контекст страницы шкафа.
 *
 * Оборачивает BookcaseCanvas и UnplacedBooksPanel в DndContext.
 * Содержит всю логику перетаскивания:
 *
 * 1. Из UnplacedBooksPanel на полку          → createPlacement (конец полки)
 * 2. С полки на другую полку                 → updatePlacement (конец целевой)
 * 3. На корешок другой книги (cross-shelf)   → updatePlacement / createPlacement с позицией
 * 4. На корешок книги на той же полке        → updatePlacement (reorder, конкретная позиция)
 * 5. Сброс вне полки                         → no-op
 *
 * Различение случаев в onDragEnd:
 * - over.id.startsWith('shelf-') → drop на пустую зону полки (к концу)
 * - over.id.startsWith('spine-') → drop на конкретную книгу (позиция)
 *
 * DragOverlay — ghost-элемент с правильной шириной корешка.
 *
 * active.data.current структура:
 *   { bookId, placementId?, shelfId?, position?, title, spineColor, spineWidth }
 *
 * over.data.current структура (shelf):
 *   { shelfId }
 * over.data.current структура (spine/sortable):
 *   { bookId, placementId, shelfId, position, ... }
 *
 * Связанные фичи: F-05
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useCreatePlacement, useUpdatePlacement } from '@/hooks/usePlacements';
import { getContrastColor } from '@/lib/utils/contrastColor';

interface ActiveDragData {
  bookId: string;
  placementId?: string;
  shelfId?: string;
  position?: number;
  title: string;
  spineColor: string;
  spineWidth?: number;
}

interface BookcaseDndContextProps {
  bookcaseId: string;
  children: React.ReactNode;
}

export function BookcaseDndContext({ bookcaseId, children }: BookcaseDndContextProps) {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);

  // activationConstraint: drag активируется только после 8px движения.
  // Без этого клик на корешок считается drag-ом и вызывает updatePlacement.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const { mutate: createPlacement } = useCreatePlacement(bookcaseId);
  const { mutate: updatePlacement } = useUpdatePlacement(bookcaseId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as ActiveDragData);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDrag(null);

      if (!over) return;

      const activeData = active.data.current as ActiveDragData | undefined;
      if (!activeData?.bookId) return;

      const { bookId, placementId } = activeData;
      const overId = String(over.id);

      if (overId.startsWith('shelf-')) {
        // Drop на пустую зону полки — книга едет в конец
        const overData = over.data.current as { shelfId: string } | undefined;
        const shelfId = overData?.shelfId;
        if (!shelfId) return;

        if (placementId) {
          updatePlacement({ id: placementId, shelfId });
        } else {
          createPlacement({ bookId, shelfId });
        }
      } else if (overId.startsWith('spine-')) {
        // Drop на конкретный корешок — используем его shelfId и position
        const overData = over.data.current as {
          shelfId: string;
          position: number;
          placementId: string;
        } | undefined;

        if (!overData?.shelfId) return;

        // Не перемещаем на себя же
        if (placementId && placementId === overData.placementId) return;

        if (placementId) {
          updatePlacement({ id: placementId, shelfId: overData.shelfId, position: overData.position });
        } else {
          createPlacement({ bookId, shelfId: overData.shelfId, position: overData.position });
        }
      }
    },
    [createPlacement, updatePlacement],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay>
        {activeDrag && <DragGhost data={activeDrag} />}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Ghost-элемент при перетаскивании.
 * Ширина соответствует реальному корешку книги (spineWidth из drag data).
 */
function DragGhost({ data }: { data: ActiveDragData }) {
  const textColor = getContrastColor(data.spineColor);
  const width = data.spineWidth ?? 36;

  return (
    <div
      className="flex items-center justify-center rounded-sm shadow-2xl"
      style={{
        width: `${width}px`,
        height: '110px',
        backgroundColor: data.spineColor,
        transform: 'rotate(3deg) scale(1.05)',
        boxShadow: '4px 8px 20px rgba(0,0,0,0.45)',
        cursor: 'grabbing',
      }}
    >
      {width >= 18 && (
        <span
          className="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            fontSize: width < 24 ? '8px' : '9px',
            color: textColor,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            maxHeight: '100px',
            padding: '4px 2px',
          }}
        >
          {data.title}
        </span>
      )}
    </div>
  );
}
