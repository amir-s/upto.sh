import { Request, Response } from "hyper-express";
import parse from "parse-duration";
import { generateQRCode, randomString } from "../utils";
import { PassThrough } from "stream";
import { uploadFile } from "../storage";
import { db } from "../db";

const MIN_DURATION = 10;
const MAX_DURATION = parse("30d")!;

function parseUploadParams(url: URL) {
  const params = url.pathname.split("/");

  const fileName = params.pop() || randomString(6);
  const readableDuration = params.pop() || "10m";
  const duration = parse(readableDuration) || 0;
  return { fileName, duration, readableDuration };
}

export const upload = async (req: Request, res: Response, url: URL) => {
  const stream = new PassThrough();
  req.pipe(stream);

  if (!req.headers["content-length"]) {
    return res.status(400).end("No file uploaded");
  }

  const { fileName, duration, readableDuration } = parseUploadParams(url);

  if (duration <= MIN_DURATION || duration > MAX_DURATION) {
    return res.status(400).end("Invalid duration");
  }
  const hash = randomString(6);

  await uploadFile(`${hash}/${fileName}`, stream);

  await db.file.create({
    data: {
      id: `${hash}/${fileName}`,
      hash,
      fileName,
      expiresAt: new Date(Date.now() + duration),
    },
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
  return res
    .setHeader("Content-Type", "text/plain")
    .send(`${qrcode}\n\n${downloadURL.href}\n`);
};
