# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Csak a manifest fájlokat másoljuk a gyors cache miatt
COPY package*.json ./
COPY prisma ./prisma

# OpenSSL a Prisma figyelmeztetés miatt
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Production-only függőségek (postinstall lefut: prisma generate)
RUN npm ci --omit=dev

# Forrás + build
COPY . .
RUN npm run build

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Debug / healthcheck eszközök
RUN apt-get update && apt-get install -y --no-install-recommends curl wget \
  && rm -rf /var/lib/apt/lists/*

# Builderből másolás
COPY --from=builder /app /app

# Tartós adatbázis mappa (SQLite-hoz)
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck kikapcsolva (ha kell, aktiválható)
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
#   CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

EXPOSE 3000
CMD ["npm", "start"]
