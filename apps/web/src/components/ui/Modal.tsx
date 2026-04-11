'use client';

/**
 * Модальное окно (overlay dialog).
 *
 * Поведение:
 * - Backdrop click → onClose
 * - Escape key → onClose
 * - Блокирует прокрутку body пока открыт (через overflow-hidden)
 * - Анимированное появление
 *
 * Рендерится через React Portal чтобы быть поверх всего контента.
 */

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Дополнительные классы для контейнера модала */
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Закрытие по Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    // Блокируем прокрутку body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Рендерим в document.body через Portal
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Контент модала */}
      <div
        className={cn(
          'relative z-10 bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto',
          'mx-4 sm:mx-0',
          className ?? 'sm:max-w-md',
        )}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Тело модала */}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
