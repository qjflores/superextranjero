FROM node:20-alpine AS base

WORKDIR /app

# Copy monorepo config
COPY .yarnrc.yml .yarnrc.yml
COPY package.json package.json
COPY yarn.lock yarn.lock

# Copy workspace configs
COPY apps/backend apps/backend
COPY tsconfig.json tsconfig.json

# Install dependencies
RUN yarn install --frozen-lockfile

# Build backend stage
FROM base AS backend

RUN yarn workspace @ss/backend build

EXPOSE 4000

CMD ["yarn", "workspace", "@ss/backend", "start"]
