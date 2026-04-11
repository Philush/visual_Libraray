'use client';

/**
 * Строка книги в табличном представлении.
 *
 * Отображает: обложку (цвет-заглушку), название, автора, жанр,
 * год, расположение на полке.
 *
 * Связанные фичи: F-06
 */

import { BookOpen } from 'lucide-react';
import type { BookWithPlacement } from '@visual-library/types';
import { generateSpineColor } from '@/lib/utils/spineColor';

interface BookRowProps {
  book: BookWithPlacement;
  /** Коллбэк клика по строке (открыть детали) */
  onClick?: (book: BookWithPlacement) => void;
}

export function BookRow({ book, onClick }: BookRowProps) {
  // Цвет корешка: из данных книги или генерируем детерминированно
  const spineColor = book.spineColor ?? generateSpineColor(book.title, book.author);

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick?.(book)}
    >
      {/* Цветной маркер (имитация корешка) */}
      <td className="pl-4 py-3 w-10">
        <div
          className="w-3 h-10 rounded-sm"
          style={{ backgroundColor: spineColor }}
          title={`Корешок: ${book.title}`}
        />
      </td>

      {/* Название и автор */}
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900 text-sm leading-snug">{book.title}</span>
          <span className="text-xs text-gray-500">{book.author}</span>
        </div>
      </td>

      {/* Жанр */}
      <td className="py-3 pr-4 hidden md:table-cell">
        {book.genre ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
            {book.genre}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Год */}
      <td className="py-3 pr-4 text-xs text-gray-500 hidden sm:table-cell">
        {book.publishYear ?? '—'}
      </td>

      {/* Расположение */}
      <td className="py-3 pr-4">
        {book.placement ? (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-amber-500" />
            {book.placement.bookcaseName}, полка {book.placement.shelfPosition}
          </span>
        ) : (
          <span className="text-xs text-gray-300 italic">Не на полке</span>
        )}
      </td>
    </tr>
  );
}
