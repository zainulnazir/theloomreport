import path from "node:path";
import { readFile } from "node:fs/promises";

const PROMPTS_DIR = path.resolve(process.cwd(), "prompts");

const interpolate = (template, variables = {}) => {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const value = variables[key.trim()];
    if (value === undefined || value === null) return "";
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  });
};

export const loadPrompt = async (filename, variables) => {
  const template = await readFile(path.join(PROMPTS_DIR, filename), "utf8");
  return interpolate(template, variables);
};
