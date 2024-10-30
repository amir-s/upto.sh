import { HTTPException } from "hono/http-exception";
import { createFactory } from "hono/factory";
import { incrementDownloads } from "../db/index.ts";
import { getFile } from "../storage/index.ts";
import { findFileEntry } from "../db/index.ts";
import { Readable } from "node:stream";

const factory = createFactory();

function parseDownloadParams(url: URL) {
  const params = url.pathname.split("/");

  if (params.length !== 3) {
    throw new Error("Invalid URL");
  }
  const [hash, fileName] = params.slice(-2);
  return { hash, fileName };
}

export const downloadHandler = factory.createHandlers(async (c) => {
  const url = new URL(`${c.req.url}`);
  const { fileName, hash } = parseDownloadParams(url);

  console.log(`Downloading ${hash}/${fileName}`);

  const file = await findFileEntry(`${hash}/${fileName}`);

  if (!file) {
    throw new HTTPException(404, { message: "File not found" });
  }

  await incrementDownloads(`${hash}/${fileName}`);

  const { stream, contentLength } = await getFile(`${hash}/${fileName}`);

  c.res.headers.set("Content-Type", "application/octet-stream");
  c.res.headers.set(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );
  c.res.headers.set("Content-Length", contentLength?.toString() || "");

  console.log(`Downloaded ${fileName}, ${contentLength} bytes`);
  return c.body(Readable.toWeb(stream) as ReadableStream);
});
