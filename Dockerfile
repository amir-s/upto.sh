# Build stage
FROM node:16 AS build

WORKDIR /app

COPY package*.json .
COPY prisma .

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:16 AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN npm run prisma:generate

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]
