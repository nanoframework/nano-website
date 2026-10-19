#!/usr/bin/env node
/**
 * Convert a WordPress export (WXR .xml) into Markdown blog posts for this site.
 *
 *   node scripts/migrate-wordpress.mjs <export.xml> [--download-images] [--out src/content/blog] [--pages-out src/content/pages]
 *
 * - Every published post becomes src/content/blog/<wordpress-slug>/index.md,
 *   so the URL stays https://nanoframework.net/<slug>/.
 * - Published pages listed in PAGES become src/content/pages/<path>/index.md.
 * - WordPress categories are mapped to the site's six tags (see TAG_RULES).
 * - Approved comments are kept in the post's front matter (legacyComments) and
 *   shown as an archive under the post.
 * - Without --download-images, images keep pointing at nanoframework.net/wp-content/uploads.
 *   With it, every image (and the featured image, as `cover:`) is downloaded next to the post
 *   and links are rewritten. Run that before the WordPress site is switched off.
 *
 * Safe to re-run: it overwrites the generated post folders, nothing else.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';
import { decodeHTML } from 'entities';

// ---------------------------------------------------------------- options

const args = process.argv.slice(2);
const xmlPath = args.find((a, i) => !a.startsWith('--') && !['--out', '--pages-out'].includes(args[i - 1]));
const download = args.includes('--download-images');
const outIdx = args.indexOf('--out');
const outDir = path.resolve(outIdx >= 0 ? args[outIdx + 1] : 'src/content/blog');
const pagesIdx = args.indexOf('--pages-out');
const pagesDir = path.resolve(pagesIdx >= 0 ? args[pagesIdx + 1] : 'src/content/pages');

if (!xmlPath) {
  console.error('Usage: node scripts/migrate-wordpress.mjs <export.xml> [--download-images] [--out <dir>]');
  process.exit(1);
}

// WordPress login -> id in src/data/authors.json
const AUTHORS = {
  jassimoes: 'jose-simoes',
  ellerbach: 'laurent-ellerbach',
  networkfusion: 'robin-jones',
  nanofadmin: 'nanoframework-team',
};

// WordPress category -> site tag. First match in this order wins for the primary tag;
// up to two tags are kept per post.
const TAG_RULES = [
  ['hardware', ['esp32', 'ti', 'cc32xx', 'cc13x2', 'silabs', 'giantgecko', 'radio', 'products', 'stm32']],
  ['networking', ['networking', 'tls', 'ssl', 'mqtt', 'amqp', 'wi-fi']],
  ['tooling', ['tools', 'visual-studio', 'vs-code', 'vs-extension', 'nuget', 'obfuscation', 'cps']],
  ['engineering', ['cmake', 'ci', 'cd', 'ci-cd', 'devops', 'c-managed-code', 'c-c-native-code', 'interop', 'json', 'documentation', 'azure']],
  ['community', ['project']],
];
// Titles are often more telling than the old categories.
const TITLE_RULES = [
  ['releases', /\b(releas|is here|are here|is out|are out|available|is official|v\d+\.\d|welcome|introducing)/i],
  ['hardware', /\b(esp32|stm32|board|hardware|firmware|silabs|gecko|cc32|cc13|pico|ulx3s|palthree|device)/i],
  ['networking', /\b(network|tls|ssl|mqtt|wi-?fi|over-the-air)/i],
  ['tooling', /\b(visual studio|vs ?code|extension|debug|flasher|nuget|tool|unit test|image generator|sonarcloud|obfuscation)/i],
  ['engineering', /\b(build|cmake|kconfig|test|pipeline|generics|multithreading|attribute|interop|filesystem|events|back ?trace|documentation)/i],
];

// ---------------------------------------------------------------- parse

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  processEntities: false,
  htmlEntities: false,
  cdataPropName: false,
  isArray: (name) => ['item', 'category', 'wp:postmeta', 'wp:comment', 'wp:author'].includes(name),
  parseTagValue: false,
  trimValues: false,
});
const xml = parser.parse(await readFile(xmlPath, 'utf8'));
const items = xml.rss.channel.item;
const text = (v) => (v == null ? '' : typeof v === 'object' ? String(v['#text'] ?? '') : String(v));
const meta = (item, key) => (item['wp:postmeta'] ?? []).find((m) => text(m['wp:meta_key']) === key)?.['wp:meta_value'];

const attachments = new Map(); // id -> original URL
const attachmentUrls = new Set();
for (const it of items) {
  if (text(it['wp:post_type']) === 'attachment') {
    const url = text(it['wp:attachment_url']).trim();
    attachments.set(text(it['wp:post_id']), url);
    attachmentUrls.add(normalizeUrl(url));
  }
}

const posts = items.filter((it) => text(it['wp:post_type']) === 'post' && text(it['wp:status']) === 'publish');

// ---------------------------------------------------------------- html -> markdown

const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});
td.use(gfm);
td.keep(['sub', 'sup']);

// Code blocks: keep the language WordPress knew about, or guess it.
td.addRule('codeBlocks', {
  filter: (node) => node.nodeName === 'PRE',
  replacement: (_content, node) => {
    const lang = node.getAttribute('data-lang') || guessLanguage(node.textContent);
    const code = node.textContent.replace(/\n+$/, '');
    const fence = code.includes('```') ? '~~~' : '```';
    return `\n\n${fence}${lang}\n${code}\n${fence}\n\n`;
  },
});
td.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => (content.trim() ? `\n\n_${content.trim()}_\n\n` : ''),
});

function guessLanguage(code) {
  const c = code.trim();
  if (/^\s*-?\s*(task|pool|steps|jobs|stages|parameters|variables|trigger|inputs|displayName):/m.test(c)) return 'yaml';
  if (/\.ps1\b|Write-(Host|Output)|Get-ChildItem|\$\(Agent\.|^\s*\$\w+\s*=/m.test(c)) return 'powershell';
  if (/^(nanoff|dotnet|git|cmake|npm|choco|winget|sudo|docker|bash|apt|chmod|curl|wget|export|mkdir|cd |\$ |idf\.py)\b/m.test(c) || /^\w+="/m.test(c)) return 'shell';
  if (/^\s*[{[]\s*("|$)/.test(c) && /"\s*:/.test(c)) return 'json';
  if (/^<[?a-zA-Z]/.test(c)) return 'xml';
  if (/^#include|^#define|\b(uint8_t|uint32_t|HRESULT|NANOCLR_)/m.test(c)) return 'cpp';
  if (/\b(using System|namespace |public (static |sealed )?(class|void|int)|new \w+\(|Debug\.WriteLine|Thread\.Sleep)/.test(c)) return 'csharp';
  if (/\b(var|bool|int|string|byte|uint)\s+\w+\s*=/.test(c) || /\b[A-Z]\w+\.\w+\(.*\);\s*$/m.test(c)) return 'csharp';
  return '';
}

/** Escape things like <T> or <int> in prose so Markdown doesn't treat them as HTML. */
function escapeStrayTags(md) {
  const html = /^\/?(a|b|i|u|em|strong|code|sub|sup|br|img|span|div|p|kbd|small|mark|del|ins)\b/i;
  return md
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/)
    .map((part, i) => (i % 2 ? part : part.replace(/<([A-Za-z][\w, ]*)>/g, (m, inner) => (html.test(inner) ? m : `\\<${inner}>`))))
    .join('');
}

/** Classic-editor posts store paragraphs as blank-line-separated text (WordPress "wpautop"). */
function autop(html) {
  const pres = [];
  let s = html.replace(/<pre[\s\S]*?<\/pre>/gi, (m) => `\u0000${pres.push(m) - 1}\u0000`);
  const block = /^\s*<\/?(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|blockquote|figure|pre|hr|iframe|\u0000)/i;
  s = s
    .split(/\n\s*\n/)
    .map((chunk) => (block.test(chunk) ? chunk : `<p>${chunk.replace(/\n/g, '<br>\n')}</p>`))
    .join('\n');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => pres[Number(i)]);
}

function preprocess(html) {
  let s = html;
  const isBlock = s.includes('<!-- wp:');
  // Carry block-editor code languages onto the <pre> before dropping the comments.
  s = s.replace(/<!-- wp:syntaxhighlighter\/code (\{.*?\}) -->\s*<pre[^>]*>/g, (_m, json) => {
    let lang = '';
    try { lang = JSON.parse(json).language ?? ''; } catch {}
    return `<pre data-lang="${lang}">`;
  });
  s = s.replace(/<pre class="EnlighterJSRAW" data-enlighter-language="([^"]*)"[^>]*>/g, (_m, lang) =>
    `<pre data-lang="${lang === 'generic' ? '' : lang}">`);
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  if (!isBlock) s = autop(s);
  // Shortcodes
  s = s.replace(/\[youtube ([^\]\s]+)[^\]]*\]/g, (_m, url) => {
    const u = decodeHTML(url).split('&w=')[0];
    return `<p><a href="${u}">Watch the video on YouTube</a></p>`;
  });
  s = s.replace(/\[wpvideo (\w+)[^\]]*\]/g, (_m, id) => `<p><a href="https://videopress.com/v/${id}">Watch the video</a></p>`);
  // Embeds: <figure class="wp-block-embed"><div class="wp-block-embed__wrapper">URL</div></figure>
  s = s.replace(/<figure class="wp-block-embed[^"]*"[^>]*>\s*<div class="wp-block-embed__wrapper">\s*(\S+?)\s*<\/div>[\s\S]*?<\/figure>/g,
    (_m, url) => `<p><a href="${url}">${url}</a></p>`);
  return s;
}

// ---------------------------------------------------------------- images & links

function normalizeUrl(u) {
  try {
    const url = new URL(decodeHTML(u).trim());
    if (url.hostname.endsWith('.wp.com') && url.pathname.split('/')[1]?.includes('.')) {
      // i0.wp.com/nanoframework.net/wp-content/... -> nanoframework.net/wp-content/...
      const [, host, ...rest] = url.pathname.split('/');
      return `https://${host}/${rest.join('/')}`;
    }
    url.protocol = 'https:';
    url.search = '';
    url.hash = '';
    if (url.hostname === 'www.nanoframework.net') url.hostname = 'nanoframework.net';
    return url.toString();
  } catch {
    return u;
  }
}

/** Prefer the original upload over WordPress's resized copies (name-1024x576.png). */
function originalImage(u) {
  const n = normalizeUrl(u);
  const orig = n.replace(/-\d+x\d+(\.\w+)$/, '$1');
  return attachmentUrls.has(orig) ? orig : n;
}

const isUpload = (u) => /^https:\/\/nanoframework\.net\/wp-content\/uploads\//.test(u);

async function fetchTo(url, file) {
  try {
    await access(file);
    return true; // already downloaded on a previous run
  } catch {}
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ! ${res.status} ${url}`);
    return false;
  }
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

// ---------------------------------------------------------------- front matter

const yamlStr = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars
const optional = (key, value) => (value ? [`${key}: ${yamlStr(value)}`] : []);

const toPlain = (md) =>
  md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_`\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function describe(item, markdown) {
  const excerpt = decodeHTML(text(item['excerpt:encoded']).replace(/<[^>]+>/g, '')).trim();
  const source = excerpt || markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|!\[|```|~~~|>|\||- |\d+\. )/.test(p) && toPlain(p).length > 60) || '';
  const plain = toPlain(source);
  if (plain.length < 40 || /^https?:\/\//.test(plain)) return '';
  if (plain.length <= 200) return plain;
  return plain.slice(0, 197).replace(/\s+\S*$/, '') + '…';
}

function tagsFor(item, title) {
  const cats = (item.category ?? [])
    .filter((c) => c['@domain'] === 'category' || c['@domain'] === 'post_tag')
    .map((c) => c['@nicename']);
  const found = new Set();
  for (const [tag, re] of TITLE_RULES) if (re.test(title)) found.add(tag);
  for (const [tag, list] of TAG_RULES) if (cats.some((c) => list.includes(c))) found.add(tag);
  if (found.size > 1) found.delete('community'); // 'project' is a weak signal
  const order = ['releases', 'hardware', 'networking', 'tooling', 'engineering', 'community'];
  const tags = order.filter((t) => found.has(t)).slice(0, 2);
  return tags.length ? tags : ['community'];
}

function commentsFor(item) {
  const list = (item['wp:comment'] ?? []).filter(
    (c) => text(c['wp:comment_approved']) === '1' && ['', 'comment'].includes(text(c['wp:comment_type'])),
  );
  return list
    .map((c) => ({
      id: text(c['wp:comment_id']),
      parent: text(c['wp:comment_parent']),
      author: decodeHTML(text(c['wp:comment_author'])).trim(),
      date: text(c['wp:comment_date_gmt']).replace(' ', 'T') + 'Z',
      body: td.turndown(autop(text(c['wp:comment_content']))).trim(),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------- pages

// WordPress page path -> new path. Pages not listed here are skipped
// (they are replaced by the new home page / blog, or are leftovers);
// redirects for every old path live in src/data/redirects.ts.
const PAGES = {
  '/what-is-nanoframework/': '/what-is-nanoframework/',
  '/why-use-nanoframework/': '/why-use-nanoframework/',
  '/where-do-i-start/': '/where-do-i-start/',
  '/home/getting-started-guides/': '/getting-started-guides/',
  '/overview-of-nanoframework/': '/overview-of-nanoframework/',
  '/logos-and-images/': '/logos-and-images/',
  // '/partner-program/' is now a designed page: src/pages/partner-program/index.astro + src/data/partners.ts
  '/partner-program/join-the-partners-program/': '/partner-program/join-the-partners-program/',
  '/partner-program/chibios/': '/partner-program/chibios/',
  '/partner-program/partners-eclo-solutions/': '/partner-program/partners-eclo-solutions/',
  '/partner-program/partners-espressif-systems/': '/partner-program/partners-espressif-systems/',
  '/partner-program/partners-csa-engineering-ag/': '/partner-program/partners-csa-engineering-ag/',
  // '/support-nanoframework/' and '/most-valuable-contributors/' are designed pages now:
  // src/pages/<name>/index.astro, with their lists in src/data/site.ts
  '/contact-2/': '/contact/',
};

// Pages rewritten by hand after the migration. The converter still downloads their images,
// but never overwrites their index.md.
const HAND_EDITED = new Set(['/logos-and-images/']);

// Small corrections applied to converted pages on every run (typos carried over from WordPress).
const TEXT_FIXES = {};

const byId = new Map(items.map((it) => [text(it['wp:post_id']), it]));
function wpPath(item) {
  const parts = [];
  for (let it = item; it; ) {
    parts.unshift(decodeURIComponent(text(it['wp:post_name']).trim()));
    const parent = text(it['wp:post_parent']);
    it = parent && parent !== '0' ? byId.get(parent) : undefined;
  }
  return `/${parts.join('/')}/`;
}

const pages = items.filter((it) => text(it['wp:post_type']) === 'page' && text(it['wp:status']) === 'publish');

// ---------------------------------------------------------------- shared conversion

const report = { posts: 0, pages: 0, images: 0, imageFailures: 0, comments: 0, authors: new Set(), tags: {} };
const localName = (u) => decodeURIComponent(path.basename(new URL(u).pathname));

/** WordPress HTML -> Markdown, with images resolved (and downloaded into `dir` when asked). */
async function convertBody(item, dir) {
  let html = preprocess(text(item['content:encoded']));
  // Embedded widgets (Open Collective, forms) don't carry over: drop scripts, styles and iframes.
  html = html.replace(/<(script|style|iframe|form)[\s\S]*?<\/\1>/gi, '');

  const images = new Map();
  html = html.replace(/(<img[^>]*?\ssrc=")([^"]+)(")/g, (_m, a, src, b) => {
    const orig = originalImage(src);
    if (isUpload(orig)) images.set(orig, localName(orig));
    return a + orig + b;
  });
  // Links that wrap an image usually point at the same upload: drop the wrapper.
  html = html.replace(/<a [^>]*href="[^"]*wp-content\/uploads[^"]*"[^>]*>\s*(<img[^>]*>)\s*<\/a>/g, '$1');

  let cover;
  const thumbId = text(meta(item, '_thumbnail_id'));
  if (thumbId && attachments.has(thumbId)) {
    const orig = originalImage(attachments.get(thumbId));
    if (isUpload(orig)) cover = orig;
  }

  if (download) {
    for (const [url, name] of [...images, ...(cover ? [[cover, localName(cover)]] : [])]) {
      const ok = await fetchTo(url, path.join(dir, name));
      if (ok) report.images++;
      else {
        report.imageFailures++;
        images.delete(url);
        if (url === cover) cover = undefined;
      }
    }
    for (const [url, name] of images) html = html.split(`src="${url}"`).join(`src="./${encodeURI(name)}"`);
  } else {
    cover = undefined; // covers must be local files
  }

  let md = td.turndown(html).trim();
  // Site-internal absolute links -> root-relative, so they work on any host and in previews.
  // (Uploads stay absolute: they only exist on the WordPress host until downloaded.)
  md = md.replace(/\]\(https?:\/\/(?:www\.)?nanoframework\.net(\/(?!wp-content\/)[^)\s]*)?\)/g, (_m, p) => `](${p || '/'})`);
  // Old page addresses -> new ones.
  for (const [from, to] of Object.entries(PAGES)) if (from !== to) md = md.split(`](${from})`).join(`](${to})`);
  md = escapeStrayTags(md);
  md = md.replace(/\n{3,}/g, '\n\n');
  return { md, cover };
}

// ---------------------------------------------------------------- run: posts

await mkdir(outDir, { recursive: true });

for (const item of posts) {
  const slug = decodeURIComponent(text(item['wp:post_name']).trim());
  const title = decodeHTML(text(item.title)).trim();
  const date = text(item['wp:post_date_gmt']).replace(' ', 'T') + 'Z';
  const login = text(item['dc:creator']).trim();
  const author = AUTHORS[login] ?? 'nanoframework-team';
  report.authors.add(author);

  const dir = path.join(outDir, slug);
  await mkdir(dir, { recursive: true });
  const { md, cover } = await convertBody(item, dir);

  const tags = tagsFor(item, title);
  for (const t of tags) report.tags[t] = (report.tags[t] ?? 0) + 1;
  const comments = commentsFor(item);
  report.comments += comments.length;

  const fm = [
    '---',
    `title: ${yamlStr(title)}`,
    ...optional('description', describe(item, md)),
    `date: ${date}`,
    `author: ${author}`,
    `tags: [${tags.join(', ')}]`,
  ];
  if (cover) fm.push(`cover: ./${localName(cover)}`, `coverAlt: ""`);
  if (comments.length) {
    fm.push('legacyComments:');
    for (const c of comments) {
      fm.push(`  - id: ${yamlStr(c.id)}`);
      if (c.parent && c.parent !== '0') fm.push(`    parent: ${yamlStr(c.parent)}`);
      fm.push(`    author: ${yamlStr(c.author)}`, `    date: ${c.date}`, `    body: ${yamlStr(c.body)}`);
    }
  }
  fm.push(`wordpressId: ${text(item['wp:post_id'])}`, '---', '');

  await writeFile(path.join(dir, 'index.md'), fm.join('\n') + '\n' + md + '\n');
  report.posts++;
}

// ---------------------------------------------------------------- run: pages

for (const item of pages) {
  const target = PAGES[wpPath(item)];
  if (!target) continue;
  const dir = path.join(pagesDir, ...target.split('/').filter(Boolean));
  await mkdir(dir, { recursive: true });
  let { md } = await convertBody(item, dir);
  for (const [from, to] of TEXT_FIXES[target] ?? []) md = md.split(from).join(to);
  const file = path.join(dir, 'index.md');
  if (HAND_EDITED.has(target)) {
    try {
      await access(file);
      console.log(`Kept hand-edited page ${target}`);
      continue;
    } catch {}
  }
  const title = decodeHTML(text(item.title)).trim();
  const fm = [
    '---',
    `title: ${yamlStr(title)}`,
    ...optional('description', describe(item, md)),
    `wordpressId: ${text(item['wp:post_id'])}`,
    '---',
    '',
  ];
  await writeFile(file, fm.join('\n') + '\n' + md + '\n');
  report.pages++;
}

console.log(`Converted ${report.posts} posts into ${path.relative(process.cwd(), outDir)}`);
console.log(`Converted ${report.pages} pages into ${path.relative(process.cwd(), pagesDir)}`);
console.log(`Tags: ${JSON.stringify(report.tags)}`);
console.log(`Authors used: ${[...report.authors].join(', ')}`);
console.log(`Comments kept: ${report.comments}`);
if (download) console.log(`Images downloaded: ${report.images}, failed: ${report.imageFailures}`);
else console.log('Images still point at nanoframework.net – re-run with --download-images before switching WordPress off.');
