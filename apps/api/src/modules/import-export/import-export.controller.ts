import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ExportService } from './export.service';
import { ImportService, type OnDuplicate } from './import.service';

/**
 * Контроллер импорта/экспорта библиотеки.
 *
 * Все маршруты защищены JWT. Данные экспортируются/импортируются для текущего пользователя (F-09).
 *
 * Маршруты (все с глобальным префиксом /api/v1/):
 *   GET  /export/csv   — скачать книги пользователя в CSV
 *   GET  /export/xlsx  — скачать книги пользователя в XLSX
 *   GET  /export/json  — скачать снапшот библиотеки пользователя в JSON
 *   POST /import/csv   — загрузить CSV файл с книгами
 *   POST /import/xlsx  — загрузить XLSX файл с книгами
 *   POST /import/json  — загрузить JSON файл (полное восстановление)
 *
 * Query-параметр ?onDuplicate=skip|update (default: skip) — для POST-эндпоинтов.
 * Файл передаётся через multipart/form-data, поле "file".
 *
 * Связанные фичи: F-07, F-09
 */
@UseGuards(JwtAuthGuard)
@Controller()
export class ImportExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly importService: ImportService,
  ) {}

  // ─── Export ───────────────────────────────────────────

  @Get('export/csv')
  async exportCsv(@CurrentUser() userId: string, @Res() res: Response) {
    const buffer = await this.exportService.exportToCsv(userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="library-${dateSuffix()}.csv"`);
    res.send(buffer);
  }

  @Get('export/xlsx')
  async exportXlsx(@CurrentUser() userId: string, @Res() res: Response) {
    const buffer = await this.exportService.exportToXlsx(userId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="library-${dateSuffix()}.xlsx"`);
    res.send(buffer);
  }

  @Get('export/json')
  async exportJson(@CurrentUser() userId: string, @Res() res: Response) {
    const data = await this.exportService.exportToJson(userId);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="library-${dateSuffix()}.json"`);
    res.send(JSON.stringify(data, null, 2));
  }

  // ─── Import ───────────────────────────────────────────

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('onDuplicate') onDuplicate: OnDuplicate = 'skip',
    @CurrentUser() userId: string,
  ) {
    if (!file) throw new BadRequestException('Файл не передан. Используй поле "file" в multipart/form-data.');
    return this.importService.importFromCsv(file.buffer, normalizeOnDuplicate(onDuplicate), userId);
  }

  @Post('import/xlsx')
  @UseInterceptors(FileInterceptor('file'))
  async importXlsx(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('onDuplicate') onDuplicate: OnDuplicate = 'skip',
    @CurrentUser() userId: string,
  ) {
    if (!file) throw new BadRequestException('Файл не передан. Используй поле "file" в multipart/form-data.');
    return this.importService.importFromXlsx(file.buffer, normalizeOnDuplicate(onDuplicate), userId);
  }

  @Post('import/json')
  @UseInterceptors(FileInterceptor('file'))
  async importJson(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('onDuplicate') onDuplicate: OnDuplicate = 'skip',
    @CurrentUser() userId: string,
  ) {
    if (!file) throw new BadRequestException('Файл не передан. Используй поле "file" в multipart/form-data.');

    let data: unknown;
    try {
      data = JSON.parse(file.buffer.toString('utf-8'));
    } catch {
      throw new BadRequestException('Невалидный JSON файл');
    }

    return this.importService.importFromJson(data, normalizeOnDuplicate(onDuplicate), userId);
  }
}

function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeOnDuplicate(val: string): OnDuplicate {
  return val === 'update' ? 'update' : 'skip';
}
