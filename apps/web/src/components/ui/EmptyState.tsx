import { cn } from '@/lib/utils/cn';

/**
 * Компонент заглушки для пустых состояний.
 *
 * Показывается когда:
 * - Нет шкафов (создай первый)
 * - Нет книг (добавь первую)
 * - Поиск не дал результатов
 * - Полка пустая
 */

interface EmptyStateProps {
  /** Иконка — React компонент (например, из lucide-react) */
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  /** CTA кнопка */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-8 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-7 h-7 text-gray-400" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-xs">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
