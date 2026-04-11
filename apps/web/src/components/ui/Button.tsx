import { cn } from '@/lib/utils/cn';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

/**
 * Базовый компонент кнопки.
 *
 * Варианты (variant):
 * - default  — основная кнопка (amber, filled)
 * - outline  — контурная (border, прозрачный фон)
 * - ghost    — без границы (только hover)
 * - danger   — деструктивное действие (красный)
 *
 * Размеры (size):
 * - sm  — компактная (для тулбаров)
 * - md  — стандартная (по умолчанию)
 * - lg  — крупная (CTA)
 *
 * Использует forwardRef для совместимости с внешними библиотеками.
 */

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Показывает спиннер вместо содержимого и блокирует кнопку */
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 disabled:bg-amber-300',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400',
  ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs rounded',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-6 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Базовые стили
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          // Встроенный мини-спиннер при загрузке
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
