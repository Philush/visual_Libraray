import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BookcasesModule } from './modules/bookcases/bookcases.module';
import { BooksModule } from './modules/books/books.module';
import { PlacementsModule } from './modules/placements/placements.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

/**
 * Корневой модуль приложения.
 *
 * Импортирует все бизнес-модули. Каждый модуль инкапсулирует
 * свою область ответственности (принцип модульного монолита).
 *
 * При добавлении нового модуля (users, auth, subscriptions) — добавлять сюда.
 */
@Module({
  imports: [
    // Глобальная конфигурация из .env файла.
    // isGlobal: true — доступен во всех модулях без повторного импорта.
    ConfigModule.forRoot({ isGlobal: true }),

    // Prisma-клиент как глобальный синглтон.
    PrismaModule,

    // Бизнес-модули (Phase 1 MVP)
    BookcasesModule,
    BooksModule,
    PlacementsModule,
    ImportExportModule,

    // Phase 2 — авторизация
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
