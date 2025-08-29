# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# 1) Csak a manifestek + a PRISMA mappa, hogy a postinstall-hoz legyen schema
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY prisma ./prisma

# (Opcionális) OpenSSL a Prisma figyelmeztetés miatt
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# 2) Függőségek (lefut a postinstall: prisma generate, ami már látja a schemát)
RUN npm ci

# 3) Forrás + build
COPY . .
RUN npm run build

# 4) Prod node_modules előkészítése (native modulokkal együtt)
RUN npm prune --omit=dev

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Healthcheck-hez hasznos
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# A builderből hozzuk az előkészített node_modules-t és artefaktokat
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Tartós DB hely
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck kikapcsolva - Coolify kezeli
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
#   CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

# Indítás: migrációk -> app (npm scriptből)
CMD ["npm", "start"]

EXPOSE 3000
