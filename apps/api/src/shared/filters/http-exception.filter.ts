import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Глобальный фильтр HTTP-ошибок.
 *
 * Обеспечивает единый формат ответа при ошибках для всех эндпоинтов:
 * {
 *   "statusCode": 422,
 *   "error": "Unprocessable Entity",
 *   "message": ["поле обязательно"]
 * }
 *
 * Подключается глобально в main.ts через app.useGlobalFilters().
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // NestJS ValidationPipe возвращает объект с массивом message.
    // Для остальных ошибок message — строка.
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>).message
        : exception.message;

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status] ?? 'Unknown Error',
      message,
      // Путь запроса помогает при отладке
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
