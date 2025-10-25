import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import slugify from "slugify";
import { ensureDir, writeTextFile } from "./fs.js";

const POSTS_DIR = path.resolve(process.cwd(), "src/posts");

export const listPostFiles = async (dir = POSTS_DIR, prefix = "") => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listPostFiles(entryPath, path.join(prefix, entry.name));
      files.push(...nested);
    } else if (entry.name.endsWith(".md")) {
      files.push(path.join(prefix, entry.name));
    }
  }
  return files;
};

export const loadPosts = async () => {
  const files = await listPostFiles();
  const posts = [];
  for (const relativePath of files) {
    const absolutePath = path.join(POSTS_DIR, relativePath);
    const raw = await readFile(absolutePath, "utf8");
    const parsed = matter(raw);
    const url = `/posts/${relativePath.replace(/\\/g, "/").replace(/\.md$/, "/")}`;
    posts.push({
      ...parsed,
      path: absolutePath,
      relativePath,
      url,
      date: new Date(parsed.data.date || parsed.data.published || Date.now())
    });
  }
  return posts.sort((a, b) => b.date - a.date);
};

export const buildPostFilename = (title, date = new Date()) => {
  const slug = slugify(title, { lower: true, strict: true });
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return path.join(POSTS_DIR, `${year}/${month}/${day}-${slug}.md`);
};

export const savePost = async (frontmatter, content) => {
  const date = new Date(frontmatter.date || Date.now());
  const filePath = buildPostFilename(frontmatter.title, date);
  await ensureDir(path.dirname(filePath));
  const matterContent = matter.stringify(content.trim() + "\n", frontmatter);
  await writeTextFile(filePath, matterContent);
  return filePath;
};
