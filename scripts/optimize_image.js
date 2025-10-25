#!/usr/bin/env node
import process from "node:process";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { saveImageVariants } from "./lib/image.js";

const [, , inputPath] = process.argv;

const main = async () => {
  if (!inputPath) {
    console.error("Usage: node scripts/optimize_image.js <imagePath>");
    process.exit(1);
  }

  const absoluteInput = path.resolve(process.cwd(), inputPath);
  const buffer = await readFile(absoluteInput);
  const baseName = path.parse(absoluteInput).name;
  const outputDir = path.resolve(process.cwd(), "src/assets/generated");
  const variants = await saveImageVariants({ base64: buffer.toString("base64"), outputDir, baseName });

  console.log(JSON.stringify({
    status: "optimized",
    hero: variants.heroWebPath,
    variants: variants.variants.map((item) => ({ width: item.width, src: item.webPath }))
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
