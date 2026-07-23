# Структура проекта — Visual Library

## Тип: Монорепо (pnpm workspaces)

---

## Корневой уровень

```
visual-library/
├── apps/
│   ├── web/          # Next.js 16 frontend
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

## apps/web — Frontend (Next.js 16)

```
apps/web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (шрифты, провайдеры)
│   │   ├── page.tsx                # / → редирект на /login
│   │   ├── (auth)/                 # Route group — страницы авторизации (без сайдбара)
│   │   │   ├── layout.tsx          # Центрированный layout: логотип + форма
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # /login → форма входа
│   │   │   └── register/
│   │   │       └── page.tsx        # /register → форма регистрации
│   │   └── (main)/                 # Route group — основные страницы (требует авторизации)
│   │       ├── layout.tsx          # Sidebar + Header; редирект на /login если не авторизован
│   │       ├── library/
│   │       │   └── page.tsx        # /library → список шкафов + книги без полки
│   │       ├── bookcases/
│   │       │   └── [id]/
│   │       │       └── page.tsx    # /bookcases/:id → визуализация шкафа
│   │       └── books/
│   │           └── page.tsx        # /books → каталог всех книг
│   │
│   ├── components/
│   │   ├── ui/                     # Базовые UI-компоненты (нет бизнес-логики)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx      # Заглушка для пустых списков
│   │   │   ├── StarRating.tsx      # 5 кликабельных звёзд (input + readOnly)
│   │   │   ├── AutocompleteInput.tsx # Инпут с выпадающим списком подсказок
│   │   │   └── index.ts            # Реэкспорт всех ui-компонентов
│   │   │
│   │   ├── bookcase/               # Компоненты визуализации шкафа
│   │   │   ├── BookcaseCanvas.tsx  # Контейнер шкафа + кнопка «+ Добавить полку»
│   │   │   ├── BookcaseCard.tsx    # Карточка шкафа в списке (/library)
│   │   │   ├── ShelfRow.tsx        # Полка: droppable-зона, SortableContext, кнопка удаления
│   │   │   ├── BookSpine.tsx       # Корешок: useSortable, обложка (object-cover) или цвет+текст
│   │   │   └── UnplacedBooksPanel.tsx  # Панель книг без полки (draggable-источник)
│   │   │
│   │   ├── books/                  # Компоненты списка книг
│   │   │   ├── BookRow.tsx         # Строка книги в таблице (/books)
│   │   │   └── BookFilters.tsx     # Панель поиска и фильтрации
│   │   │
│   │   ├── layout/                 # Компоненты лейаута
│   │   │   ├── Header.tsx          # Логотип + имя пользователя + кнопка «Выйти»
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── providers.tsx           # QueryClient + AuthProvider + Toaster (sonner)
│   │
│   ├── features/                   # Feature-модули (бизнес-логика + компоненты фичи)
│   │   ├── bookcase/               # F-01, F-04, F-05
│   │   │   ├── BookcaseDndContext.tsx  # DndContext, sensors, onDragEnd, DragOverlay
│   │   │   ├── BookDetailModal.tsx    # Детали книги: обложка, рейтинг, метаданные (UX-02)
│   │   │   └── CreateBookcaseModal.tsx # Форма создания шкафа
│   │   │
│   │   └── books/                  # F-02, F-06, F-07
│   │       ├── AddBookModal.tsx    # Форма добавления: обложка, рейтинг, автокомплит
│   │       ├── EditBookModal.tsx   # Форма редактирования: обложка, рейтинг, автокомплит
│   │       └── ImportExportPanel.tsx  # Панель импорта/экспорта (CSV, XLSX, JSON)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx          # Глобальное состояние авторизации (user, token, login/logout)
│   │
│   ├── hooks/                      # TanStack Query хуки
│   │   ├── useBookcases.ts         # CRUD шкафов + useCreateShelf + useDeleteShelf
│   │   ├── useBooks.ts             # CRUD книг + useBookAuthors + useBookGenres
│   │   ├── usePlacements.ts        # Placement мутации + toast-уведомления
│   │   └── useDebounce.ts          # Debounce для поискового инпута
│   │
│   └── lib/                        # Утилиты и инфраструктура
│       ├── api/
│       │   ├── client.ts           # fetch-клиент: Bearer-токен, обработка ошибок, getStoredToken
│       │   ├── auth.ts             # login(), register(), getMe() — без JSON-клиента (multipart free)
│       │   ├── bookcases.ts        # API-методы для шкафов и полок
│       │   ├── books.ts            # API-методы для книг + uploadBookCover + getBookAuthors/Genres
│       │   ├── placements.ts       # API-методы для размещений
│       │   └── importExport.ts     # exportLibrary() / importLibrary() — blob download + multipart
│       ├── utils/
│       │   ├── spineColor.ts       # Детерминированная генерация HEX-цвета корешка
│       │   ├── spineWidth.ts       # Ширина корешка из pageCount (узкий/средний/широкий)
│       │   ├── spineHeight.ts      # Высота корешка из длины названия
│       │   ├── contrastColor.ts    # Цвет текста (белый/чёрный) по фону корешка
│       │   └── cn.ts               # Утилита для классов (clsx + tailwind-merge)
│       └── constants.ts            # Константы приложения
│
├── public/                         # Статические файлы
│   └── favicon.ico
│
├── .env.local                      # Локальные переменные (не в git)
├── next.config.ts                  # output: standalone, remotePatterns
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
│   │   ├── import-export/          # Импорт/экспорт (F-07)
│   │   │   ├── import-export.module.ts
│   │   │   ├── import-export.controller.ts
│   │   │   ├── import.service.ts         # Логика импорта CSV/XLSX/JSON
│   │   │   └── export.service.ts         # Логика экспорта CSV/XLSX/JSON
│   │   │
│   │   ├── auth/                   # Авторизация (F-08)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts        # POST /auth/register|login, GET /auth/me
│   │   │   ├── auth.service.ts           # register, login, getMe, bcrypt, JWT sign
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts       # PassportStrategy: валидация Bearer-токена
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts     # @UseGuards(JwtAuthGuard) для защиты эндпоинтов
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   └── users/                  # Пользователи (F-08, F-10)
│   │       ├── users.module.ts
│   │       └── users.service.ts          # findById, findByEmail, create
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

# JWT секрет для подписи токенов (в prod — случайная строка 32+ символа)
JWT_SECRET="dev-secret-change-in-production"
```

### apps/web/.env.local

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```
