# nanoframework.net

Source of the [.NET nanoFramework](https://nanoframework.net) website: home page, blog and project pages.
Built with [Astro](https://astro.build) from Markdown files – no CMS, no database.

## Run it locally

Requires Node.js 22.22 or later.

```shell
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # static site in ./dist
npm run preview    # serve ./dist
npm run check      # type + content validation (also runs on every pull request)
```

## Project layout

```
src/
  content/blog/        blog posts (Markdown) – one file or folder per post
  content/pages/       standalone pages: partners, press kit, contact… (folder path = URL)
  data/site.ts         links, nav, reference targets, case studies, sponsors, blog tags
  data/authors.json    blog authors
  data/redirects.mjs   old WordPress URLs -> new ones (categories, tags, renamed pages, feeds)
  components/          header, footer, home sections, blog cards
  pages/               routes: /, /blog/, /blog/page/N/, /tag/<tag>/, /rss.xml,
                       and [...path].astro for every post (/<slug>/) and page (/<path>/)
  styles/global.css    theme: brand colors, type, buttons, cards
  assets/              logos
public/                favicons, manifest, robots.txt
```

Most day-to-day edits (a new sponsor, a new reference target, a changed link) are a one-line change in
`src/data/site.ts`.

## Writing a blog post

1. Create `src/content/blog/<slug>.md` – or `src/content/blog/<slug>/index.md` if the post has images,
   and put the images next to it. The `<slug>` becomes the URL: `https://nanoframework.net/<slug>/`.
2. Start the file with this header:

   ```markdown
   ---
   title: "Your post title"
   description: "One or two sentences shown in previews and search results."
   date: 2026-10-20
   author: jose-simoes          # an id from src/data/authors.json (add yourself there)
   tags: [releases]             # one or more of: releases, engineering, tooling, networking, hardware, community
   cover: ./cover.png           # optional, relative to the post
   coverAlt: "What the cover shows"
   draft: false                 # true keeps it out of the published site
   ---
   ```

3. Write the post in Markdown below the header. Code blocks get VS Code Dark+ highlighting:
   use ` ```csharp `, ` ```shell `, ` ```json `…
4. Open a pull request. The build checks the header (missing title, unknown tag or author fails the build).

A post with a future `date` is published automatically on that day by the next scheduled build.

## Migrating from WordPress

The posts in `src/content/blog/` and the pages in `src/content/pages/` were generated from the WordPress export with:

```shell
npm run migrate:wordpress -- path/to/export.xml                    # images still served by WordPress
npm run migrate:wordpress -- path/to/export.xml --download-images  # copy every image next to its post
```

Run it once more **with `--download-images`** (from a machine with internet access) before the old
WordPress site is switched off – until then, post images are loaded from `nanoframework.net/wp-content/uploads`.
Re-running overwrites the generated post folders, so do it before editing posts by hand.

## Adding a page

Create `src/content/pages/<path>/index.md` with a `title:` (and optionally `description:`) header.
`src/content/pages/partner-program/acme/index.md` is served at `/partner-program/acme/`.

## Hosting (Azure Static Web Apps)

The site is static and hosted on Azure Static Web Apps, deployed by
`.github/workflows/azure-static-web-apps.yml`:

- **push to `main`** → production
- **pull request** → its own preview URL, posted on the PR (removed when the PR closes).
  PRs from forks are built and checked, but don't get a preview (forks can't use repo secrets).
- **daily at 05:00 UTC** → rebuild, so posts with a future `date:` publish on their day

Each build writes `dist/staticwebapp.config.json` (see `src/integrations/azure-static-web-apps.mjs`):
the old WordPress URLs from `src/data/redirects.mjs` as 301 redirects, the 404 page, caching and
security headers.

### One-time setup

1. In the Azure portal, create a **Static Web App** (Free plan is enough to start), deployment source **Other**.
2. Copy its **deployment token** (Overview → Manage deployment token) into the repository secret
   `AZURE_STATIC_WEB_APPS_API_TOKEN`.
3. Push to `main`; the site appears on its `*.azurestaticapps.net` address.
4. Custom domains → add `www.nanoframework.net` (CNAME) and `nanoframework.net` (TXT validation, then an
   ALIAS/ANAME record, or Azure DNS). Azure issues and renews the HTTPS certificates.

## Brand

Colors, typeface and logos follow the official .NET nanoFramework brand guidelines:
`#181730` · `#29235C` · `#009086` · `#4CB48C`, Open Sans for all text.
Tokens live at the top of `src/styles/global.css`.

## License

MIT, like the rest of .NET nanoFramework.
