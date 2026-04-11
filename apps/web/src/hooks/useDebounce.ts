import { useState, useEffect } from 'react';

/**
 * Хук для debounce значения.
 *
 * Используется для поиска — чтобы не посылать запрос на каждый символ,
 * а ждать пока пользователь перестанет печатать.
 *
 * @param value - значение для задержки
 * @param delay - задержка в миллисекундах (по умолчанию 300ms)
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 300);
 * // debouncedSearch обновится только через 300ms после последнего изменения searchInput
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
