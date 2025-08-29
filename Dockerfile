# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Csak a manifest + prisma a cache miatt
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY prisma ./prisma

# OpenSSL a Prisma figyelmeztetés miatt
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Függőségek (lefut a postinstall -> prisma generate)
RUN npm ci

# Forrás + build
COPY . .
RUN npm run build

# Prod node_modules előkészítése
RUN npm prune --omit=dev


# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Healthcheck-hez curl
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Csak a minimális fájlokat hozzuk a builderből
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Tartós adatbázis hely (pl. SQLite)
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Indítás (migráció + app)
CMD ["npm", "start"]