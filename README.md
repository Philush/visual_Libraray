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

# 2. Применить миграции БД
pnpm --filter api prisma migrate dev

# 3. Запустить backend и frontend
pnpm dev
```

Приложение доступно на `http://localhost:3000`
API доступен на `http://localhost:3001/api/v1`

---

## Стек

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma
- **Database:** PostgreSQL 17
- **DnD:** @dnd-kit/core
