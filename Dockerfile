# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app

COPY package.json .
COPY bun.lockb .

RUN bun install --frozen-lockfile --production

COPY . .

RUN bunx prisma generate

ENV NODE_ENV=production

EXPOSE 3000
ENTRYPOINT [ "bun", "start" ]
