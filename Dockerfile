# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Csak a manifest + prisma
COPY package*.json ./
COPY prisma ./prisma

# OpenSSL a Prisma miatt
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# 1. Fejlesztői függőségekkel (vite, svelte-kit is jön)
RUN npm ci

# 2. Forrás + build
COPY . .
RUN npm run build

# 3. Prod only node_modules (itt kivágjuk a dev dep-eket)
RUN npm prune --omit=dev

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Debug / healthcheck eszközök (ha nem kellenek, kidobható)
RUN apt-get update && apt-get install -y --no-install-recommends curl wget \
  && rm -rf /var/lib/apt/lists/*

# Builderből hozunk mindent
COPY --from=builder /app /app

VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
