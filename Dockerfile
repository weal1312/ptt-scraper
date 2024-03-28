#### pnpm runtime ####
FROM docker.io/node:20-alpine AS base

# install pnpm
RUN corepack enable && corepack prepare pnpm@8.3.1 --activate

#### build stage ####
FROM base AS build
WORKDIR /app

# install package dependency
COPY ["pnpm-lock.yaml", "./"]
RUN pnpm fetch

# build and remove develop dependency
ADD . ./
RUN pnpm install -r --offline
RUN pnpm build && pnpm prune --prod

#### prod stage ####
FROM base AS deploy
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build ["/app/package.json", "./"]
COPY --from=build ["/app/node_modules", "./node_modules"]
COPY --from=build ["/app/dist", "./dist"]

ENTRYPOINT ["pnpm", "start"]
