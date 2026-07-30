# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Манифесты — отдельный слой для кэша
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/

# pnpm 11 blocks all build scripts by default and ignores onlyBuiltDependencies in config files.
# Workaround: install without scripts, then explicitly rebuild only the packages that need it.
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild sharp unrs-resolver

COPY packages/types ./packages/types
COPY apps/web ./apps/web

# NEXT_PUBLIC_API_URL передаётся как build arg — бакается в бандл во время сборки
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter @visual-library/web run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone-сборка Next.js — минимальный набор файлов
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# standalone-сервер находится в apps/web/server.js относительно монорепо
CMD ["node", "apps/web/server.js"]
