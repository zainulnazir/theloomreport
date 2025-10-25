## Copilot Instruction Prompt: Build "TheLoomReport" AI Blog

**Goal:**
Create a fully functional, AI-powered, high-performance, SEO-optimized static blog called **TheLoomReport**. The blog should run on **GitHub Pages** using a **custom domain**, with automatic AI-generated posts and newsletters.

---

### 🔧 Core Stack

* **Static site generator:** Eleventy (11ty) preferred, Hugo acceptable alternative.
* **Deployment:** GitHub Actions (CI/CD) to GitHub Pages.
* **Language:** JavaScript / Node.js.
* **Hosting:** GitHub Pages with custom domain `theloomreport.page`.
* **AI Engine:** Gemini API (use secret `GEMINI_API_KEY`).
* **Email Automation:** SendGrid API (use secret `SENDGRID_API_KEY`).

---

### ⚙️ Functional Requirements

1. **Automatic AI Post Generation (Daily)**

   * Every day, generate one new markdown post using Gemini.
   * Each post includes: title, meta description, keywords/tags, hero image prompt, full markdown content.
   * Save under `/src/posts/` with YAML frontmatter.
   * Create a Pull Request for human review before publishing.

2. **Automatic Newsletter Digest (Weekly)**

   * Every Monday, compile all posts from the past week into a digest.
   * Send HTML + plain-text email through SendGrid.
   * Include unsubscribe link and proper email styling.

3. **SEO & Performance**

   * Generate sitemap.xml and robots.txt.
   * Add OpenGraph, Twitter Card, and JSON-LD metadata.
   * Optimize images (WebP, responsive sizes, lazy load).
   * Include canonical URLs, RSS feed, and mobile-first layout.

4. **AI Image Generation**

   * Use Gemini's image generation (or equivalent) to create hero images.
   * Optimize using `sharp` and store responsive versions.

5. **Moderation & Safety**

   * Implement a `moderate_content.js` script to filter unsafe outputs.
   * Block flagged content from publishing automatically.

6. **Publishing Workflow**

   * Drafts go through Pull Requests titled `AI Draft – YYYY-MM-DD`.
   * Editor merges to publish.
   * Automatic deployment on merge via CI.

7. **Automation Workflows**

   * `daily-generate.yml`: Runs every day (03:00 UTC) to create AI draft posts.
   * `weekly-newsletter.yml`: Runs every Monday (09:00 UTC) to send newsletter.
   * `ci-deploy.yml`: Runs on push to `main` for build & deploy.

8. **Metadata & Structure**

   * Store metadata in `_data/site.json`: title, description, domain, social links.
   * Pages: Home, About, Topics, Archives, Subscribe.
   * Include newsletter signup form integrated with SendGrid, using a pill-shaped email input paired with a centered primary CTA button inside a gradient callout card.

9. **AI Prompt Templates**

   * Store in `/prompts/`: topic generator, article writer, meta description, and image prompt.

10. **Security**

    * All secrets stored in GitHub Secrets.
    * Provide `.env.example` (no real keys).
    * Sensitive tasks executed only in GitHub Actions.

11. **Documentation**

    * `README.md` should explain setup, environment variables, workflow schedules, local preview, costs, and moderation logic.

12. **Design & Style**

    * Minimalist, modern UI using TailwindCSS or vanilla CSS.
   * Include a dark/light mode toggle that uses icons only, backed by visually hidden accessible text.
    * Accessible and fast (WCAG 2.1 AA compliance).

---

### 🗂 Repository Layout

```
TheLoomReport/
├─ .github/workflows/
│  ├─ ci-deploy.yml
│  ├─ daily-generate.yml
│  └─ weekly-newsletter.yml
├─ scripts/
│  ├─ generate_post.js
│  ├─ moderate_content.js
│  ├─ generate_digest.js
│  ├─ send_newsletter.js
│  └─ optimize_image.js
├─ src/
│  ├─ posts/
│  ├─ templates/
│  ├─ assets/
│  └─ index.md
├─ _data/site.json
├─ eleventy.config.js
├─ package.json
├─ .gitignore
├─ robots.txt
├─ sitemap.xml (auto-generated)
└─ README.md
```

---

### 🧩 Expected Copilot Output

* Generate all code, workflows, and templates to make the system operational.
* Functional daily AI post generation and weekly newsletter.
* Fully SEO-optimized static site.
* Configurable via GitHub Secrets.
* Human review flow before publishing.

---

### ✅ Final Instructions to Copilot

1. Scaffold the above project structure and configuration.
2. Write all code, workflow YAMLs, and Eleventy setup files.
3. Implement daily AI posting, newsletter automation, and SEO optimization.
4. Make it fully ready to run after environment secrets are set.

**Project Name:** `TheLoomReport`
