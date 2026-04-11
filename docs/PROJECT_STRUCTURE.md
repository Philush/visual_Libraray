# Структура проекта — Visual Library

## Тип: Монорепо (pnpm workspaces)

---

## Корневой уровень

```
visual-library/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   └── types/        # Shared TypeScript типы (используются и на фронте, и на бэке)
├── docs/             # Вся документация проекта
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── TECH_STACK.md
│   ├── DATABASE.md
│   ├── API.md
│   └── PROJECT_STRUCTURE.md   ← этот файл
├── docker-compose.yml          # PostgreSQL для локальной разработки
├── .env.example                # Пример переменных окружения
├── .gitignore
├── package.json                # pnpm workspace root (нет зависимостей, только конфигурация)
├── pnpm-workspace.yaml         # Объявление workspaces
└── README.md                   # Быстрый старт
```

---

## apps/web — Frontend (Next.js 15)

```
apps/web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (шрифты, провайдеры)
│   │   ├── page.tsx                # / → редирект на /library
│   │   ├── library/
│   │   │   └── page.tsx            # /library → список шкафов + книги без полки
│   │   ├── bookcases/
│   │   │   ├── page.tsx            # /bookcases → список всех шкафов
│   │   │   └── [id]/
│   │   │       └── page.tsx        # /bookcases/:id → визуализация шкафа
│   │   └── books/
│   │       └── page.tsx            # /books → список всех книг
│   │
│   ├── components/
│   │   ├── ui/                     # Базовые UI-компоненты (не содержат бизнес-логику)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx      # Заглушка для пустых списков
│   │   │   └── index.ts            # Реэкспорт всех ui-компонентов
│   │   │
│   │   ├── bookcase/               # Компоненты визуализации шкафа
│   │   │   ├── BookcaseView.tsx    # Контейнер шкафа (все полки)
│   │   │   ├── ShelfRow.tsx        # Одна полка с книгами
│   │   │   ├── BookSpine.tsx       # Корешок книги (визуальный элемент)
│   │   │   ├── DroppableShelf.tsx  # Полка как drop-зона (@dnd-kit)
│   │   │   └── DraggableBook.tsx   # Книга как draggable-элемент
│   │   │
│   │   ├── books/                  # Компоненты списка книг
│   │   │   ├── BookCard.tsx        # Карточка книги
│   │   │   ├── BookRow.tsx         # Строка книги в таблице
│   │   │   ├── BookForm.tsx        # Форма создания/редактирования книги
│   │   │   └── BookFilters.tsx     # Панель фильтров и поиска
│   │   │
│   │   └── layout/                 # Компоненты лейаута
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── PageContainer.tsx
│   │
│   ├── features/                   # Feature-модули (логика + компоненты конкретной фичи)
│   │   ├── bookcase/               # F-01, F-04, F-05
│   │   │   ├── BookcaseManager.tsx # Создание/удаление шкафов
│   │   │   ├── BookcaseCanvas.tsx  # Полная страница визуализации
│   │   │   └── useDragAndDrop.ts   # Хук логики DnD для шкафа
│   │   │
│   │   ├── books/                  # F-02, F-06
│   │   │   ├── BookLibrary.tsx     # Страница со списком книг
│   │   │   └── useBookSearch.ts    # Хук поиска и фильтрации
│   │   │
│   │   └── import-export/          # F-07
│   │       ├── ImportButton.tsx
│   │       ├── ExportButton.tsx
│   │       └── useImportExport.ts
│   │
│   ├── store/                      # Zustand stores (только UI-состояние)
│   │   ├── uiStore.ts              # Глобальное UI-состояние (открытые модалки, активный шкаф)
│   │   └── dragStore.ts            # Состояние drag & drop
│   │
│   ├── hooks/                      # Переиспользуемые React-хуки
│   │   ├── useBookcases.ts         # TanStack Query хуки для шкафов
│   │   ├── useBooks.ts             # TanStack Query хуки для книг
│   │   ├── usePlacements.ts        # TanStack Query хуки для размещений
│   │   └── useDebounce.ts          # Утилитный хук для debounce поиска
│   │
│   └── lib/                        # Утилиты и инфраструктура
│       ├── api/
│       │   ├── client.ts           # Базовый fetch-клиент (обёртка над fetch)
│       │   ├── bookcases.ts        # API-методы для шкафов
│       │   ├── books.ts            # API-методы для книг
│       │   ├── placements.ts       # API-методы для размещений
│       │   └── importExport.ts     # API-методы для импорта/экспорта
│       ├── utils/
│       │   ├── spineColor.ts       # Детерминированная генерация цвета корешка
│       │   ├── spineWidth.ts       # Вычисление ширины корешка из pageCount
│       │   └── cn.ts               # Утилита для классов (clsx + tailwind-merge)
│       └── constants.ts            # Константы приложения
│
├── public/                         # Статические файлы
│   └── favicon.ico
│
├── .env.local                      # Локальные переменные (не в git)
├── .env.example                    # Пример переменных
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## apps/api — Backend (NestJS)

```
apps/api/
├── src/
│   ├── modules/                    # Бизнес-модули (основа модульного монолита)
│   │   │
│   │   ├── bookcases/              # Шкафы и полки (F-01)
│   │   │   ├── bookcases.module.ts
│   │   │   ├── bookcases.controller.ts   # HTTP endpoints для шкафов
│   │   │   ├── bookcases.service.ts      # Бизнес-логика шкафов
│   │   │   ├── shelves.controller.ts     # HTTP endpoints для полок
│   │   │   ├── shelves.service.ts        # Бизнес-логика полок
│   │   │   └── dto/
│   │   │       ├── create-bookcase.dto.ts
│   │   │       ├── update-bookcase.dto.ts
│   │   │       ├── create-shelf.dto.ts
│   │   │       └── update-shelf.dto.ts
│   │   │
│   │   ├── books/                  # Книги (F-02, F-06)
│   │   │   ├── books.module.ts
│   │   │   ├── books.controller.ts
│   │   │   ├── books.service.ts
│   │   │   └── dto/
│   │   │       ├── create-book.dto.ts
│   │   │       ├── update-book.dto.ts
│   │   │       └── query-books.dto.ts    # Query params для списка книг
│   │   │
│   │   ├── placements/             # Размещение книг (F-03, F-05)
│   │   │   ├── placements.module.ts
│   │   │   ├── placements.controller.ts
│   │   │   ├── placements.service.ts
│   │   │   └── dto/
│   │   │       ├── create-placement.dto.ts
│   │   │       └── update-placement.dto.ts
│   │   │
│   │   └── import-export/          # Импорт/экспорт (F-07)
│   │       ├── import-export.module.ts
│   │       ├── import-export.controller.ts
│   │       ├── import.service.ts         # Логика импорта CSV/JSON
│   │       └── export.service.ts         # Логика экспорта CSV/JSON
│   │
│   ├── shared/                     # Общий код для всех модулей
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Глобальный обработчик ошибок
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts        # Глобальный pipe для class-validator
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts  # Трансформация ответов в единый формат
│   │   └── utils/
│   │       └── pagination.ts             # Утилиты пагинации
│   │
│   ├── prisma/                     # Prisma-модуль
│   │   ├── prisma.module.ts        # NestJS-модуль (singleton клиент)
│   │   └── prisma.service.ts       # PrismaClient как Injectable сервис
│   │
│   ├── app.module.ts               # Корневой модуль (импортирует все модули)
│   └── main.ts                     # Bootstrap (порт, CORS, глобальные pipes/filters)
│
├── prisma/
│   ├── schema.prisma               # Схема БД (единый источник истины)
│   └── migrations/                 # Автогенерируемые миграции
│
├── .env                            # Локальные переменные (не в git)
├── .env.example
├── tsconfig.json
├── nest-cli.json
└── package.json
```

---

## packages/types — Shared Types

```
packages/types/
├── src/
│   ├── book.ts           # Book, BookPlacement типы
│   ├── bookcase.ts       # Bookcase, Shelf типы
│   ├── api.ts            # Типы запросов/ответов API (DTO-контракты)
│   └── index.ts          # Реэкспорт всего
├── tsconfig.json
└── package.json
```

---

## Правила именования

| Контекст | Стиль | Пример |
|---|---|---|
| Файлы React компонентов | PascalCase | `BookSpine.tsx` |
| Файлы утилит/хуков | camelCase | `useBookSearch.ts` |
| Файлы NestJS | kebab-case | `books.service.ts` |
| TypeScript интерфейсы | PascalCase с `I` префиксом только если нужна disambig | `Book`, `CreateBookDto` |
| Переменные/функции | camelCase | `getBookById` |
| Константы | SCREAMING_SNAKE_CASE | `MAX_BOOKS_PER_SHELF` |
| CSS классы | Tailwind утилиты (нет кастомных имён) | — |
| Prisma модели | PascalCase singular | `Book`, `Bookcase`, `Shelf` |
| Таблицы БД | snake_case plural | `books`, `bookcases`, `book_placements` |
| API endpoints | kebab-case plural | `/api/v1/bookcases`, `/api/v1/book-placements` |
| Env переменные | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `NEXT_PUBLIC_API_URL` |

---

## Переменные окружения

### apps/api/.env

```env
# База данных
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/visual_library"

# Сервер
PORT=3001
NODE_ENV=development

# CORS (разрешённые origins)
ALLOWED_ORIGINS="http://localhost:3000"
```

### apps/web/.env.local

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```
