import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (
  key: string,
  data: ReadableStream<Uint8Array>
) => {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: "files",
      Key: key,
      Body: data,
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`Uploaded ${progress.loaded} bytes`);
  });
  return upload.done();
};

export const getFile = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: "files",
    Key: key,
  });

  return (await s3.send(command)).Body as ReadableStream<Uint8Array>;
};

export const deleteFile = async (key: string) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: "files",
      Key: key,
    })
  );
};
