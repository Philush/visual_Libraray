/**
 * Базовый HTTP-клиент для работы с API.
 *
 * Оборачивает нативный fetch с:
 * - автоматическим добавлением базового URL
 * - установкой Content-Type: application/json
 * - единообразной обработкой HTTP-ошибок
 *
 * Все методы взаимодействия с API строятся поверх этого клиента.
 */

/** Базовый URL API из переменной окружения */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/** Тип HTTP-ошибки от API */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Выполняет HTTP-запрос к API.
 * Бросает ApiError при статусах >= 400.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      // тело ответа может быть пустым (например, 204)
    }

    const message =
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as Record<string, unknown>).message)
        : `HTTP ${response.status}`;

    throw new ApiError(response.status, message, details);
  }

  // 204 No Content — возвращаем null
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

/** GET-запрос */
export const get = <T>(path: string) => request<T>(path, { method: 'GET' });

/** POST-запрос с JSON-телом */
export const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

/** PATCH-запрос с JSON-телом */
export const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

/** DELETE-запрос */
export const del = <T = null>(path: string) => request<T>(path, { method: 'DELETE' });
