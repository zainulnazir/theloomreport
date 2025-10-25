import path from "node:path";
import { format, subDays, startOfWeek } from "date-fns";
import { loadPosts } from "./posts.js";
import { htmlToText } from "html-to-text";

export const getWeekWindow = (reference = new Date()) => {
  const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
  const windowStart = subDays(weekStart, 7);
  return { weekStart, windowStart };
};

const renderHtml = (posts, weekLabel, unsubscribeUrl = "#") => {
  const items = posts
    .map(
      (post) => `
    <article style="margin-bottom:2rem;">
  <h2 style="margin-bottom:0.25rem;"><a href="https://theloomreport.page${post.url}">${post.data.title}</a></h2>
      <p style="margin-top:0; color:#475569;"><em>${format(post.date, "PPP")}</em></p>
      <p style="line-height:1.6;">${post.data.description}</p>
      <p style="font-size: 0.9rem; color: #6366f1;">${(post.data.tags || []).map((tag) => `#${tag}`).join(" ")}</p>
    </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>TheLoomReport Digest — ${weekLabel}</title>
  </head>
  <body style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif; max-width:620px; margin:0 auto; padding:2rem; background:#0f172a0d;">
    <header style="margin-bottom:2rem;">
      <h1 style="margin:0 0 0.5rem;">TheLoomReport Digest</h1>
      <p style="margin:0; color:#475569;">Coverage window: ${weekLabel}</p>
    </header>
    ${items}
    <hr style="margin:3rem 0; border:0; border-top:1px solid #cbd5f5;"/>
    <footer style="font-size:0.8rem; color:#475569;">
      <p>You are receiving this newsletter because you subscribed to TheLoomReport.</p>
  <p><a href="${unsubscribeUrl}">Unsubscribe</a> · <a href="https://theloomreport.page">Visit the site</a></p>
    </footer>
  </body>
</html>`;
};

export const buildWeeklyDigest = async ({ referenceDate = new Date(), unsubscribeUrl = "#" } = {}) => {
  const { weekStart, windowStart } = getWeekWindow(referenceDate);
  const posts = await loadPosts();
  const recentPosts = posts.filter((post) => post.date >= windowStart && post.date < weekStart);

  const weekLabel = `${format(windowStart, "MMM d")} – ${format(weekStart, "MMM d, yyyy")}`;

  if (!recentPosts.length) {
    return {
      hasPosts: false,
      weekLabel,
      posts: recentPosts,
      html: "",
      text: ""
    };
  }

  const html = renderHtml(recentPosts, weekLabel, unsubscribeUrl);
  const text = htmlToText(html, { wordwrap: 80 });

  return {
    hasPosts: true,
    weekLabel,
    posts: recentPosts,
    html,
    text,
    stamp: format(weekStart, "yyyy-MM-dd"),
    windowStart,
    weekStart
  };
};

export const digestOutputPaths = (stamp) => {
  const distDir = path.resolve(process.cwd(), "dist/newsletter");
  return {
    distDir,
    htmlPath: path.join(distDir, `${stamp}.html`),
    textPath: path.join(distDir, `${stamp}.txt`)
  };
};
