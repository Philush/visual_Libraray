# База данных — Visual Library

## СУБД: PostgreSQL 17

ORM: Prisma 6
Схема: `apps/api/prisma/schema.prisma`

---

## Схема данных

### Диаграмма связей

```
User
 └─── has many ──→ Bookcase
 │                     └─── has many ──→ Shelf
 │                                           └─── has many ──→ BookPlacement
 └─── has many ──→ Book ───────────────────────────────────────────↗
                    └─── has one (optional) ──→ BookPlacement
```

---

## Таблицы

### `books`

Хранит все книги пользователя. Книга существует независимо от полки.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | Идентификатор |
| title | VARCHAR(500) | NOT NULL | Название книги |
| author | VARCHAR(500) | NOT NULL | Автор |
| isbn | VARCHAR(20) | NULL, UNIQUE | ISBN-10 или ISBN-13 |
| pageCount | INTEGER | NULL, > 0 | Количество страниц |
| coverUrl | TEXT | NULL | URL или путь обложки (из /uploads/covers/) |
| spineColor | VARCHAR(7) | NULL | HEX-цвет корешка (#RRGGBB) |
| genre | VARCHAR(100) | NULL | Жанр |
| publishYear | SMALLINT | NULL | Год издания |
| notes | TEXT | NULL, max 2000 | Заметки пользователя |
| rating | INTEGER | NOT NULL, default 0 | Рейтинг пользователя (0–5 звёзд) |
| metadata | JSONB | NULL | Сырые данные из внешних API |
| createdAt | TIMESTAMPTZ | NOT NULL, default now() | Дата добавления |
| updatedAt | TIMESTAMPTZ | NOT NULL, auto-update | Дата обновления |
| userId | UUID | NULL, FK → users.id | Владелец книги |

**Индексы:**
- `idx_books_user_id` — быстрая выборка книг пользователя
- `idx_books_title_author` — поиск по названию и автору (ILIKE)
- `idx_books_isbn` — уникальный поиск по ISBN

**Примечания:**
- `spineColor`: если NULL — цвет генерируется на фронте детерминированно из title+author
- `metadata` (JSONB): хранит сырой ответ от Google Books / Open Library для F-11
- `userId`: nullable для обратной совместимости со старыми записями; все новые записи получают userId из JWT-токена

---

### `bookcases`

Книжный шкаф или стеллаж. Содержит набор полок.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | UUID | PK | Идентификатор |
| name | VARCHAR(100) | NOT NULL | Название шкафа |
| description | TEXT | NULL | Описание |
| createdAt | TIMESTAMPTZ | NOT NULL, default now() | Дата создания |
| updatedAt | TIMESTAMPTZ | NOT NULL, auto-update | Дата обновления |
| userId | UUID | NULL, FK → users.id | Владелец шкафа |

**Индексы:**
- `idx_bookcases_user_id` — быстрая выборка шкафов пользователя

---

### `shelves`

Полка внутри шкафа. Имеет порядковый номер (позицию) сверху вниз.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | UUID | PK | Идентификатор |
| bookcaseId | UUID | NOT NULL, FK → bookcases.id | Шкаф |
| position | SMALLINT | NOT NULL | Порядок сверху вниз (1 = верхняя) |
| label | VARCHAR(100) | NULL | Подпись полки (опционально) |
| createdAt | TIMESTAMPTZ | NOT NULL, default now() | Дата создания |

**Ограничения:**
- UNIQUE (bookcaseId, position) — две полки не могут иметь одну позицию в одном шкафу

**Индексы:**
- `idx_shelves_bookcase_id` — быстрая выборка полок шкафа

---

### `book_placements`

Связь книги и полки. Определяет, какая книга стоит на какой полке и в каком порядке.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | UUID | PK | Идентификатор |
| bookId | UUID | NOT NULL, FK → books.id, UNIQUE | Книга (одна книга — одно место) |
| shelfId | UUID | NOT NULL, FK → shelves.id | Полка |
| position | SMALLINT | NOT NULL | Порядок на полке слева направо |
| createdAt | TIMESTAMPTZ | NOT NULL, default now() | Дата размещения |
| updatedAt | TIMESTAMPTZ | NOT NULL, auto-update | Дата обновления |

**Ограничения:**
- UNIQUE (bookId) — книга может стоять только в одном месте одновременно
- UNIQUE (shelfId, position) — на одной позиции полки не может быть двух книг

**Индексы:**
- `idx_book_placements_shelf_id` — быстрая выборка книг на полке
- `idx_book_placements_book_id` — быстрый поиск, где стоит книга

---

### `users`

Аккаунты пользователей. Создаётся при регистрации. Связан с books и bookcases через `userId` (F-09).

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | UUID | PK, default gen_random_uuid() | Идентификатор |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email (логин) |
| passwordHash | VARCHAR(255) | NOT NULL | bcrypt hash пароля (10 rounds) |
| name | VARCHAR(100) | NULL | Отображаемое имя (необязательно) |
| createdAt | TIMESTAMPTZ | NOT NULL, default now() | Дата регистрации |
| updatedAt | TIMESTAMPTZ | NOT NULL, auto-update | Дата обновления |

**Индексы:**
- UNIQUE по `email` — обеспечивает уникальность аккаунтов

---

## Ключевые архитектурные решения БД

### 1. UUID вместо SERIAL/BIGINT

**Почему:** При переходе к мультипользовательскому режиму UUID позволяет
генерировать ID на клиенте (для оптимистичных обновлений) без коллизий.
Нет утечки информации о количестве записей через последовательный ID.

### 2. Отдельная таблица book_placements

**Почему:** Книга и её расположение — разные концепции.
Книга может существовать без полки. Placement можно удалить, не удаляя книгу.
Это прямо поддерживает drag & drop: перемещение = UPDATE placement, а не UPDATE book.

### 3. UNIQUE (bookId) в book_placements

**Почему:** Физически невозможно поставить книгу на две полки одновременно.
Это инвариант на уровне БД, не только на уровне кода.

### 4. JSONB для metadata книг

**Почему:** Ответы внешних книжных API (Google Books, Open Library) имеют
непредсказуемую и изменяющуюся структуру. JSONB позволяет сохранить полный
ответ без миграций при изменении внешнего API.

### 5. userId = NULL в MVP

**Почему:** В Phase 1 (один пользователь) userId не используется.
Поле заложено в схему сейчас, чтобы миграция Phase 2 была минимальной.
При переходе: заполняем userId для всех записей → добавляем NOT NULL constraint.

---

## Жизненный цикл данных

### Добавление книги на полку
```
1. Книга существует в books (unplaced)
2. POST /placements { bookId, shelfId, position }
3. Prisma транзакция:
   a. Сдвигаем position у книг на полке position >= новой
   b. INSERT INTO book_placements
4. Книга отображается на полке
```

### Перемещение книги (DnD)
```
1. PATCH /placements/:id { shelfId, position }
2. Prisma транзакция:
   a. Если shelfId изменился — пересчитываем позиции на старой полке
   b. Сдвигаем позиции на новой полке
   c. UPDATE book_placements
```

### Удаление полки с книгами
```
1. DELETE /shelves/:id
2. Prisma транзакция:
   a. DELETE FROM book_placements WHERE shelfId = :id
   b. DELETE FROM shelves WHERE id = :id
3. Книги остаются в books (unplaced), не удаляются
```
