import { DateTime } from "luxon";
import rssPlugin from "@11ty/eleventy-plugin-rss";
import path from "node:path";
import slugify from "slugify";

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets/css/main.css");

  eleventyConfig.addPlugin(rssPlugin);

  const normalizeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const normalized = normalizeDate(dateObj);
    if (!normalized) return "";
    return DateTime.fromJSDate(normalized, { zone: "utc" }).toFormat("DDD");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const normalized = normalizeDate(dateObj);
    if (!normalized) return "";
    return DateTime.fromJSDate(normalized, { zone: "utc" }).toISODate();
  });

  eleventyConfig.addCollection("posts", (collection) => {
    return collection.getFilteredByGlob("./src/posts/**/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  eleventyConfig.addCollection("tagList", (collection) => {
    const tags = new Set();
    collection.getAll().forEach((item) => {
      const itemTags = item.data.tags || [];
      itemTags
        .filter((tag) => !["post", "all"].includes(tag) && !String(tag).startsWith("_"))
        .forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  eleventyConfig.addCollection("postsByYear", (collectionApi) => {
    const groups = new Map();
    collectionApi.getFilteredByGlob("./src/posts/**/*.md").forEach((item) => {
      const year = item.date.getUTCFullYear();
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year).push(item);
    });
    return Array.from(groups.entries())
      .map(([year, items]) => ({ year, items: items.sort((a, b) => b.date - a.date) }))
      .sort((a, b) => b.year - a.year);
  });

  eleventyConfig.addFilter("slug", (value) => {
    if (!value) return "";
    return slugify(value, { lower: true, strict: true });
  });

  eleventyConfig.addShortcode("seoHead", function({ title, description, url, image, type = "article", keywords = [] }) {
    const site = this.ctx.site || {};
    const pageTitle = title ? `${title} · ${site.title || "TheLoomReport"}` : site.title;
    const metaDescription = description || site.description;
  const canonicalUrl = url || `${site.domain || "https://theloomreport.page"}${this.page.url}`;
  const imageUrl = image || `${site.domain || "https://theloomreport.page"}/assets/og-default.svg`;
    const keywordString = Array.isArray(keywords) ? keywords.join(", ") : keywords;

    return `
      <title>${pageTitle}</title>
      <meta name="description" content="${metaDescription}" />
      <meta name="keywords" content="${keywordString}" />
      <link rel="canonical" href="${canonicalUrl}" />
      <meta property="og:type" content="${type}" />
      <meta property="og:title" content="${pageTitle}" />
      <meta property="og:description" content="${metaDescription}" />
      <meta property="og:url" content="${canonicalUrl}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${pageTitle}" />
      <meta name="twitter:description" content="${metaDescription}" />
      <meta name="twitter:image" content="${imageUrl}" />
      <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": type === "article" ? "Article" : "WebPage",
        "headline": pageTitle,
        "description": metaDescription,
        "url": canonicalUrl,
        "image": imageUrl,
        "publisher": {
          "@type": "Organization",
          "name": site.title,
          "url": site.domain
        }
      })}</script>
    `;
  });

  eleventyConfig.addShortcode("jsonLd", function(schema) {
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  });

  return {
    dir: {
      input: "src",
      includes: "templates/includes",
      layouts: "../layouts",
      data: path.join("..", "_data")
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"],
    passthroughFileCopy: true
  };
}
