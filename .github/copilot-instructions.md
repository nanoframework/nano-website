# Repository instructions

## Build and checks

Use Node.js 22.22 or later. After cloning, install the locked dependencies with `npm ci`.

- `npm run dev` starts the local site at `http://localhost:4321`.
- `npm run check` runs `astro check` for TypeScript, Astro components, and content validation.
- `npm run build` generates the static site in `dist/`.
- `npm run preview` serves the generated `dist/` site.

The pull-request workflow runs `npm ci`, `npx astro check`, and `npm run build`. There is no configured test runner or lint script, so there is no single-test command; `astro check` validates the project and content collections as a whole.

## Architecture

- This is an Astro static site. Astro pages and layouts live in `src/pages/` and `src/layouts/`; reusable UI is in `src/components/`, with home and blog components grouped by feature. `src/styles/global.css` defines the shared theme.
- Content is managed through Astro collections declared in `src/content.config.ts`: blog posts in `src/content/blog/`, standalone Markdown pages in `src/content/pages/`, and author records in `src/data/authors.json`.
- `src/pages/[...path].astro` builds post and content-page routes at the site root to preserve WordPress permalinks. `src/lib/posts.ts` filters drafts and future-dated posts from production, sorts posts newest-first, and provides shared URL, date, and pagination helpers. Keep post and page IDs unique.
- Explicit routes such as the home page, blog index, tag pages, RSS feed, and partner/support pages are implemented under `src/pages/`; they compose layouts and feature components rather than being content collection entries.
- `src/data/site.ts` centralizes site links and shared lists, including navigation, sponsors, hardware targets, and blog tag keys. Blog tag labels and the collection schema both depend on its tag definitions.
- `astro.config.mjs` preserves trailing-slash directory URLs and configures the sitemap, redirects, and Azure integration. `src/data/redirects.mjs` maps legacy WordPress URLs; `src/integrations/azure-static-web-apps.mjs` writes Azure's static-web-app configuration during builds, including redirects, headers, and 404 handling.
- `.github/workflows/azure-static-web-apps.yml` checks and builds pull requests, deploys previews when repository secrets are available, deploys `main`, and rebuilds daily so scheduled posts can publish.

## Content and code conventions

- A blog post can be `src/content/blog/<slug>.md`, or `src/content/blog/<slug>/index.md` when it has local assets. The slug is its root-level URL (`/<slug>/`); keep existing slugs stable. Place post images alongside the Markdown and use relative paths.
- Blog frontmatter is validated by `src/content.config.ts`: `title`, `date`, an `author` reference, and at least one `tags` value are required. Authors must exist in `src/data/authors.json`; tags must be keys in `TAGS` in `src/data/site.ts`. Optional fields include `description`, `updated`, `cover`, `coverAlt`, and `draft`.
- To add a standalone content page, create `src/content/pages/<path>/index.md`; its directory path becomes the URL. Use an explicit Astro route under `src/pages/` when the page needs custom rendering or behavior.
- Keep shared links and data in `src/data/site.ts` rather than duplicating them in components. When changing a blog tag, update the central `TAGS` definition and ensure existing post frontmatter remains valid.
- Existing WordPress routes and trailing slashes are compatibility behavior. Update `src/data/redirects.mjs` when a legacy route is moved or retired, and preserve the generated Azure behavior when changing build integration.
- Blog posts are published under CC BY-ND 4.0; follow the contribution terms in `CONTRIBUTING.md` when editing or adding post content.

## Tracking links

- For shared campaign links to `nanoframework.net`, use `?ref=<name>` (or `&ref=<name>` when the URL already has a query string). Keep names short, lowercase, hyphen-separated, and consistent; do not include personal or private information. See `TRACKING-LINKS.md` for naming patterns and examples.
- Use `utm_` parameters when a platform adds them or when a named campaign needs to be grouped in GoatCounter. Do not tag links between pages on this site.
- Clicks on the site's own buttons and outbound links are tracked automatically. To name a specific click, add `data-track="where/name"`; in Markdown, use an HTML `<a>` element for this attribute.
