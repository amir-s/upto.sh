import { deleteFileRow, getExpiredFiles } from "./src/db/index.ts";
import { deleteFile } from "./src/storage/index.ts";

const deleteExpiredFiles = async () => {
  const files = getExpiredFiles();

  for (const file of files) {
    console.log(`Deleting file ${file[0]}`);
    await deleteFile(file[0] as string);
    await deleteFileRow(file[0] as string);
  }
};

deleteExpiredFiles()
  .then(() => {
    console.log("Expired files deleted");
  })
  .catch((err) => {
    console.error("Error deleting expired files", err);
  });
