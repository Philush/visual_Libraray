# Деплой на Ubuntu VPS (Docker Compose)

Весь стек запускается одной командой через Docker Compose.
На сервере нужны только Docker и Git — всё остальное внутри контейнеров.

---

## Требования к серверу

- Ubuntu 22.04+
- 1+ GB RAM, 15+ GB диска
- Открытые порты: 22 (SSH), 80 (HTTP)

---

## 1. Установка Docker

```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
newgrp docker

# Проверить
docker --version
docker compose version
```

---

## 2. Клонирование репозитория

```bash
git clone <твой-репо> /opt/visual-library
cd /opt/visual-library
```

---

## 3. Переменные окружения

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Заполнить:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=придумай_сильный_пароль
POSTGRES_DB=visual_library

ALLOWED_ORIGINS=http://ВАШ_IP_ИЛИ_ДОМЕН

NEXT_PUBLIC_API_URL=http://ВАШ_IP_ИЛИ_ДОМЕН/api/v1
```

> `NEXT_PUBLIC_API_URL` — это адрес, который видит **браузер пользователя**,
> не внутренний адрес Docker-сети. При использовании домена — указывай домен.

---

## 4. Первый запуск

```bash
cd /opt/visual-library

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Docker выполнит по порядку:
1. Соберёт образы API и Web (~3-5 минут при первом запуске)
2. Поднимет PostgreSQL и дождётся его готовности
3. Применит схему БД (контейнер `migrate`)
4. Запустит API и дождётся его готовности
5. Запустит Web-фронт
6. Запустит Nginx на порту 80

Сайт будет доступен по адресу: `http://ВАШ_IP_ИЛИ_ДОМЕН`

---

## 5. Проверка

```bash
# Все контейнеры должны быть Up (кроме migrate — он завершается)
docker compose -f docker-compose.prod.yml ps

# Логи всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
```

---

## 6. Обновление (новая версия кода)

```bash
cd /opt/visual-library

git pull

# Пересобрать и перезапустить изменившиеся сервисы
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Docker пересоберёт только изменившиеся образы, не трогая остальные.

---

## Полезные команды

```bash
# Остановить всё
docker compose -f docker-compose.prod.yml down

# Остановить и удалить данные БД (осторожно!)
docker compose -f docker-compose.prod.yml down -v

# Перезапустить один сервис
docker compose -f docker-compose.prod.yml restart api

# Зайти в контейнер
docker exec -it vl_api sh
docker exec -it vl_postgres sh

# Подключиться к БД
docker exec -it vl_postgres psql -U postgres -d visual_library

# Посмотреть использование ресурсов
docker stats
```

---

## Структура файлов деплоя

```
visual-library/
├── docker-compose.prod.yml   # production-конфигурация всех сервисов
├── docker-compose.yml        # только PostgreSQL для локальной разработки
├── nginx.conf                # конфиг Nginx reverse proxy
├── .env.prod.example         # шаблон переменных окружения
├── .dockerignore             # исключения для Docker build context
├── apps/
│   ├── api/Dockerfile        # сборка NestJS API
│   └── web/Dockerfile        # сборка Next.js (standalone mode)
```
