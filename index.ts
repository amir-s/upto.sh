import "dotenv/load";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import process from "node:process";
import { uploadHandler } from "./src/routes/upload.ts";
import { prepareDB } from "./src/db/index.ts";
import { downloadHandler } from "./src/routes/download.ts";

const app = new Hono();

app.get("/", (c) => {
  const url = new URL(`${c.req.url}`);
  if (process.env.FORCE_HTTPS) url.protocol = "https";
  return c.text(
    `$ curl --upload-file /path/to/your/file.ext ${url.href}\n\n\n# report issues at https://github.com/amir-s/upto.sh`
  );
});

app.use(async (c, next) => {
  console.log("started", c.req.url);
  const resp = await next();
  console.log("ended", c.req.url);
  return resp;
});

app.put(
  "*",
  bodyLimit({
    maxSize: 512 * 1024 * 1024, // 512MB
    onError: (c) => {
      return c.text("shoot! file is too big! :(", 413);
    },
  }),
  ...uploadHandler
);

app.get("/test", (c) => {
  prepareDB();
  return c.text("Hello, World!");
});

app.get("/favicon.ico", (c) => {
  c.status(404);
  return c.text("Not Found");
});

app.get("*", ...downloadHandler);

Deno.serve(
  {
    port: Number(Deno.env.get("PORT") || 3000),
  },
  app.fetch
);
