import { db } from "./src/db";
import { deleteFile } from "./src/storage";

const deleteExpiredFiles = async () => {
  const files = await db.file.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const file of files) {
    console.log(`Deleting file ${file.id}`);
    await deleteFile(file.id);
    await db.file.delete({
      where: {
        id: file.id,
      },
    });
  }
};

deleteExpiredFiles()
  .then(() => {
    console.log("Expired files deleted");
  })
  .catch((err) => {
    console.error("Error deleting expired files", err);
  });
