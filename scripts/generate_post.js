#!/usr/bin/env node
import process from "node:process";
import path from "node:path";
import { format } from "date-fns";
import slugify from "slugify";
import { config } from "./lib/env.js";
import { chat, generateImage } from "./lib/gemini.js";
import { loadPrompt } from "./lib/prompts.js";
import { loadPosts, savePost } from "./lib/posts.js";
import { assertSafe } from "./lib/moderation.js";
import { saveImageVariants } from "./lib/image.js";

const summarizePosts = (posts, limit = 5) => {
  return posts.slice(0, limit).map((post) => {
    const date = format(post.date, "yyyy-MM-dd");
    const tags = Array.isArray(post.data.tags) ? post.data.tags.join(", ") : "";
    return `- ${post.data.title} (${date}) — tags: ${tags}`;
  }).join("\n");
};

const extractExcerpt = (markdown, length = 400) => {
  const text = markdown.replace(/```[\s\S]*?```/g, "").replace(/[#>*_`~\[\]]/g, "");
  return text.slice(0, length).trim();
};

const parseJson = (input, label) => {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Failed to parse ${label}: ${error.message}\nContent: ${input}`);
  }
};

const run = async () => {
  const posts = await loadPosts();
  const recentSummary = summarizePosts(posts);

  const topicPrompt = await loadPrompt("topic-generator.md", { recent_posts: recentSummary });
  const topicResponse = await chat({
    messages: [
      { role: "system", content: "You are the research editor for TheLoomReport." },
      { role: "user", content: topicPrompt }
    ],
    responseFormat: "json"
  });
  const topicPlan = parseJson(topicResponse, "topic plan");

  await assertSafe(topicPlan.title, "title");
  await assertSafe(topicPlan.angle, "angle");

  const articlePrompt = await loadPrompt("article-writer.md", { plan: JSON.stringify(topicPlan, null, 2) });
  const articleMarkdown = await chat({
    messages: [
      { role: "system", content: "You write deeply analytical technology journalism for TheLoomReport." },
      { role: "user", content: articlePrompt }
    ],
    responseFormat: "text"
  });

  await assertSafe(articleMarkdown, "article");

  const excerpt = extractExcerpt(articleMarkdown);
  const metaPrompt = await loadPrompt("meta-description.md", {
    title: topicPlan.title,
    excerpt
  });
  const metaResponse = await chat({
    messages: [
      { role: "system", content: "You craft metadata for SEO-optimized journalism." },
      { role: "user", content: metaPrompt }
    ],
    responseFormat: "json"
  });
  const meta = parseJson(metaResponse, "meta description");
  await assertSafe(meta.description, "meta description");
  if (meta.hero_alt) {
    await assertSafe(meta.hero_alt, "hero alt text");
  }

  const imagePromptTemplate = await loadPrompt("image-prompt.md", {
    title: topicPlan.title,
    angle: topicPlan.angle
  });
  const imagePromptResponse = await chat({
    messages: [
      { role: "system", content: "You generate cinematic illustration prompts for AI image models." },
      { role: "user", content: imagePromptTemplate }
    ],
    responseFormat: "json"
  });
  const imagePlan = parseJson(imagePromptResponse, "image prompt");
  await assertSafe(imagePlan.prompt, "image prompt");

  const imageResult = await generateImage({ prompt: imagePlan.prompt });
  const dateSlug = format(new Date(), "yyyy-MM-dd");
  const postSlug = slugify(topicPlan.title, { lower: true, strict: true });
  const baseName = `${dateSlug}-${postSlug}`;
  const generatedDir = path.resolve(process.cwd(), "src/assets/generated");
  const heroImage = await saveImageVariants({
    base64: imageResult.b64_json,
    outputDir: generatedDir,
    baseName
  });

  const sanitizedTags = Array.isArray(topicPlan.tags) && topicPlan.tags.length > 0
    ? topicPlan.tags.map((tag) => slugify(tag, { lower: true, strict: true }))
    : Array.isArray(meta.keywords)
      ? meta.keywords.map((keyword) => slugify(keyword, { lower: true, strict: true }))
      : ["ai"];

  const frontmatter = {
    title: topicPlan.title,
    description: meta.description,
    date: `${dateSlug}`,
    tags: sanitizedTags,
    keywords: meta.keywords,
    hero: {
      image: heroImage.heroWebPath,
      alt: meta.hero_alt,
      sources: heroImage.variants.map((variant) => ({ width: variant.width, src: variant.webPath }))
    },
    image_prompt: imagePlan.prompt,
    negative_prompt: imagePlan.negative_prompt,
    moderation: {
      status: "passed",
      timestamp: new Date().toISOString()
    }
  };

  const filePath = await savePost(frontmatter, articleMarkdown);

  console.log(JSON.stringify({
    status: "draft-created",
    file: filePath,
    hero: heroImage.heroWebPath,
    title: topicPlan.title
  }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
