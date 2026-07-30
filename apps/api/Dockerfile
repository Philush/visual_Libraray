# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Сначала копируем только манифесты — слой кэшируется пока зависимости не меняются
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# pnpm 11 blocks all build scripts by default and ignores onlyBuiltDependencies in config files.
# Workaround: install without scripts, then explicitly rebuild only the packages that need it.
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild @nestjs/core @prisma/client @prisma/engines prisma bcrypt

# Копируем исходники
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN pnpm --filter @visual-library/api exec prisma generate
RUN pnpm --filter @visual-library/api run build

# ─── Stage 2: Migrate (one-shot, has pnpm to resolve prisma binary) ──────────
FROM builder AS migrate
WORKDIR /app

# ─── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Копируем виртуальный стор pnpm и симлинки пакета
# node_modules — корневой стор (.pnpm/), apps/api/node_modules — симлинки на зависимости пакета
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
