# Деплой на Ubuntu VPS

## Требования

- Ubuntu 22.04+
- 1+ GB RAM, 10+ GB диска
- Открытые порты: 22 (SSH), 80 (Nginx), 3000 (Web), 3001 (API)

---

## 1. Базовая настройка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

---

## 2. Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # должно быть v22.x
```

---

## 3. pnpm

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc   # или ~/.zshrc
pnpm -v
```

---

## 4. Docker (для PostgreSQL)

```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

---

## 5. Клонирование репозитория

```bash
git clone <твой-репо> /opt/visual-library
cd /opt/visual-library
```

---

## 6. Переменные окружения

### `apps/api/.env`

```env
DATABASE_URL="postgresql://postgres:СИЛЬНЫЙ_ПАРОЛЬ@localhost:5432/visual_library"
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS="http://ВАШ_IP_ИЛИ_ДОМЕН"
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL="http://ВАШ_IP_ИЛИ_ДОМЕН:3001/api/v1"
```

> Если используешь Nginx как reverse proxy (шаг 9) — замени порты на `/api/v1` без порта.

---

## 7. PostgreSQL через Docker

Замени `СИЛЬНЫЙ_ПАРОЛЬ` на тот же пароль, что в `.env`:

```bash
docker run -d \
  --name visual_library_postgres \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=СИЛЬНЫЙ_ПАРОЛЬ \
  -e POSTGRES_DB=visual_library \
  -p 127.0.0.1:5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:17-alpine

# Проверить что контейнер запустился
docker ps
```

---

## 8. Установка зависимостей и миграции

```bash
cd /opt/visual-library

pnpm install

# Применить схему БД
pnpm --filter @visual-library/api exec prisma db push

# Сгенерировать Prisma Client
pnpm --filter @visual-library/api run prisma:generate
```

---

## 9. Сборка

```bash
# API
pnpm --filter @visual-library/api run build

# Web
pnpm --filter @visual-library/web run build
```

---

## 10. Запуск через PM2

```bash
npm install -g pm2

# API
pm2 start "node /opt/visual-library/apps/api/dist/main.js" \
  --name visual-library-api \
  --cwd /opt/visual-library/apps/api

# Web
pm2 start "pnpm run start" \
  --name visual-library-web \
  --cwd /opt/visual-library/apps/web

# Проверить статус
pm2 status

# Автозапуск при перезагрузке сервера
pm2 save
pm2 startup   # выполнить команду из вывода этой команды
```

---

## 11. Nginx как reverse proxy (опционально, но рекомендуется)

Позволяет открыть сайт на порту 80 без `:3000` в адресе.

```bash
sudo apt install -y nginx
```

Создать конфиг `/etc/nginx/sites-available/visual-library`:

```nginx
server {
    listen 80;
    server_name ВАШ_IP_ИЛИ_ДОМЕН;

    # API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/visual-library /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Если используешь Nginx, обнови переменные окружения:

- `ALLOWED_ORIGINS="http://ВАШ_IP_ИЛИ_ДОМЕН"` в `apps/api/.env`
- `NEXT_PUBLIC_API_URL="http://ВАШ_IP_ИЛИ_ДОМЕН/api/v1"` в `apps/web/.env.local`

Затем пересобери и перезапусти:

```bash
cd /opt/visual-library
pnpm --filter @visual-library/api run build
pnpm --filter @visual-library/web run build
pm2 restart all
```

---

## Полезные команды

```bash
# Логи сервисов
pm2 logs visual-library-api
pm2 logs visual-library-web

# Перезапуск
pm2 restart visual-library-api
pm2 restart visual-library-web

# Статус PostgreSQL
docker ps
docker logs visual_library_postgres

# Обновление кода (pull + пересборка)
cd /opt/visual-library
git pull
pnpm install
pnpm --filter @visual-library/api exec prisma db push
pnpm --filter @visual-library/api run build
pnpm --filter @visual-library/web run build
pm2 restart all
```
