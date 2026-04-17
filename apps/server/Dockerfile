FROM oven/bun:1 AS base
WORKDIR /app

# --- Stage 1: Prune ---
FROM base AS prune
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @catalyst/server --docker

# --- Stage 2: Install deps ---
FROM base AS deps
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile

# --- Stage 3: Build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prune /app/out/full/ .
RUN cd packages/db && bunx prisma generate
RUN cd apps/server && bun run build

# --- Stage 4: Run ---
FROM oven/bun:1-slim AS runner
WORKDIR /app
COPY --from=builder /app/apps/server/dist ./
EXPOSE 3001
CMD ["bun", "run", "index.js"]
