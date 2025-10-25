#!/usr/bin/env node
import process from "node:process";
import { readFileSync } from "node:fs";
import { assertSafe } from "./lib/moderation.js";

const [, , arg] = process.argv;

const readInput = () => {
  if (arg && arg !== "-") {
    return readFileSync(arg, "utf8");
  }
  return readFileSync(0, "utf8");
};

const main = async () => {
  const input = readInput();
  if (!input || !input.trim()) {
    console.error("No content provided to moderate.");
    process.exit(1);
  }

  try {
    const moderation = await assertSafe(input, arg || "stdin");
    console.log(JSON.stringify({ status: "ok", categories: moderation.categories }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "blocked", message: error.message }, null, 2));
    process.exit(2);
  }
};

main();
