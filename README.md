# TheLoomReport

AI-powered Eleventy publication that weaves daily analysis and a weekly digest about the frontier of artificial intelligence. The project automates story generation, image production, moderation, newsletter delivery, and GitHub deployment while keeping humans in the review loop.

## Feature highlights

- **Eleventy static site** with performant layouts, responsive hero images, and built-in SEO helpers (OpenGraph, Twitter cards, JSON-LD, sitemap, robots.txt, RSS feed).
- **Daily AI article drafts** produced at 03:00 UTC via Gemini (text + hero image) and opened as draft pull requests for editorial review.
- **Weekly newsletter** workflow that compiles the last seven days of coverage and sends HTML + plain-text email through SendGrid every Monday at 09:00 UTC.
- **Content safety** powered by a Gemini moderation classifier before drafts or newsletters are persisted or mailed.
- **Image optimization pipeline** that converts generated art into responsive WebP variants with sharp.
- **GitHub Pages deployment** with automated builds on PRs and continuous delivery on merges to `main`.

## Project structure

```
.
├── .github/workflows/       # CI/CD, daily drafts, and weekly newsletter automations
├── _data/                   # Global Eleventy data (site metadata, build time)
├── prompts/                 # Prompt templates for topics, articles, metadata, and images
├── scripts/                 # Automation scripts (generation, moderation, digest, newsletter, images)
├── src/                     # Eleventy source (pages, posts, templates, assets)
└── dist/                    # Transient digest/preview artifacts (ignored from git)
```

## Quick start

```bash
npm install
npm run start
```

- Local preview runs at [http://localhost:8080](http://localhost:8080) with live reload.
- Production builds emit to `./_site` using `npm run build`.

## Environment variables

Create a `.env` file (never commit) based on [`.env.example`](./.env.example):

| Key | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | Secret for Gemini text, image, and moderation calls. |
| `GEMINI_MODEL` | ➖ | Defaults to `gemini-1.5-flash`. Override if you prefer a different text model. |
| `GEMINI_IMAGE_MODEL` | ➖ | Defaults to `imagen-3.0`. |
| `SENDGRID_API_KEY` | ✅ for newsletter | Used by `scripts/send_newsletter.js` and the weekly workflow. |
| `NEWSLETTER_FROM` | ✅ | Display name + email (e.g. `TheLoomReport <digest@theloomreport.com>`). |
| `NEWSLETTER_RECIPIENTS` | ✅ for local tests | Comma-separated list of recipients (newsletters should ultimately use SendGrid lists). |
| `NEWSLETTER_UNSUBSCRIBE_URL` | ✅ | Link inserted into email headers and footer. |
| `SITE_URL` | ✅ | Canonical production hostname (`https://theloomreport.page`). |
| `REPO_URL` | ➖ | Used in generated metadata for provenance. |

> ⚠️ For GitHub Actions, mirror these values into repository **Secrets** with the same keys (plus optional `GEMINI_MODEL`/`GEMINI_IMAGE_MODEL`).

## Automation scripts

| Command | Purpose |
| --- | --- |
| `node scripts/generate_post.js` | Generates a moderated AI draft, hero image variants, and saves a Markdown post. |
| `node scripts/moderate_content.js <file>` | Moderates arbitrary text (file path or stdin) via Gemini. |
| `node scripts/generate_digest.js` | Builds the weekly HTML + text digest (writes to `dist/newsletter`). |
| `node scripts/send_newsletter.js` | Sends the latest digest through SendGrid (respects unsubscribe link). |
| `node scripts/optimize_image.js path/to/image.png` | Converts any image into responsive WebP variants using the house settings. |

Each script emits structured JSON to stdout for observability in GitHub Actions logs.

## GitHub workflows

| Workflow | Schedule | Summary |
| --- | --- | --- |
| `ci-deploy.yml` | PRs + push to `main` | Installs dependencies, runs the Eleventy build, and deploys to GitHub Pages on `main`. |
| `daily-generate.yml` | 03:00 UTC daily | Produces a fresh AI draft, saves assets, and opens a draft PR titled `AI Draft – YYYY-MM-DD`. |
| `weekly-newsletter.yml` | Mondays 09:00 UTC | Rebuilds the digest, uploads the artifact, and emails subscribers via SendGrid. |

**Required secrets**

- `GEMINI_API_KEY`
- `SENDGRID_API_KEY`
- `NEWSLETTER_FROM`
- `NEWSLETTER_RECIPIENTS`
- `NEWSLETTER_UNSUBSCRIBE_URL`
- Optional: `GEMINI_MODEL`, `GEMINI_IMAGE_MODEL`

## Moderation

- `scripts/lib/moderation.js` queries Gemini to classify content across harassment, hate, self-harm, and sexual-minor categories.
- Draft titles, descriptions, article bodies, hero prompts, and newsletter HTML all pass through moderation.
- Failures abort the workflow and prevent drafts from being committed or emails from being dispatched.

## Costs & operational notes

- **Google Gemini**: Daily article generation uses 3 text generations (topic, article, metadata) and 1 image generation. Weekly email reuse of moderation is minimal.
- **SendGrid**: Weekly sends depend on your plan and recipient count.
- **GitHub Actions**: Daily + weekly workflows consume roughly ~10 minutes of runtime per week.

Monitor expenses by setting usage alerts in both Google AI Studio and SendGrid dashboards, and consider rolling in cheaper models if volume spikes.

## Deployment

1. Ensure `Actions > General > Workflow permissions` allows GitHub Pages deployments.
2. Set the repository Pages source to "GitHub Actions".
3. Update DNS records for `theloomreport.page` to point at GitHub Pages (A records + CNAME).
4. Drop a `CNAME` file inside `src/` if you want Eleventy to publish it automatically.

## Editorial workflow

1. Daily workflow opens draft PRs under `ai-draft/YYYY-MM-DD`.
2. Editors review content, adjust prompts if necessary, and merge when approved.
3. Merge triggers `ci-deploy` to rebuild and publish.
4. Weekly digest ships only published posts from the previous week.

## Local testing checklist

- `npm run start` – Live-reload preview.
- `node scripts/generate_post.js` – Generates a sample draft (requires Gemini keys).
- `node scripts/generate_digest.js` – Produces digest HTML/text in `dist/newsletter/`.

## Accessibility & performance

- Semantic HTML, accessible color contrasts, and keyboard-friendly forms.
- Responsive WebP hero images with lazy loading and `srcset`.
- Mobile-first layout with `prefers-color-scheme` aware theme toggle.
