#!/usr/bin/env node
import process from "node:process";
import { ensureDir, writeTextFile } from "./lib/fs.js";
import { assertSafe } from "./lib/moderation.js";
import { buildWeeklyDigest, digestOutputPaths } from "./lib/digest.js";

const main = async () => {
  const digest = await buildWeeklyDigest({ unsubscribeUrl: process.env.NEWSLETTER_UNSUBSCRIBE_URL });

  if (!digest.hasPosts) {
    console.log(JSON.stringify({ status: "no-posts", message: "No posts to summarize." }));
    return;
  }

  await assertSafe(digest.html, "newsletter-html");

  const { distDir, htmlPath, textPath } = digestOutputPaths(digest.stamp);
  await ensureDir(distDir);
  await writeTextFile(htmlPath, digest.html);
  await writeTextFile(textPath, digest.text);

  console.log(JSON.stringify({
    status: "digest-ready",
    htmlPath,
    textPath,
    posts: digest.posts.map((post) => ({
      title: post.data.title,
      date: post.date,
      file: post.relativePath
    }))
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
