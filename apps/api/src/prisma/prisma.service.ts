import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Обёртка над PrismaClient для NestJS.
 *
 * Расширяет PrismaClient и реализует хуки жизненного цикла NestJS:
 * - onModuleInit: устанавливаем соединение с БД при старте приложения
 * - onModuleDestroy: корректно закрываем соединение при остановке
 *
 * Используется через DI во всех сервисах как единственный экземпляр (singleton).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
