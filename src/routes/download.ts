import { db } from "../db";
import { getFile } from "../storage";

function parseDownloadParams(url: URL) {
  const params = url.pathname.split("/");
  console.log(params);
  if (params.length !== 3) {
    throw new Error("Invalid URL");
  }
  const [hash, fileName] = params.slice(-2);
  return { hash, fileName };
}

export const download = async (req: Request) => {
  const url = new URL(req.url);
  const { fileName, hash } = parseDownloadParams(url);

  const file = await db.file.findUnique({
    where: { id: `${hash}/${fileName}` },
  });

  if (!file) {
    return new Response("File not found", { status: 404 });
  }

  await db.file.update({
    where: { id: `${hash}/${fileName}` },
    data: {
      downloads: file.downloads + 1,
    },
  });

  const data = await getFile(`${hash}/${fileName}`);

  return new Response(data, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
};
