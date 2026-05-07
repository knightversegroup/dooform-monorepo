# ---- Build stage --------------------------------------------------------
FROM node:24-bookworm-slim AS build
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json .npmrc ./
COPY apps ./apps
COPY libs ./libs

RUN pnpm install --frozen-lockfile

RUN pnpm nx build dooform-api

# ---- Runtime stage ------------------------------------------------------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=build /repo/dist/apps/dooform-api ./

RUN pnpm install --prod --frozen-lockfile && pnpm store prune

EXPOSE 3000
CMD ["node", "main.js"]
