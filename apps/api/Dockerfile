# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Сначала копируем только манифесты — слой кэшируется пока зависимости не меняются
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# pnpm 10+ blocks build scripts by default.
# pnpm-workspace.yaml — для старых версий pnpm 10
RUN { echo 'packages:'; \
      echo '  - apps/*'; \
      echo '  - packages/*'; \
      echo ''; \
      echo 'onlyBuiltDependencies:'; \
      echo '  - "@nestjs/core"'; \
      echo '  - "@prisma/client"'; \
      echo '  - "@prisma/engines"'; \
      echo '  - bcrypt'; \
      echo '  - prisma'; \
      echo '  - sharp'; \
      echo '  - unrs-resolver'; } > pnpm-workspace.yaml

# pnpm.yaml — для новых версий pnpm 10+
RUN { echo 'onlyBuiltDependencies:'; \
      echo '  - "@nestjs/core"'; \
      echo '  - "@prisma/client"'; \
      echo '  - "@prisma/engines"'; \
      echo '  - bcrypt'; \
      echo '  - prisma'; \
      echo '  - sharp'; \
      echo '  - unrs-resolver'; } > pnpm.yaml

RUN pnpm --version && pnpm install --frozen-lockfile

# Копируем исходники
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN pnpm --filter @visual-library/api exec prisma generate
RUN pnpm --filter @visual-library/api run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Копируем node_modules и скомпилированный код из builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
