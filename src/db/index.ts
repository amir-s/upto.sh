import "dotenv/load";
import { DB } from "sqlite";

export const db = new DB(Deno.env.get("DATABASE_URL"));

export const prepareDB = () => {
  db.execute(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    expiresAt TEXT,
    fileName TEXT,
    hash TEXT,
    downloaded INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0
  )
`);
};

export const createFileEntry = (data: {
  id: string;
  hash: string;
  fileName: string;
  expiresAt: Date;
}) => {
  return db.query(
    "INSERT INTO files (id, hash, fileName, expiresAt) VALUES (?, ?, ?, ?)",
    [data.id, data.hash, data.fileName, data.expiresAt.toISOString()]
  );
};

export const findFileEntry = (id: string) => {
  const rows = db.query("SELECT * FROM files WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
};

export const incrementDownloads = (id: string) => {
  return db.query("UPDATE files SET downloads = downloads + 1 WHERE id = ?", [
    id,
  ]);
};

export const deleteFileRow = (id: string) => {
  return db.query("DELETE FROM files WHERE id = ?", [id]);
};

export const getExpiredFiles = () => {
  prepareDB(); // Ensure the table exists
  return db.query("SELECT * FROM files WHERE expiresAt < CURRENT_TIMESTAMP");
};
