import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет Tailwind CSS классы без конфликтов.
 * Использует clsx для условных классов + tailwind-merge для устранения дублей.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'px-2') // → 'py-2 bg-blue-500 px-2'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
