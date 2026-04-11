# API Reference — Visual Library

**Base URL:** `http://localhost:3001/api/v1` (development)
**Format:** JSON
**Версионирование:** URI-based (`/api/v1/`)

---

## Соглашения

### Коды ответов

| Код | Ситуация |
|---|---|
| 200 OK | Успешный GET / PATCH |
| 201 Created | Успешный POST (создание ресурса) |
| 204 No Content | Успешный DELETE |
| 400 Bad Request | Невалидный JSON или неверный формат |
| 404 Not Found | Ресурс не найден |
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
      "coverUrl": null,
      "spineColor": "#8B4513",
      "genre": "Классика",
      "publishYear": 1967,
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

### POST /books

Создать книгу.

**Request body:**
```json
{
  "title": "Мастер и Маргарита",   // required
  "author": "Михаил Булгаков",     // required
  "isbn": "978-5-17-090297-5",     // optional
  "pageCount": 480,                // optional, > 0
  "coverUrl": "https://...",       // optional, valid URL
  "spineColor": "#8B4513",         // optional, HEX формат
  "genre": "Классика",             // optional
  "publishYear": 1967,             // optional, 1000-currentYear
  "notes": "Перечитать летом"      // optional, max 2000 символов
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

### GET /export/csv

Экспортировать все книги в CSV.

**Query params:**
- `placed` — `true` | `false` — экспортировать только размещённые/без полки

**Response 200:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="library-export-2024-01-15.csv"

title,author,isbn,pageCount,genre,publishYear,notes,bookcaseName,shelfPosition
"Мастер и Маргарита","Михаил Булгаков","978-5-17-090297-5",480,"Классика",1967,"","Шкаф в гостиной",2
```

---

### GET /export/json

Экспортировать полную библиотеку в JSON (включая расположение).

**Response 200:**
```json
{
  "exportedAt": "2024-01-15T10:00:00Z",
  "version": "1.0",
  "bookcases": [...],
  "books": [...],
  "placements": [...]
}
```

---

### POST /import/csv

Импортировать книги из CSV.

**Request:** `multipart/form-data`
- `file` — CSV файл (max 10MB)
- `onDuplicate` — `skip` | `update` (default: `skip`)

**Response 200:**
```json
{
  "imported": 45,
  "skipped": 3,
  "errors": [
    { "row": 12, "message": "Пустое поле title" }
  ]
}
```

---

### POST /import/json

Восстановить библиотеку из JSON-бэкапа.

**Request:** `multipart/form-data`
- `file` — JSON файл
- `mode` — `merge` | `replace` (default: `merge`)

**Response 200:**
```json
{
  "bookcasesImported": 3,
  "booksImported": 142,
  "placementsImported": 98
}
```
