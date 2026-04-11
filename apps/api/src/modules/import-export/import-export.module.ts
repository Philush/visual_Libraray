import { Module } from '@nestjs/common';
import { ImportExportController } from './import-export.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

/**
 * Модуль импорта и экспорта библиотеки.
 *
 * Отвечает за F-07:
 * - Экспорт в CSV и JSON
 * - Импорт из CSV и JSON
 *
 * TODO: реализовать в шаге 7 (после DnD)
 */
@Module({
  controllers: [ImportExportController],
  providers: [ImportService, ExportService],
})
export class ImportExportModule {}
