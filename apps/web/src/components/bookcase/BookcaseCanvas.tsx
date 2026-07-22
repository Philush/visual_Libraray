'use client';

/**
 * Визуализация книжного шкафа — главный компонент страницы /bookcases/:id.
 *
 * Рендерит шкаф как DOM-элементы (не Canvas/SVG):
 * - Деревянная рамка шкафа
 * - Набор полок с книгами (ShelfRow)
 * - Кнопка «+ Полка» под шкафом
 *
 * DnD реализован в BookcaseDndContext.
 * ShelfRow — droppable-зона, BookSpine — sortable-элемент.
 *
 * Связанные фичи: F-04, F-05
 */

import { Plus } from 'lucide-react';
import { ShelfRow } from './ShelfRow';
import { useCreateShelf } from '@/hooks/useBookcases';
import type { BookcaseWithShelves } from '@visual-library/types';

interface BookcaseCanvasProps {
  bookcase: BookcaseWithShelves;
}

const WALL_WIDTH = 16;
const SHELF_GAP = 4;

export function BookcaseCanvas({ bookcase }: BookcaseCanvasProps) {
  const { shelves } = bookcase;
  const { mutate: addShelf, isPending: isAdding } = useCreateShelf(bookcase.id);

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Внешняя рамка шкафа */}
      <div
        className="inline-flex flex-col min-w-[400px] rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #3d1a00 0%, #5c2a00 100%)',
          padding: `${WALL_WIDTH}px`,
          paddingBottom: `${WALL_WIDTH + 8}px`,
          gap: `${SHELF_GAP}px`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Внутреннее пространство шкафа */}
        <div
          className="flex flex-col gap-0"
          style={{
            background: 'linear-gradient(180deg, #1a0800 0%, #2d1000 100%)',
            borderRadius: '2px',
            padding: `${SHELF_GAP}px 0`,
          }}
        >
          {shelves.map((shelf) => (
            <div key={shelf.id} style={{ marginBottom: `${SHELF_GAP}px` }}>
              <ShelfRow
                shelf={shelf}
                bookcaseId={bookcase.id}
                isLastShelf={shelves.length === 1}
              />
            </div>
          ))}
        </div>

        {/* Нижняя доска шкафа */}
        <div
          className="rounded-sm"
          style={{
            height: '20px',
            background: 'linear-gradient(180deg, #92400e 0%, #451a03 100%)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
            marginTop: '4px',
          }}
        />
      </div>

      {/* Кнопка добавления полки — под шкафом */}
      <div className="mt-3 inline-flex min-w-[400px]">
        <button
          onClick={() => addShelf()}
          disabled={isAdding}
          className="flex items-center gap-1.5 text-xs text-amber-700/60 hover:text-amber-600 transition-colors disabled:opacity-40 px-1 py-0.5 rounded"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Добавление…' : 'Добавить полку'}
        </button>
      </div>
    </div>
  );
}
