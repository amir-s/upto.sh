# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:latest

COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node

RUN apt-get update && apt-get install -y \
  curl \
  wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json .
COPY bun.lockb .
COPY prisma .

RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000
ENTRYPOINT [ "bun", "start" ]
