'use client';

/**
 * Layout для всех основных страниц приложения.
 *
 * Структура:
 * ┌─────────────────────────────────┐
 * │ Header (56px, фиксированный)    │
 * ├──────────┬──────────────────────┤
 * │ Sidebar  │ Main content         │
 * │ (240px)  │ (flex-1, scroll)     │
 * └──────────┴──────────────────────┘
 *
 * Клиентский компонент — Sidebar использует usePathname и TanStack Query.
 * Состояние модала создания шкафа управляется здесь, чтобы Sidebar
 * мог открывать его через onCreateBookcase prop.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreateBookcaseModal } from '@/features/bookcase/CreateBookcaseModal';
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Редирект на /login если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Пока проверяем авторизацию — ничего не рендерим (избегаем flash контента)
  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="h-full flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateBookcase={() => setIsCreateModalOpen(true)} />

        {/* Основной контент — прокручиваемая область */}
        <main className="flex-1 overflow-y-auto">
          {/* Передаём коллбэк через Context чтобы дочерние страницы
              тоже могли открыть модал (например, кнопка на пустой странице).
              Здесь используем простой способ — prop drilling через Context. */}
          <CreateModalContext.Provider value={() => setIsCreateModalOpen(true)}>
            {children}
          </CreateModalContext.Provider>
        </main>
      </div>

      {/* Модал создания шкафа — рендерится один раз на уровне layout */}
      <CreateBookcaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

/**
 * Context для открытия модала создания шкафа из любой дочерней страницы.
 * Экспортируется для использования в хуке useCreateBookcaseModal.
 */
import { createContext, useContext } from 'react';

export const CreateModalContext = createContext<(() => void) | null>(null);

/** Хук для открытия модала создания шкафа из дочерних компонентов */
export function useOpenCreateModal() {
  const open = useContext(CreateModalContext);
  if (!open) throw new Error('useOpenCreateModal must be used within MainLayout');
  return open;
}
