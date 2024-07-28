import "dotenv/config";
import { upload } from "./src/routes/upload";
import { download } from "./src/routes/download";
import { Server } from "hyper-express";

const server = new Server({
  max_body_length: 512 * 1024 * 1024, // 512MB
});

server.use(async (req, res, next) => {
  console.log(` vvvv ${req.method} '${req.url}'`);
  await next();
  console.log(" ^^^^ ");
});

server.put("*", async (req, res) => {
  const url = new URL(`${req.protocol}://${req.headers.host}${req.url}`);
  return await upload(req, res, url);
});

server.get("/", async (req, res) => {
  const url = new URL(`${req.protocol}://${req.headers.host}${req.url}`);
  url.protocol = "https";
  return res.end(
    `$ curl --upload-file /path/to/your/file.ext ${url.href}\n\n\n# report issues at https://github.com/amir-s/upto.sh`
  );
});

server.get("/favicon.ico", async (req, res) => {
  return res.status(404).end();
});

server.get("*", async (req, res) => {
  const url = new URL(`${req.protocol}://${req.headers.host}${req.url}`);
  return await download(req, res, url);
});

server
  .listen(process.env.PORT || "3000")
  .then(() => console.log("server started"))
  .catch((error) => console.log("Failed to start server", error));
