import { cn } from '@/lib/utils/cn';

/**
 * Компонент индикатора загрузки.
 *
 * size: 'sm' | 'md' | 'lg'
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-200 border-t-amber-600',
        sizeStyles[size],
        className,
      )}
      role="status"
      aria-label="Загрузка..."
    />
  );
}

/** Полностраничный загрузчик — используется при первой загрузке данных */
export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-500 py-20">
      <Spinner size="lg" />
      <p className="text-sm">Загрузка...</p>
    </div>
  );
}
