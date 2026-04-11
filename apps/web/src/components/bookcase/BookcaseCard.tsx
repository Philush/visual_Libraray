'use client';

/**
 * Карточка книжного шкафа на главной странице (/library).
 *
 * Отображает:
 * - Название и описание шкафа
 * - Визуальную мини-превью полок (серые линии)
 * - Счётчики: полки / книги
 *
 * Клик по карточке → навигация на /bookcases/:id.
 *
 * Связанные фичи: F-01, F-04
 */

import Link from 'next/link';
import { Library } from 'lucide-react';
import type { BookcaseListItem } from '@visual-library/types';

interface BookcaseCardProps {
  bookcase: BookcaseListItem;
}

export function BookcaseCard({ bookcase }: BookcaseCardProps) {
  return (
    <Link
      href={`/bookcases/${bookcase.id}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 gap-4 hover:border-amber-300 hover:shadow-sm transition-all"
    >
      {/* Визуальный превью шкафа */}
      <div className="flex flex-col gap-1.5 bg-amber-50 rounded-lg p-3 border border-amber-100">
        {/* Рисуем линии полок (максимум 5 для превью) */}
        {Array.from({ length: Math.min(bookcase.shelvesCount, 5) }).map((_, i) => (
          <div key={i} className="flex items-end gap-0.5 h-4">
            {/* Имитация корешков книг — случайная высота для визуального эффекта */}
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="rounded-sm bg-amber-200 group-hover:bg-amber-300 transition-colors"
                style={{
                  // Детерминированная высота из id книжной полки
                  height: `${55 + ((bookcase.id.charCodeAt(i + j) ?? 50) % 45)}%`,
                  width: `${12 + ((bookcase.id.charCodeAt(j) ?? 8) % 10)}px`,
                }}
              />
            ))}
          </div>
        ))}
        {/* Нижняя "доска" шкафа */}
        <div className="h-0.5 bg-amber-300 rounded" />
      </div>

      {/* Информация о шкафе */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <Library className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors leading-snug">
            {bookcase.name}
          </h3>
        </div>

        {bookcase.description && (
          <p className="text-sm text-gray-500 line-clamp-2 pl-6">{bookcase.description}</p>
        )}
      </div>

      {/* Статистика */}
      <div className="flex gap-4 text-xs text-gray-400 pl-6">
        <span>{bookcase.shelvesCount} {shelfWord(bookcase.shelvesCount)}</span>
        <span>·</span>
        <span>{bookcase.booksCount} {bookWord(bookcase.booksCount)}</span>
      </div>
    </Link>
  );
}

function shelfWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'полок';
  if (mod10 === 1) return 'полка';
  if (mod10 >= 2 && mod10 <= 4) return 'полки';
  return 'полок';
}

function bookWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'книг';
  if (mod10 === 1) return 'книга';
  if (mod10 >= 2 && mod10 <= 4) return 'книги';
  return 'книг';
}
