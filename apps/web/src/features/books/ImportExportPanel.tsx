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
import { Button } from '@/components/ui';
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
    <div className="flex items-center gap-2">
      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Кнопка импорта */}
      <div className="flex items-center gap-1.5">
        <select
          value={onDuplicate}
          onChange={(e) => setOnDuplicate(e.target.value as 'skip' | 'update')}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
          title="Что делать с дублями при импорте"
          disabled={importing}
        >
          <option value="skip">Дубли: пропустить</option>
          <option value="update">Дубли: обновить</option>
        </select>

        <Button
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1.5 text-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          {importing ? 'Импорт…' : 'Импорт'}
        </Button>
      </div>

      {/* Разделитель */}
      <div className="h-4 w-px bg-gray-200" />

      {/* Кнопки экспорта */}
      <div className="flex items-center gap-1">
        {(['csv', 'xlsx', 'json'] as ExportFormat[]).map((fmt) => (
          <button
            key={fmt}
            onClick={() => handleExport(fmt)}
            disabled={exporting !== null}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
          >
            <Download className="w-3 h-3" />
            {fmt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
