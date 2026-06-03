FROM oven/bun:1-alpine AS base

WORKDIR /app

# Copy monorepo config
COPY package.json package.json
COPY tsconfig.json tsconfig.json

# Copy workspace configs
COPY apps/backend apps/backend

# Install dependencies
RUN bun install

# Build backend stage
FROM base AS backend

RUN cd apps/backend && bun run build

EXPOSE 4000

CMD ["sh", "-c", "cd apps/backend && bun run start"]
