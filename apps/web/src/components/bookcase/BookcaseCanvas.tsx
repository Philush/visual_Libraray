'use client';

/**
 * Визуализация книжного шкафа — главный компонент страницы /bookcases/:id.
 *
 * Рендерит шкаф как DOM-элементы (не Canvas/SVG):
 * - Деревянная рамка шкафа
 * - Набор полок с книгами в виде корешков
 * - Боковые стенки шкафа
 *
 * Подход CSS/DOM выбран потому что:
 * 1. Нативный DnD через @dnd-kit
 * 2. Accessibility (hover, focus)
 * 3. Простота анимаций через CSS
 * 4. Возможность показывать UI поверх книг
 *
 * DnD реализован в BookcaseDndContext (оборачивает эту компоненту).
 * ShelfRow регистрирует droppable-зоны, BookSpine — draggable-элементы.
 *
 * Связанные фичи: F-04, F-05
 */

import { ShelfRow } from './ShelfRow';
import type { BookcaseWithShelves } from '@visual-library/types';

interface BookcaseCanvasProps {
  bookcase: BookcaseWithShelves;
}

/** Ширина боковых стенок шкафа в пикселях */
const WALL_WIDTH = 16;

/** Вертикальный отступ между полками */
const SHELF_GAP = 4;

export function BookcaseCanvas({ bookcase }: BookcaseCanvasProps) {
  const { shelves } = bookcase;

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Внешняя рамка шкафа */}
      <div
        className="inline-flex flex-col min-w-[400px] rounded-lg overflow-hidden shadow-2xl"
        style={{
          // Тёмно-коричневый цвет дерева
          background: 'linear-gradient(135deg, #3d1a00 0%, #5c2a00 100%)',
          padding: `${WALL_WIDTH}px`,
          paddingBottom: `${WALL_WIDTH + 8}px`,
          gap: `${SHELF_GAP}px`,
          // Имитация объёма рамки
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
              <ShelfRow shelf={shelf} bookcaseId={bookcase.id} />
            </div>
          ))}
        </div>

        {/* Нижняя доска шкафа (основание) */}
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
    </div>
  );
}
