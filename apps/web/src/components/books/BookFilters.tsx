'use client';

/**
 * Панель фильтров и поиска для списка книг.
 *
 * Содержит:
 * - Поисковое поле (title + author)
 * - Фильтр по расположению (все / на полке / без полки)
 * - Сортировка
 *
 * Связанные фичи: F-06
 */

import { Search, X } from 'lucide-react';
import type { GetBooksParams } from '@/lib/api/books';

interface BookFiltersProps {
  params: GetBooksParams;
  onChange: (params: GetBooksParams) => void;
}

/** Варианты фильтра по расположению */
const PLACED_OPTIONS = [
  { label: 'Все книги', value: undefined },
  { label: 'На полке', value: true },
  { label: 'Не на полке', value: false },
] as const;

/** Варианты сортировки */
const SORT_OPTIONS = [
  { label: 'По дате добавления', value: 'createdAt' },
  { label: 'По названию', value: 'title' },
  { label: 'По автору', value: 'author' },
  { label: 'По году', value: 'publishYear' },
] as const;

export function BookFilters({ params, onChange }: BookFiltersProps) {
  const hasActiveFilters = params.search || params.placed !== undefined;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Поиск */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Поиск по названию или автору…"
          value={params.search ?? ''}
          onChange={(e) => onChange({ ...params, search: e.target.value || undefined, page: 1 })}
          className="w-full h-9 pl-8 pr-8 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-gray-400"
        />
        {/* Очистить поиск */}
        {params.search && (
          <button
            onClick={() => onChange({ ...params, search: undefined, page: 1 })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Фильтр по расположению */}
      <div className="flex rounded-md border border-gray-200 overflow-hidden shrink-0">
        {PLACED_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange({ ...params, placed: opt.value, page: 1 })}
            className={`px-3 h-9 text-xs font-medium transition-colors border-r last:border-r-0 border-gray-200 ${
              params.placed === opt.value
                ? 'bg-amber-50 text-amber-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Сортировка */}
      <select
        value={params.sortBy ?? 'createdAt'}
        onChange={(e) => onChange({ ...params, sortBy: e.target.value as GetBooksParams['sortBy'] })}
        className="h-9 border border-gray-200 rounded-md text-sm text-gray-600 bg-white px-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Сброс фильтров */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ sortBy: 'createdAt', order: 'desc' })}
          className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
