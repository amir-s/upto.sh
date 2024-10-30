# Build stage
FROM denoland/deno:2.0.4

EXPOSE 3000
WORKDIR /app
USER deno

COPY deno.* .

RUN deno install

COPY . .

ENTRYPOINT [ "task", "start" ]
