# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client generálás buildkor (a futtató image-be is másoljuk majd a /prisma-t)
RUN npm run prisma:generate
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Budapest

# App szükséges fájlok
COPY --from=builder /app/build ./build
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY prisma ./prisma

# Healthcheck a /health-re
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# Indítás előtt migrációk (SQLite: fájl a DATABASE_URL alapján)
CMD npm run prisma:deploy && npx prisma db seed && node build