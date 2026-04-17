FROM oven/bun:1 AS base
WORKDIR /app

# --- Stage 1: Prune ---
FROM base AS prune
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @catalyst/web --docker

# --- Stage 2: Install deps ---
FROM base AS deps
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile

# --- Stage 3: Build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prune /app/out/full/ .
RUN cd apps/web && bun run build

# --- Stage 4: Serve ---
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
