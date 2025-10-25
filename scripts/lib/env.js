import dotenv from "dotenv";

dotenv.config();

export const getEnv = (key, fallback = undefined) => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

export const requireEnv = (key) => {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  get geminiKey() {
    return requireEnv("GEMINI_API_KEY");
  },
  get sendgridKey() {
    return getEnv("SENDGRID_API_KEY");
  },
  get geminiModel() {
    return getEnv("GEMINI_MODEL", "gemini-1.5-flash");
  },
  get geminiImageModel() {
    return getEnv("GEMINI_IMAGE_MODEL", "imagen-3.0");
  },
  get siteUrl() {
  return getEnv("SITE_URL", "https://theloomreport.page");
  },
  get repoUrl() {
    return getEnv("REPO_URL");
  },
  get newsletterFrom() {
    return getEnv("NEWSLETTER_FROM", "TheLoomReport <digest@theloomreport.com>");
  },
  get newsletterRecipients() {
    return getEnv("NEWSLETTER_RECIPIENTS");
  },
  get unsubscribeUrl() {
  return getEnv("NEWSLETTER_UNSUBSCRIBE_URL", "https://theloomreport.page/unsubscribe");
  }
};
