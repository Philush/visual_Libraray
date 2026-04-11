'use client';

/**
 * Шапка приложения.
 *
 * Содержит: логотип, название, (в будущем — поиск, профиль пользователя).
 * Фиксируется сверху на высоте 56px.
 */

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0">
      {/* Логотип + название */}
      <Link href="/library" className="flex items-center gap-2 font-semibold text-gray-900">
        <BookOpen className="w-5 h-5 text-amber-600" />
        <span>Visual Library</span>
      </Link>
    </header>
  );
}
