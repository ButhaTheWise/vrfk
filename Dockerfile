# --- builder (deps + build egyben) ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 1) Először a package-ek a cache-ért
COPY package.json package-lock.json* ./

# 2) Másoljuk be a SvelteKit/Vite/Tailwind configokat,
#    hogy a "npm ci" alatti `prepare` (svelte-kit sync) már lássa őket
#    Csak azokat másold, amik tényleg megvannak a projektben:
COPY svelte.config.js ./
COPY vite.config.* ./
COPY tsconfig.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./

# 3) Telepítés (itt fog futni a prepare → svelte-kit sync, most már látja a configot)
RUN npm ci

# 4) Prisma schema + kliens
COPY prisma ./prisma
RUN npm run prisma:generate

# 5) A teljes forrás
COPY . .

# 6) Build (most már van synced projekt + adapter-node)
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Europe/Budapest

# Csak a szükséges dolgok
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Healthcheck a /health-re
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# Indítás: migráció + seed + szerver
CMD ["sh","-c","npm run prisma:deploy && npx prisma db seed && node build"]