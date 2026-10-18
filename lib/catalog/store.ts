import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedCatalog, type CatalogData } from "./data/seed";

/**
 * File-backed catalogue store (version 1 of the admin portal).
 *
 * The whole catalogue lives in `data/catalog.json`, created from the seed on
 * first read. It suits a single-server deployment (`next start`, a VPS or a
 * container with a persistent volume). For serverless hosting, replace these
 * two functions with a database; nothing else needs to change.
 */

const FILE = path.join(process.cwd(), "data", "catalog.json");

export async function readCatalog(): Promise<CatalogData> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as CatalogData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const seed = seedCatalog();
    await writeCatalog(seed);
    return seed;
  }
}

export async function writeCatalog(data: CatalogData) {
  await mkdir(path.dirname(FILE), { recursive: true });
  // Write to a temp file first so a crash never leaves a half-written catalogue.
  const temp = `${FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, FILE);
}
