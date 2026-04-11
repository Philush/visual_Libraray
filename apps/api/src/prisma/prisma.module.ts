import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Модуль Prisma.
 *
 * @Global() — экспортируется глобально, чтобы все модули могли инжектить
 * PrismaService без необходимости импортировать PrismaModule напрямую.
 *
 * Это стандартный паттерн для shared-сервисов в NestJS.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
