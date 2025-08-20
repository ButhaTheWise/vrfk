# --- Builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Függőségek
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci

# Forrás + build
COPY . .
# Prisma kliens kell a buildhez is (biztonság kedvéért):
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Csak runtime függőségek (de a prisma CLI is dep lett, így megjön)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Artefaktok + prisma mappa (migrations miatt)
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Tartós DB hely
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck (opcionális)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Indítás: migrációk, majd a node server
CMD sh -c "prisma migrate deploy && node build/index.js"

EXPOSE 3000
