import path from "node:path";
import sharp from "sharp";
import { ensureDir, writeTextFile } from "./fs.js";

const SIZES = [1600, 1200, 800];

export const saveImageVariants = async ({ base64, outputDir, baseName }) => {
  const buffer = Buffer.from(base64, "base64");
  await ensureDir(outputDir);
  const assetsRoot = path.resolve(process.cwd(), "src/assets");

  const originalPath = path.join(outputDir, `${baseName}-original.png`);
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(originalPath);

  const variants = await Promise.all(
    SIZES.map(async (width) => {
      const filePath = path.join(outputDir, `${baseName}-${width}.webp`);
      await sharp(buffer)
        .resize({ width, height: Math.round((width * 9) / 16), fit: "cover" })
        .webp({ quality: 85 })
        .toFile(filePath);
      const relative = path.relative(assetsRoot, filePath).split(path.sep).join("/");
      return {
        width,
        path: filePath,
        webPath: `/assets/${relative}`
      };
    })
  );

  const heroVariant = variants[0];

  return {
    originalPath,
    variants,
    heroWebPath: heroVariant?.webPath || null
  };
};

export const writeImageMetadata = async ({ outputDir, baseName, sources }) => {
  const metadataPath = path.join(outputDir, `${baseName}.json`);
  await writeTextFile(metadataPath, JSON.stringify({ sources }, null, 2));
  return metadataPath;
};
