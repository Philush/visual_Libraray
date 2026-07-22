'use client';

/**
 * Строка книги в табличном представлении.
 *
 * Отображает: обложку (фото или цвет-заглушку), название, автора, жанр,
 * год, рейтинг, расположение на полке.
 *
 * Связанные фичи: F-06
 */

import { BookOpen } from 'lucide-react';
import type { BookWithPlacement } from '@visual-library/types';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { StarRating } from '@/components/ui';

interface BookRowProps {
  book: BookWithPlacement;
  onClick?: (book: BookWithPlacement) => void;
}

export function BookRow({ book, onClick }: BookRowProps) {
  const spineColor = book.spineColor ?? generateSpineColor(book.title, book.author);

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick?.(book)}
    >
      {/* Обложка или цветной маркер */}
      <td className="pl-4 py-2 w-12">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-8 h-12 object-cover rounded-sm shadow-sm"
          />
        ) : (
          <div
            className="w-3 h-10 rounded-sm"
            style={{ backgroundColor: spineColor }}
            title={`Корешок: ${book.title}`}
          />
        )}
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

      {/* Рейтинг */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        {book.rating > 0 ? (
          <StarRating value={book.rating} readOnly size="sm" />
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
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
