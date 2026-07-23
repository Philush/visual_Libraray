# Visual Library

Инструмент визуализации домашней книжной библиотеки.
Позволяет создавать виртуальные книжные шкафы, размещать книги на полках
и визуально просматривать расположение коллекции.

---

## Документация

| Документ | Описание |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Архитектура системы, компоненты, решения |
| [FEATURES.md](docs/FEATURES.md) | Список фич с приоритетами и порядком реализации |
| [TECH_STACK.md](docs/TECH_STACK.md) | Технологический стек с обоснованием |
| [DATABASE.md](docs/DATABASE.md) | Схема данных, таблицы, архитектурные решения |
| [API.md](docs/API.md) | REST API Reference |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Структура репозитория, правила именования |

---

## Быстрый старт

### Требования

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose

### Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd visual-library

# Установить зависимости
pnpm install

# Скопировать переменные окружения
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### Запуск (разработка)

```bash
# 1. Запустить PostgreSQL
docker compose up -d

# 2. Применить схему БД
pnpm --filter @visual-library/api exec prisma db push

# 3. Запустить backend и frontend
pnpm dev
```

Приложение доступно на `http://localhost:3000`
API доступен на `http://localhost:3001/api/v1`

### Запуск standalone-сборки (локально)

```bash
# 1. Собрать
pnpm --filter @visual-library/api run build
pnpm --filter @visual-library/web run build

# 2. Скопировать статику в standalone-директорию (обязательно!)
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
cp -r apps/web/public apps/web/.next/standalone/apps/web/public

# 3. Запустить
node apps/api/dist/main.js &
node apps/web/.next/standalone/apps/web/server.js &
```

---

## Production Deploy

```bash
# 1. Скопировать и заполнить переменные окружения
cp .env.prod.example .env.prod
# отредактировать .env.prod: пароли, домен, NEXT_PUBLIC_API_URL

# 2. Собрать и запустить все сервисы
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Сервисы: PostgreSQL → миграции → API (3001) → Web (3000) → Nginx (80).
Загруженные обложки хранятся в Docker volume `uploads_data` (персистентно).

---

## Стек

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma
- **Database:** PostgreSQL 17
- **DnD:** @dnd-kit/core
