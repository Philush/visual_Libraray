# API Reference — Visual Library

**Base URL:** `http://localhost:3001/api/v1` (development)
**Format:** JSON
**Версионирование:** URI-based (`/api/v1/`)

---

## Соглашения

### Авторизация

Почти все эндпоинты требуют JWT-токен в заголовке:

```
Authorization: Bearer <accessToken>
```

Публичные эндпоинты (токен не нужен): `POST /auth/register`, `POST /auth/login`.
Все остальные → 401 Unauthorized при отсутствующем или невалидном токене.

Каждый запрос возвращает данные **только текущего пользователя**. Попытка обратиться к чужому ресурсу по ID → 404 (не раскрывает существование).

---

### Коды ответов

| Код | Ситуация |
|---|---|
| 200 OK | Успешный GET / PATCH |
| 201 Created | Успешный POST (создание ресурса) |
| 204 No Content | Успешный DELETE |
| 400 Bad Request | Невалидный JSON или неверный формат |
| 401 Unauthorized | Токен отсутствует, истёк или недействителен |
| 404 Not Found | Ресурс не найден (или не принадлежит пользователю) |
| 409 Conflict | Нарушение уникальности |
| 422 Unprocessable Entity | Ошибки валидации полей |
| 500 Internal Server Error | Непредвиденная ошибка сервера |

### Формат ошибок

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": [
    "title должен быть непустой строкой",
    "author должен быть непустой строкой"
  ]
}
```

### Пагинация (списки)

```json
{
  "data": [...],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Auth — Авторизация

`POST /auth/register` и `POST /auth/login` — публичные (токен не нужен).
`GET /auth/me` — требует `Authorization: Bearer <token>`.

---

### POST /auth/register

Создать аккаунт.

**Request body:**
```json
{
  "email": "user@example.com",   // required
  "password": "минимум6символов", // required, min 6, max 72
  "name": "Дмитрий"              // optional, max 100
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Дмитрий",
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "accessToken": "eyJhbGci..."
}
```

**Ошибки:**
- 409 Conflict — email уже занят
- 422 Unprocessable Entity — невалидный email или короткий пароль

---

### POST /auth/login

Войти в аккаунт.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "пароль"
}
```

**Response 200:** аналогично `/auth/register`

**Ошибки:**
- 401 Unauthorized — неверный email или пароль

---

### GET /auth/me

Получить данные текущего пользователя. Требует `Authorization: Bearer <token>`.

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Дмитрий",
  "createdAt": "2026-07-23T10:00:00Z",
  "updatedAt": "2026-07-23T10:00:00Z"
}
```

**Ошибки:**
- 401 Unauthorized — токен отсутствует, истёк или недействителен

---

## Bookcases — Шкафы

### GET /bookcases

Получить список всех шкафов.

**Query params:**
- нет

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Шкаф в гостиной",
    "description": "Художественная литература",
    "shelvesCount": 5,
    "booksCount": 47,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### POST /bookcases

Создать новый шкаф.

**Request body:**
```json
{
  "name": "Шкаф в кабинете",       // required, max 100 символов
  "description": "Техническая литература", // optional
  "shelvesCount": 4                 // required, min 1, max 20
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "Шкаф в кабинете",
  "description": "Техническая литература",
  "shelves": [
    { "id": "uuid", "position": 1, "label": null },
    { "id": "uuid", "position": 2, "label": null },
    { "id": "uuid", "position": 3, "label": null },
    { "id": "uuid", "position": 4, "label": null }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### GET /bookcases/:id

Получить шкаф с полками и книгами.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Шкаф в гостиной",
  "description": null,
  "shelves": [
    {
      "id": "uuid",
      "position": 1,
      "label": null,
      "books": [
        {
          "placementId": "uuid",
          "position": 1,
          "book": {
            "id": "uuid",
            "title": "Мастер и Маргарита",
            "author": "Михаил Булгаков",
            "pageCount": 480,
            "spineColor": "#8B4513",
            "coverUrl": null
          }
        }
      ]
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### PATCH /bookcases/:id

Обновить шкаф (название, описание).

**Request body:** (все поля опциональны)
```json
{
  "name": "Новое название",
  "description": "Новое описание"
}
```

**Response 200:** обновлённый объект шкафа

---

### DELETE /bookcases/:id

Удалить шкаф. Все книги переводятся в статус "без полки".

**Response 204:** no body

---

## Shelves — Полки

### POST /bookcases/:bookcaseId/shelves

Добавить полку в шкаф.

**Request body:**
```json
{
  "position": 3,      // optional, если не указано — добавляется в конец
  "label": "Фэнтези" // optional
}
```

**Response 201:** объект полки

---

### PATCH /bookcases/:bookcaseId/shelves/:shelfId

Обновить полку (label, position).

**Response 200:** обновлённый объект полки

---

### DELETE /bookcases/:bookcaseId/shelves/:shelfId

Удалить полку. Книги переводятся в "без полки".

**Ограничение:** нельзя удалить последнюю полку в шкафу → 409 Conflict

**Response 204:** no body

---

## Books — Книги

### GET /books

Получить список всех книг.

**Query params:**
- `search` — поиск по title и author (ILIKE)
- `placed` — `true` | `false` — фильтр по наличию на полке
- `genre` — фильтр по жанру
- `sortBy` — `title` | `author` | `year` | `createdAt` (default: `createdAt`)
- `order` — `asc` | `desc` (default: `desc`)
- `page` — номер страницы (default: 1)
- `limit` — записей на страницу (default: 20, max: 100)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Мастер и Маргарита",
      "author": "Михаил Булгаков",
      "isbn": "978-5-17-090297-5",
      "pageCount": 480,
      "coverUrl": "http://localhost:3001/uploads/covers/1234567890.jpg",
      "spineColor": "#8B4513",
      "genre": "Классика",
      "publishYear": 1967,
      "rating": 4,
      "placement": {
        "shelfId": "uuid",
        "bookcaseId": "uuid",
        "bookcaseName": "Шкаф в гостиной",
        "shelfPosition": 2,
        "positionOnShelf": 3
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET /books/authors

Получить список уникальных авторов из каталога (для автокомплита).

**Response 200:**
```json
["Михаил Булгаков", "Эрих Мария Ремарк", "Фёдор Достоевский"]
```

---

### GET /books/genres

Получить список уникальных жанров из каталога (для автокомплита).

**Response 200:**
```json
["Классика", "Фэнтези", "Фантастика"]
```

---

### POST /books/upload-cover

Загрузить изображение обложки книги. Возвращает URL для последующего сохранения в `coverUrl`.

**Request:** `multipart/form-data`
- `file` — изображение (JPEG, PNG, WebP и др.), до 5 МБ

**Response 200:**
```json
{
  "coverUrl": "http://localhost:3001/uploads/covers/1721654321-987654321.jpg"
}
```

Файл сохраняется в `apps/api/uploads/covers/`. Статика отдаётся по пути `/uploads/covers/{filename}`.

---

### POST /books

Создать книгу.

**Request body:**
```json
{
  "title": "Мастер и Маргарита",   // required
  "author": "Михаил Булгаков",     // required
  "isbn": "978-5-17-090297-5",     // optional
  "pageCount": 480,                // optional, > 0
  "coverUrl": "http://...",        // optional, любая строка (URL или путь из upload-cover)
  "spineColor": "#8B4513",         // optional, HEX формат
  "genre": "Классика",             // optional
  "publishYear": 1967,             // optional, 1000-currentYear
  "notes": "Перечитать летом",     // optional, max 2000 символов
  "rating": 4                      // optional, 0–5
}
```

**Response 201:** полный объект книги

---

### GET /books/:id

**Response 200:** полный объект книги с placement

---

### PATCH /books/:id

Обновить книгу (любые поля, все опциональны).

**Response 200:** обновлённый объект книги

---

### DELETE /books/:id

Удалить книгу. Если книга стоит на полке — placement удаляется автоматически.

**Response 204:** no body

---

## Placements — Размещение книг

### POST /placements

Разместить книгу на полке.

**Request body:**
```json
{
  "bookId": "uuid",    // required
  "shelfId": "uuid",   // required
  "position": 3        // optional, если не указано — ставится в конец
}
```

**Логика:** если книга уже стоит на другой полке — старый placement удаляется.

**Response 201:**
```json
{
  "id": "uuid",
  "bookId": "uuid",
  "shelfId": "uuid",
  "position": 3,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### PATCH /placements/:id

Переместить книгу (другая полка или другая позиция на той же полке).

**Request body:** (все поля опциональны, хотя бы одно обязательно)
```json
{
  "shelfId": "uuid",  // optional — переместить на другую полку
  "position": 5       // optional — изменить позицию
}
```

**Response 200:** обновлённый объект placement

---

### DELETE /placements/:id

Убрать книгу с полки (книга остаётся в каталоге, становится unplaced).

**Response 204:** no body

---

## Import/Export — Импорт и Экспорт

Все эндпоинты реализованы в рамках F-07.
Шаблоны файлов для импорта: `docs/templates/import-template.{csv,xlsx}`.

---

### GET /export/csv

Скачать все книги в CSV (UTF-8 с BOM для корректного открытия в Excel).

**Query params:** нет

**Response 200:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="library-2026-07-08.csv"

Название,Автор,ISBN,Страниц,Жанр,Год издания,Заметки,Цвет корешка
"Мастер и Маргарита","Михаил Булгаков","978-5-17-090297-5",480,"Классика",1967,"",#8B4513
```

---

### GET /export/xlsx

Скачать все книги в XLSX (стилизованный заголовок, фиксированная первая строка).

**Response 200:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="library-2026-07-08.xlsx"
```

---

### GET /export/json

Скачать полный снапшот библиотеки — книги + расположение на полках.
Используется для резервного копирования и восстановления через `/import/json`.

**Response 200:**
```json
{
  "version": 1,
  "exportedAt": "2026-07-08T10:00:00.000Z",
  "books": [
    {
      "title": "Мастер и Маргарита",
      "author": "Михаил Булгаков",
      "isbn": "978-5-17-090297-5",
      "pageCount": 480,
      "genre": "Классика",
      "publishYear": 1967,
      "notes": null,
      "spineColor": "#8B4513",
      "coverUrl": null
    }
  ],
  "placements": [
    {
      "bookTitle": "Мастер и Маргарита",
      "bookAuthor": "Михаил Булгаков",
      "bookcaseName": "Шкаф в гостиной",
      "shelfPosition": 2,
      "shelfLabel": null
    }
  ]
}
```

---

### POST /import/csv

Импортировать книги из CSV-файла. Книги помещаются в «без полки».

**Request:** `multipart/form-data`
- `file` — CSV файл (поле `file`)
- `?onDuplicate=skip|update` — что делать с дублями по title+author (default: `skip`)

Поддерживает как русские заголовки (из шаблона), так и английские ключи.
Обязательные поля: `Название` / `title`, `Автор` / `author`.

**Response 200:**
```json
{
  "created": 42,
  "updated": 3,
  "skipped": 5,
  "errors": [
    "Строка 7: пропущены обязательные поля «Название» / «Автор»"
  ]
}
```

---

### POST /import/xlsx

Импортировать книги из XLSX-файла. Логика идентична CSV-импорту.

**Request:** `multipart/form-data`, поле `file`, `?onDuplicate=skip|update`

**Response 200:** аналогично `/import/csv`

---

### POST /import/json

Восстановить библиотеку из JSON-снапшота (формат `/export/json`).
Создаёт книги и размещает их на полках (если шкаф/полка с совпадающим именем существуют).

**Request:** `multipart/form-data`
- `file` — JSON файл (поле `file`)
- `?onDuplicate=skip|update` — стратегия для дублей книг (default: `skip`)

**Response 200:**
```json
{
  "books": {
    "created": 138,
    "updated": 4,
    "skipped": 0,
    "errors": []
  },
  "placements": {
    "created": 95,
    "skipped": 3,
    "errors": []
  }
}
```

Placement пропускается (skipped) если: книга не найдена, шкаф не найден,
полка с нужной позицией не найдена, или книга уже размещена.
