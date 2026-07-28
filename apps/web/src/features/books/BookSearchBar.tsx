'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { lookupBooks, type BookCandidate } from '@/lib/api/books';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

interface BookSearchBarProps {
  onSelect: (book: BookCandidate) => void;
}

export function BookSearchBar({ onSelect }: BookSearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 400);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['book-lookup', debouncedQuery],
    queryFn: () => lookupBooks(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setOpen(debouncedQuery.trim().length >= 2 && results.length > 0);
  }, [debouncedQuery, results]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(book: BookCandidate) {
    onSelect(book);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 h-9 w-full rounded-md border border-amber-300 bg-amber-50 px-3 text-sm focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-colors">
        {isFetching
          ? <Loader2 className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
          : <Search className="w-4 h-4 text-amber-500 shrink-0" />
        }
        <input
          className="flex-1 bg-transparent outline-none placeholder:text-amber-400 text-gray-800"
          placeholder="Найти книгу по названию, автору или ISBN…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && debouncedQuery.trim().length >= 2) setOpen(true);
          }}
        />
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-72 overflow-y-auto">
          {results.map((book, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(book)}
                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt=""
                    className="w-8 h-11 object-cover rounded-sm shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-11 rounded-sm shrink-0 bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  {(book.publishYear || book.pageCount) && (
                    <p className="text-xs text-gray-400">
                      {[book.publishYear, book.pageCount && `${book.pageCount} стр.`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
