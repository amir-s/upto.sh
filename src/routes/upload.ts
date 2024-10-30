import parse from "parse-duration";
import { Readable } from "node:stream";
import { randomString, generateQRCode } from "../utils/index.ts";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { uploadFile } from "../storage/index.ts";
import { createFileEntry } from "../db/index.ts";

const factory = createFactory();

const MIN_DURATION = 10;
const MAX_DURATION = parse("30d")!;

function parseUploadParams(url: URL) {
  const params = url.pathname.split("/");

  const fileName = params.pop() || randomString(6);
  const readableDuration = params.pop() || "10m";
  const duration = parse(readableDuration) || 0;
  return { fileName, duration, readableDuration };
}

export const uploadHandler = factory.createHandlers(async (c) => {
  const url = new URL(`${c.req.url}`);

  if (!c.req.header("content-length") || !c.req.raw.body) {
    throw new HTTPException(400, { message: "No file uploaded" });
  }

  const { fileName, duration, readableDuration } = parseUploadParams(url);

  if (duration <= MIN_DURATION || duration > MAX_DURATION) {
    throw new HTTPException(401, { message: "Invalid duration" });
  }

  const hash = randomString(6);
  console.log({ hash, fileName, duration, readableDuration });
  await uploadFile(`${hash}/${fileName}`, Readable.from(c.req.raw.body));
  console.log("upload done");
  await createFileEntry({
    id: `${hash}/${fileName}`,
    hash,
    fileName,
    expiresAt: new Date(Date.now() + duration),
  });

  const downloadURL = new URL(url);
  downloadURL.pathname = `/${hash}/${fileName}`;

  console.log({
    fileName,
    duration,
    readableDuration,
    url: downloadURL.href,
  });

  const qrcode = await generateQRCode(downloadURL.href);
  c.header("Content-Type", "text/plain");
  return c.text(`${qrcode}\n\n${downloadURL.href}\n`);
});
