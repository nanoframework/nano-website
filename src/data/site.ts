// Central place for links and lists used across the site.
// Edit here instead of hunting through components.

export const SITE = {
  name: '.NET nanoFramework',
  tagline: 'Making it easy to write C# code for embedded systems.',
  description:
    '.NET nanoFramework is a free and open-source platform that enables writing C# code for constrained embedded devices, with Visual Studio integration and real on-device debugging.',
  url: 'https://nanoframework.net',
  repo: 'https://github.com/nanoframework/nano-website',
  email: 'contact@nanoframework.net',
};

export const LINKS = {
  docs: 'https://docs.nanoframework.net',
  gettingStarted: 'https://docs.nanoframework.net/content/getting-started-guides/getting-started-managed.html',
  samples: 'https://github.com/nanoframework/Samples',
  apiReference: 'https://docs.nanoframework.net/api/index.html',
  referenceTargets: 'https://github.com/nanoframework/Home#firmware-for-reference-boards',
  communityTargets: 'https://github.com/nanoframework/nf-Community-Targets',
  contributing: 'https://docs.nanoframework.net/content/contributing/index.html',
  goodFirstIssues: 'https://github.com/nanoframework/Home/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22',
  github: 'https://github.com/nanoframework',
  discord: 'https://discord.gg/gCyBu8T',
  youtube: 'https://www.youtube.com/c/nanoframework',
  twitter: 'https://twitter.com/nanoframework',
  hackster: 'https://www.hackster.io/nanoframework',
  nuget: 'https://www.nuget.org/profiles/nanoframework',
  openCollective: 'https://opencollective.com/nanoframework',
  githubSponsors: 'https://github.com/sponsors/nanoframework',
  dotnetFoundation: 'https://dotnetfoundation.org/',
  // Pages migrated from WordPress (src/content/pages), on their original URLs.
  partnerProgram: '/partner-program/',
  joinPartners: '/partner-program/join-the-partners-program/',
  mvc: '/most-valuable-contributors/',
  pressKit: '/logos-and-images/',
  overview: '/overview-of-nanoframework/',
  support: '/support-nanoframework/',
  contact: '/contact/',
};

export const NAV = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Hardware', href: '/#hardware' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Community', href: '/#community' },
];

export type Target = {
  vendor: string;
  family: string;
  blurb: string;
  boards: string[];
  href: string;
};

// Reference targets (built, tested and published by the core team).
// Source: nf-interpreter /targets. Order: ESP32, Pico, STM32, then alphabetical.
export const TARGETS: Target[] = [
  {
    vendor: 'Espressif',
    family: 'ESP32 family',
    blurb: 'Wi-Fi and Bluetooth SoCs.',
    boards: ['ESP32', 'S2', 'S3', 'C3', 'C5', 'C6', 'C61', 'H2', 'P4'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'Raspberry Pi',
    family: 'Pico & Pico 2',
    blurb: 'RP2040 and RP2350, with and without wireless.',
    boards: ['RP2040', 'RP2040_W', 'RP2350', 'RP2350_W'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'STMicroelectronics',
    family: 'STM32',
    blurb: 'Nucleo, Discovery and IoT kits.',
    boards: ['F091RC', 'F429I', 'F769I', 'L475E', 'AZ3166'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'NXP',
    family: 'i.MX RT1060',
    blurb: 'Crossover MCU evaluation kit.',
    boards: ['MIMXRT1060_EVK'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'OrgPal',
    family: 'PalThree & PalX',
    blurb: 'Industrial IoT boards.',
    boards: ['PALTHREE', 'PALX'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'Silicon Labs',
    family: 'Giant Gecko',
    blurb: 'EFM32 GG11 starter kit.',
    boards: ['SL_STK3701A'],
    href: LINKS.referenceTargets,
  },
  {
    vendor: 'Texas Instruments',
    family: 'SimpleLink',
    blurb: 'Sub-GHz and Wi-Fi LaunchPads.',
    boards: ['CC1352R1', 'CC3220SF'],
    href: LINKS.referenceTargets,
  },
];

export const CASE_STUDIES = [
  {
    company: 'OrgPal',
    title: 'Oil fields monitoring',
    blurb: 'Remote telemetry from wellsites on rugged .NET nanoFramework hardware.',
    href: 'https://docs.nanoframework.net/content/case-studies/oil-fields-monitoring-orgpal.html',
  },
  {
    company: 'neshtec',
    title: 'Solar plant monitoring & control',
    blurb: 'Remote monitoring and control of photovoltaic installations.',
    href: 'https://docs.nanoframework.net/content/case-studies/solar-power-plant-monitoring-control-neshtec.html',
  },
  {
    company: 'CSA Engineering AG',
    title: 'Industrial products',
    blurb: 'How an engineering firm builds its device line on .NET nanoFramework.',
    href: 'https://docs.nanoframework.net/content/case-studies/nanoframework-usage-at-csa-engineering-ag.html',
  },
];

// Sponsors and supporters. `logo`: a file name in src/assets/partners/ or a URL (see components/Logo.astro).
export type Supporter = { name: string; href: string; logo?: string };

/** Current sponsors: shown on the home page and on /support-nanoframework/. */
export const SPONSORS: Supporter[] = [
  { name: 'ISMA CONTROLLI', href: 'https://www.ismacontrolli.com/en/', logo: 'isma-controlli.png' },
  { name: 'OrgPal', href: 'https://www.orgpal.com', logo: 'orgpallogo.png' },
];

/** Past sponsors and supporters: shown on /support-nanoframework/. */
export const PAST_SUPPORTERS: Supporter[] = [
  { name: 'D-FENS', href: 'https://d-fens.ch/', logo: 'logo_d-fense.webp' },
  { name: 'Hive (LinkIT)', href: 'https://hive.linkit.nl/', logo: 'https://avatars.githubusercontent.com/u/17175831' },
  { name: 'Eclo Solutions', href: 'https://www.eclo.solutions', logo: 'https://avatars.githubusercontent.com/u/12029939' },
  { name: 'ChibiOS', href: 'https://www.chibios.org/dokuwiki/doku.php', logo: 'https://avatars.githubusercontent.com/u/2803041' },
  { name: 'Espressif', href: 'https://espressif.com/', logo: 'https://avatars.githubusercontent.com/u/9460735' },
];

/**
 * Most Valuable Contributors (GitHub logins), shown on /most-valuable-contributors/.
 * Avatars come from GitHub.
 */
export const MVCS: { login: string }[] = [
  { login: 'alberk8' },
  { login: 'bytewizer' },
  { login: 'mikeoliphant' },
  { login: 'MrCSharp22' },
  { login: 'torbacz' },
  { login: 'CoryCharlton' },
];

// Blog tags. Keep this list short: it drives the filter chips on /blog/.
export const TAGS = {
  releases: 'Releases',
  engineering: 'Engineering',
  tooling: 'Tooling',
  networking: 'Networking',
  hardware: 'Hardware',
  community: 'Community',
} as const;

export type TagKey = keyof typeof TAGS;
export const TAG_KEYS = Object.keys(TAGS) as [TagKey, ...TagKey[]];

export const POSTS_PER_PAGE = 10;
