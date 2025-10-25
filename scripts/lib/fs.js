import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

export const ensureDir = async (dirPath) => {
  await mkdir(dirPath, { recursive: true });
};

export const fileExists = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const writeTextFile = async (filePath, content) => {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf8");
};

export const readTextFile = async (filePath) => {
  return readFile(filePath, "utf8");
};
