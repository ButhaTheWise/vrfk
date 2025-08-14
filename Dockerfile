# --- builder (deps + build egyben) ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# csak a lock+pkg, hogy a cache működjön
COPY package.json package-lock.json* ./
RUN npm ci

# Prisma schema + kliens
COPY prisma ./prisma
RUN npm run prisma:generate

# a teljes forrás
COPY . .

# SvelteKit build (adapter-node)
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Budapest

# csak ami kell a futáshoz
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# healthcheck a /health endpointra
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# indulás előtt: migráció + seed, majd a node server
CMD ["sh","-c","npm run prisma:deploy && npx prisma db seed && node build"]