// Redirects from old WordPress addresses to their new home.
// Used by astro.config.mjs (`redirects`): each becomes a small redirect page that works on any host.
// Keys and targets end with "/" to match the site's trailingSlash setting.

const toTag = (tag) => `/tag/${tag}/`;

// Old WordPress categories -> new tags (articles/uncategorized had no meaning: go to the blog).
const CATEGORIES = {
  hardware: ['esp32', 'ti', 'cc32xx', 'cc13x2', 'silabs', 'giantgecko', 'radio', 'products'],
  networking: ['networking', 'tls', 'ssl', 'mqtt', 'amqp', 'wi-fi'],
  tooling: ['tools', 'visual-studio', 'vs-code', 'vs-extension', 'nuget', 'obfuscation', 'cps'],
  engineering: ['cmake', 'ci', 'cd', 'ci-cd', 'devops', 'c-managed-code', 'c-c-native-code', 'interop', 'json', 'documentation', 'azure'],
  community: ['project'],
};

// Old WordPress tags. Ones that match a new tag go there, the rest to the blog.
const OLD_TAGS = {
  hardware: ['esp32', 'ti', 'stm32', 'cc32xx', 'mbed'],
  networking: ['tls', 'wi-fi', 'security', 'ota'],
  tooling: ['tools', 'vscode', 'visualstudio', 'vs2019'],
  engineering: ['cmake', 'devops', 'test', 'documentation', 'json', 'filesystem', 'littlefs', 'gcc', 'automation', 'blob'],
};
const OLD_TAGS_TO_BLOG = [
  'net', 'aure', 'azure', 'azure-2', 'csharp', 'csharp-2', 'iot', 'iot-2', 'nanoframework', 'nanoframework-2',
  'nanoframework-nf-general', 'dotnet', 'embeddedsystems', 'iotday', 'library', 'oilfield', 'progress-report',
];

const redirects = {
  // Pages that were replaced, merged or renamed
  '/home/': '/',
  '/net-nanoframework/': '/',
  '/sample-page/': '/',
  '/home/getting-started-guides/': '/getting-started-guides/',
  '/contact-2/': '/contact/',
  '/supporting-nanoframework/': '/support-nanoframework/',

  // Feeds
  '/feed/': '/rss.xml',
  '/blog/feed/': '/rss.xml',

  // Authors
  '/author/jassimoes/': '/blog/',
  '/author/ellerbach/': '/blog/',
  '/author/networkfusion/': '/blog/',
  '/author/nanofadmin/': '/blog/',

  // Posts whose slug changed while on WordPress
  '/net-nanoframework-migrating-to-mbed-tls-v3-6-security-first/': '/net-nanoframework-tls-1-3-available-security-first/',
};

for (const [tag, cats] of Object.entries(CATEGORIES)) for (const c of cats) redirects[`/category/${c}/`] = toTag(tag);
for (const c of ['articles', 'uncategorized']) redirects[`/category/${c}/`] = '/blog/';
for (const [tag, olds] of Object.entries(OLD_TAGS)) for (const t of olds) redirects[`/tag/${t}/`] = toTag(tag);
for (const t of OLD_TAGS_TO_BLOG) redirects[`/tag/${t}/`] = '/blog/';

export default redirects;
