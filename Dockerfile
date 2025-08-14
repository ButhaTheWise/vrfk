# --- builder (deps + build egyben) ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=true
RUN apk add --no-cache libc6-compat

# 1) Csomagok + cache
COPY package.json package-lock.json* ./

# 2) Konfigok bemásolása, hogy a "prepare" (svelte-kit sync) lássa őket
COPY svelte.config.* ./
COPY vite.config.* ./
COPY tsconfig.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./

# 3) Telepítés (itt fut a prepare hook is)
RUN npm ci

# 4) Prisma schema + client
COPY prisma ./prisma
RUN npm run prisma:generate

# 5) Forrás + build (Vite)
COPY . .
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Budapest

# Ami a futáshoz kell
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# (opcionális) /data létrehozása – Coolify volume ide csatol
RUN mkdir -p /data
EXPOSE 3000

# Healthcheck a /health-re (Node beépített fetch-csel)
HEALTHCHECK --interval=10s --timeout=3s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Indítás: migráció + (nem-blokkoló) seed, majd a node server
CMD ["sh","-c","npm run prisma:deploy && (npx prisma db seed || echo 'Seed failed → skipping') && node build"]