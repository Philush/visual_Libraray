'use client';

/**
 * Боковая панель навигации.
 *
 * Показывает:
 * - Основные разделы (Библиотека, Все книги)
 * - Динамический список шкафов из API
 * - Кнопку создания нового шкафа
 *
 * Клиентский компонент — использует TanStack Query для загрузки шкафов.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, BookCopy, Plus, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useBookcases } from '@/hooks/useBookcases';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  /** Колбэк открытия модала создания шкафа (вызывается из BookcaseManager) */
  onCreateBookcase?: () => void;
}

export function Sidebar({ onCreateBookcase }: SidebarProps) {
  const pathname = usePathname();
  const { data: bookcases, isLoading } = useBookcases();

  return (
    <aside className="w-60 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto">
      {/* Основная навигация */}
      <nav className="p-3 space-y-0.5">
        <NavLink href="/library" icon={LayoutDashboard} label="Библиотека" pathname={pathname} />
        <NavLink href="/books" icon={BookCopy} label="Все книги" pathname={pathname} />
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-gray-100 my-1" />

      {/* Список шкафов */}
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Шкафы</span>

          {/* Кнопка добавления шкафа */}
          <button
            onClick={onCreateBookcase}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Добавить шкаф"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading && (
          <div className="space-y-1">
            {/* Skeleton-заглушки пока загружается список */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {bookcases && bookcases.length === 0 && (
          <p className="text-xs text-gray-400 px-1 py-2">Нет шкафов. Создайте первый!</p>
        )}

        {/* Список шкафов */}
        <nav className="space-y-0.5">
          {bookcases?.map((bc) => {
            const href = `/bookcases/${bc.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={bc.id}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group',
                  isActive
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Library className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">{bc.name}</span>
                {/* Счётчик книг */}
                <span className="text-xs text-gray-400 group-hover:text-gray-500 shrink-0">
                  {bc.booksCount}
                </span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 shrink-0" />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/** Вспомогательный компонент — ссылка в основной навигации */
function NavLink({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-amber-50 text-amber-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}
