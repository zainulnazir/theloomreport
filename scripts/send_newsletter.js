#!/usr/bin/env node
import process from "node:process";
import sg from "@sendgrid/mail";
import { config } from "./lib/env.js";
import { buildWeeklyDigest } from "./lib/digest.js";
import { assertSafe } from "./lib/moderation.js";

const parseRecipients = (value) =>
  value
    .split(/[,;\s]/)
    .map((email) => email.trim())
    .filter(Boolean);

const main = async () => {
  const apiKey = config.sendgridKey;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is required to send the newsletter.");
  }

  const recipientsEnv = config.newsletterRecipients;
  if (!recipientsEnv) {
    throw new Error("NEWSLETTER_RECIPIENTS must list one or more comma-separated emails.");
  }
  const recipients = parseRecipients(recipientsEnv);
  if (!recipients.length) {
    throw new Error("No valid recipient emails parsed from NEWSLETTER_RECIPIENTS.");
  }

  const digest = await buildWeeklyDigest({ unsubscribeUrl: config.unsubscribeUrl });
  if (!digest.hasPosts) {
    console.log(JSON.stringify({ status: "no-posts", message: "No posts discovered for digest." }));
    return;
  }

  await assertSafe(digest.html, "newsletter-html");

  sg.setApiKey(apiKey);
  const subject = `${config.newsletterFrom.split("<")[0].trim()} Digest — ${digest.weekLabel}`;

  const msg = {
    to: recipients,
    from: config.newsletterFrom,
    subject,
    html: digest.html,
    text: digest.text,
    headers: {
      "List-Unsubscribe": `<${config.unsubscribeUrl}>`
    }
  };

  await sg.send(msg, true);

  console.log(JSON.stringify({
    status: "newsletter-sent",
    subject,
    recipients,
    posts: digest.posts.map((post) => post.data.title)
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
