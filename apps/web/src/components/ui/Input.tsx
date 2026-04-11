import { cn } from '@/lib/utils/cn';
import { type InputHTMLAttributes, forwardRef } from 'react';

/**
 * Базовый компонент текстового поля ввода.
 *
 * Поддерживает:
 * - error состояние (красная рамка + сообщение)
 * - label (метка над полем)
 * - hint (подсказка под полем)
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-md border px-3 text-sm bg-white transition-colors',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 hover:border-gray-400',
            className,
          )}
          {...props}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
