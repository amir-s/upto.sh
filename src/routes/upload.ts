import parse from "parse-duration";
import { generateQRCode, randomString } from "../utils";
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

export const upload = async (req: Request) => {
  if (!req.body) {
    return new Response("Missing body", { status: 400 });
  }

  const url = new URL(req.url);

  const { fileName, duration, readableDuration } = parseUploadParams(url);

  if (duration <= MIN_DURATION || duration > MAX_DURATION) {
    return new Response("Invalid duration", { status: 400 });
  }
  const hash = randomString(6);

  await uploadFile(`${hash}/${fileName}`, req.body);

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
  return new Response(`${qrcode}\n\n${downloadURL.href}\n`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
