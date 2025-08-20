# --- build stage ---
FROM node:22-bookworm-slim AS build
WORKDIR /app

# ha fordítani kell (pl. better-sqlite3), kell python+build-eszközök
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
ENV npm_config_python=python3

# csak a lock + package, hogy a cache működjön
COPY package*.json ./
RUN npm ci

# Prisma kliens generálás a buildhez
COPY prisma ./prisma
RUN npx prisma generate

# a többi forrás
COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# csomagok + csak prod függőségek
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev

# build & prisma
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
HEALTHCHECK NONE

# opcionális: migrációk induláskor (nem bukik, ha nincs)
CMD ["sh","-lc","npm run prisma:deploy || true; node build"]
