'use client';

/**
 * Панель импорта и экспорта библиотеки (F-07).
 *
 * Экспорт: три кнопки — CSV, XLSX, JSON.
 * Импорт: кнопка «Импорт» → скрытый file input → выбор файла → загрузка.
 *   - Формат определяется по расширению файла (.csv / .xlsx / .json)
 *   - Дубликаты: управляется параметром onDuplicate (skip | update)
 *   - Результат показывается через toast
 *
 * Связанные фичи: F-07
 */

import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { exportLibrary, importLibrary, type ExportFormat, type JsonImportResult } from '@/lib/api/importExport';

export function ImportExportPanel() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [importing, setImporting] = useState(false);
  const [onDuplicate, setOnDuplicate] = useState<'skip' | 'update'>('skip');

  // ─── Export ───────────────────────────────────────────

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await exportLibrary(format);
      toast.success(`Экспорт в ${format.toUpperCase()} готов`);
    } catch {
      toast.error('Не удалось экспортировать библиотеку');
    } finally {
      setExporting(null);
    }
  };

  // ─── Import ───────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Определяем формат по расширению
    const ext = file.name.split('.').pop()?.toLowerCase();
    const format: ExportFormat | null =
      ext === 'csv' ? 'csv' : ext === 'xlsx' ? 'xlsx' : ext === 'json' ? 'json' : null;

    if (!format) {
      toast.error('Неподдерживаемый формат. Используй CSV, XLSX или JSON.');
      e.target.value = '';
      return;
    }

    setImporting(true);
    try {
      const result = await importLibrary(file, format, onDuplicate);

      // Инвалидируем кэш книг, чтобы список обновился
      await queryClient.invalidateQueries({ queryKey: ['books'] });

      // Формируем читаемое сообщение о результате
      if (format === 'json') {
        const r = result as JsonImportResult;
        const msg = [
          `Книги: +${r.books.created} создано`,
          r.books.updated > 0 ? `${r.books.updated} обновлено` : null,
          r.books.skipped > 0 ? `${r.books.skipped} пропущено` : null,
          r.placements.created > 0 ? `${r.placements.created} размещений восстановлено` : null,
        ]
          .filter(Boolean)
          .join(', ');

        if (r.books.errors.length > 0 || r.placements.errors.length > 0) {
          toast.warning(msg || 'Импорт завершён с предупреждениями');
        } else {
          toast.success(msg || 'Импорт завершён');
        }
      } else {
        const r = result as { created: number; updated: number; skipped: number; errors: string[] };
        const msg = [
          `+${r.created} создано`,
          r.updated > 0 ? `${r.updated} обновлено` : null,
          r.skipped > 0 ? `${r.skipped} пропущено` : null,
        ]
          .filter(Boolean)
          .join(', ');

        if (r.errors.length > 0) {
          toast.warning(`${msg}. Ошибок: ${r.errors.length}`);
        } else {
          toast.success(`Импорт завершён: ${msg}`);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка импорта');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg">
      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Импорт */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Импорт</span>
        <select
          value={onDuplicate}
          onChange={(e) => setOnDuplicate(e.target.value as 'skip' | 'update')}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
          title="Что делать с дублями при импорте"
          disabled={importing}
        >
          <option value="skip">дубли: пропустить</option>
          <option value="update">дубли: обновить</option>
        </select>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
        >
          <Upload className="w-3 h-3" />
          {importing ? 'Загрузка…' : 'Выбрать файл'}
        </button>
      </div>

      {/* Разделитель */}
      <div className="h-4 w-px bg-gray-300" />

      {/* Экспорт */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Экспорт</span>
        <div className="flex items-center gap-1">
          {(['csv', 'xlsx', 'json'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={exporting !== null}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
            >
              <Download className="w-3 h-3" />
              {exporting === fmt ? '…' : fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
