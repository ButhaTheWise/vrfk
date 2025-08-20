# --- build stage ---
FROM node:24-bookworm-slim AS build
WORKDIR /app

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
FROM node:24-bookworm-slim AS runner
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

# NINCS konténer healthcheck
HEALTHCHECK NONE

# opcionális: migrációk futtatása induláskor (nem bukik, ha nincs)
CMD ["sh","-lc","npm run prisma:deploy || true; node build"]
