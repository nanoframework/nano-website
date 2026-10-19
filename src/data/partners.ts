// Partner program listings shown on /partner-program/.
//
// Logos: drop the file in src/assets/partners/ and set `logo` to its file name
// (it's optimised at build time). A remote URL also works. Without a logo, the
// card shows the company name instead.

export type Partner = {
  name: string;
  /** Short label shown above the name, e.g. "Engineering services". */
  kind: string;
  blurb: string;
  website: string;
  /** Partner profile page on this site, if there is one. */
  profile?: string;
  logo?: string;
  /** Show the logo on a dark tile (for white or light logos). */
  darkLogo?: boolean;
};

export const ENGINEERING_PARTNERS: Partner[] = [
  {
    name: 'CSA Engineering AG',
    kind: 'Consulting · R&D · Support',
    blurb:
      'Expert knowledge in hardware, embedded software and application development, plus requirements engineering, verification & validation and project management.',
    website: 'https://www.csa.ch',
    profile: '/partner-program/partners-csa-engineering-ag/',
    logo: 'CSA-cmyk.png',
  },
  {
    name: 'Eclo Solutions',
    kind: 'Engineering services · Training',
    blurb:
      'Engineering services for .NET nanoFramework projects: C# and low-level driver development, customisation of core features, hardware design and training.',
    website: 'https://www.eclo.solutions',
    profile: '/partner-program/partners-eclo-solutions/',
    logo: 'https://avatars.githubusercontent.com/u/12029939',
  },
];

export const HARDWARE_MANUFACTURERS: Partner[] = [
  {
    name: 'Unexpected Maker',
    kind: 'Development boards',
    blurb: 'Compact, well-designed ESP32 development boards with .NET nanoFramework support.',
    website: 'https://unexpectedmaker.com/',
    logo: 'um_logo_new_blue_square.png',
  },
  {
    name: 'M5Stack',
    kind: 'Modular IoT kits',
    blurb: 'Modular ESP32-based development kits, with dedicated .NET nanoFramework packages.',
    website: 'https://m5stack.com/',
    logo: 'm5logo2022.png',
  },
];

export const TECHNOLOGY_PARTNERS: Partner[] = [
  {
    name: 'ChibiOS',
    kind: 'RTOS · HAL · Drivers',
    blurb: 'RTOS, HAL and drivers used on all STM32 reference and community targets.',
    website: 'https://www.chibios.org/dokuwiki/doku.php',
    profile: '/partner-program/chibios/',
    logo: 'https://avatars.githubusercontent.com/u/2803041',
  },
  {
    name: 'Espressif Systems',
    kind: 'Silicon vendor',
    blurb: 'Creators of the ESP32 chip series, providing the RTOS, HAL and drivers behind the ESP32 targets.',
    website: 'https://www.espressif.com',
    profile: '/partner-program/partners-espressif-systems/',
    logo: 'https://avatars.githubusercontent.com/u/9460735',
  },
];
