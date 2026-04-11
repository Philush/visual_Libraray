import { Controller } from '@nestjs/common';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

/**
 * Контроллер импорта/экспорта.
 *
 * Маршруты будут добавлены при реализации F-07:
 * GET  /export/csv   — экспорт в CSV
 * GET  /export/json  — экспорт в JSON
 * POST /import/csv   — импорт из CSV
 * POST /import/json  — импорт из JSON
 *
 * TODO: реализовать в шаге 12 (Import/Export)
 */
@Controller()
export class ImportExportController {
  constructor(
    private readonly importService: ImportService,
    private readonly exportService: ExportService,
  ) {}
}
