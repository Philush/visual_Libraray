/**
 * API-функции для импорта и экспорта библиотеки (F-07).
 *
 * Экспорт: GET-запросы, скачивание файла через blob URL.
 * Импорт: POST-запросы с multipart/form-data, поле "file".
 *
 * Базовый URL берётся из NEXT_PUBLIC_API_URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type ExportFormat = 'csv' | 'xlsx' | 'json';
export type OnDuplicate = 'skip' | 'update';

export interface BookImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface JsonImportResult {
  books: BookImportResult;
  placements: { created: number; skipped: number; errors: string[] };
}

/**
 * Скачивает файл экспорта библиотеки в указанном формате.
 * Создаёт временный <a> элемент и программно кликает по нему.
 */
export async function exportLibrary(format: ExportFormat): Promise<void> {
  const res = await fetch(`${API_BASE}/export/${format}`);
  if (!res.ok) throw new Error(`Ошибка экспорта: ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  // Имя файла возьмём из Content-Disposition если есть, иначе дефолт
  const cd = res.headers.get('Content-Disposition');
  const match = cd?.match(/filename="([^"]+)"/);
  a.download = match?.[1] ?? `library.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Импортирует книги из файла.
 * Возвращает результат: сколько создано, обновлено, пропущено, ошибки.
 */
export async function importLibrary(
  file: File,
  format: ExportFormat,
  onDuplicate: OnDuplicate = 'skip',
): Promise<BookImportResult | JsonImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/import/${format}?onDuplicate=${onDuplicate}`, {
    method: 'POST',
    body: formData,
    // Content-Type НЕ указываем — браузер сам выставит multipart/form-data с boundary
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    const msg =
      typeof error?.message === 'string' ? error.message : `Ошибка импорта: ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}
