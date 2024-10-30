FROM denoland/deno:ubuntu-2.0.4
RUN apt-get update && apt-get install -y curl

EXPOSE 3000
WORKDIR /app

COPY deno.* .

RUN deno install

COPY . .

CMD [ "task", "start" ]
