import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  // Создаём директорию для обложек если её нет
  mkdirSync(join(process.cwd(), 'uploads', 'covers'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Глобальный префикс — все эндпоинты доступны через /api/v1/...
  // Версионирование через URI закладывается с первого дня.
  app.setGlobalPrefix('api/v1');

  // Статические файлы — загруженные обложки книг
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // CORS: разрешаем запросы с фронтенда.
  // ALLOWED_ORIGINS задаётся через .env (несколько через запятую).
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Глобальная валидация DTO через class-validator.
  // whitelist: true — отсекаем поля, которых нет в DTO (безопасность).
  // transform: true — автоматически преобразуем типы (строка → число и т.д.).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Глобальный обработчик HTTP-ошибок — единый формат ответа.
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`API запущен: http://localhost:${port}/api/v1`);
}

bootstrap();
