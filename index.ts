import { serve } from "bun";
import { upload } from "./src/routes/upload";
import { download } from "./src/routes/download";

console.log("Server started!");

await serve({
  development: !true,
  port: process.env.PORT || 3000,
  async fetch(req) {
    if (req.method === "PUT") {
      return upload(req);
    }
    if (req.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response(
        `curl --upload-file /path/to/your/file.ext ${url.href}`,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 404 });
    }

    return download(req);
  },
});
