'use client';

/**
 * Глобальные провайдеры приложения.
 *
 * Оборачивает дерево компонентов в:
 * - QueryClientProvider (TanStack Query) — управление серверным состоянием,
 *   кэширование запросов, инвалидация после мутаций.
 *
 * Вынесено в отдельный клиентский компонент, т.к. root layout.tsx является
 * серверным компонентом — нельзя использовать хуки напрямую.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // useState гарантирует, что QueryClient создаётся один раз per-mount
  // (не пересоздаётся при ре-рендерах layout)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Данные считаются свежими 60 секунд — не рефетчатся при фокусе окна
            staleTime: 60 * 1000,
            // Одна повторная попытка при сетевой ошибке
            retry: 1,
            // При потере фокуса окна — не рефетчить (personal app)
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools видны только в development (автоматически скрываются в prod) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
