# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Függőségek
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci

# Forrás + build
COPY . .
# Prisma kliens a buildhez is kell
RUN npx prisma generate
RUN npm run build

# Prod node_modules előkészítése (native modulokkal együtt)
RUN npm prune --omit=dev

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Healthcheck-hez hasznos
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# A builderből hozzuk az előkészített node_modules-t
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Artefaktok + Prisma migrations
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Tartós DB hely
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck: /health
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

# Indítás: migrációk -> app
CMD sh -c "./node_modules/.bin/prisma migrate deploy && node build/index.js"

EXPOSE 3000
