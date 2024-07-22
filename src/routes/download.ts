import { Request, Response } from "hyper-express";

import { db } from "../db";
import { getFile } from "../storage";

function parseDownloadParams(url: URL) {
  const params = url.pathname.split("/");

  if (params.length !== 3) {
    throw new Error("Invalid URL");
  }
  const [hash, fileName] = params.slice(-2);
  return { hash, fileName };
}

export const download = async (req: Request, res: Response, url: URL) => {
  const { fileName, hash } = parseDownloadParams(url);

  console.log(`Downloading ${hash}/${fileName}`);

  const file = await db.file.findUnique({
    where: { id: `${hash}/${fileName}` },
  });

  if (!file) {
    return res.status(404).send("File not found");
  }

  await db.file.update({
    where: { id: `${hash}/${fileName}` },
    data: {
      downloads: file.downloads + 1,
    },
  });

  const { stream, contentLength } = await getFile(`${hash}/${fileName}`);

  res
    .setHeader("Content-Type", "application/octet-stream")
    .setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await res.stream(stream, contentLength);

  console.log(`Downloaded ${fileName}`);
  return res.end();
};
