// Partner program listings.
// Engineering partners: /partner-program/
// Hardware manufacturers and technology partners: /partner-program/hardware-and-technology/
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
  /** Highlight label shown on the card, e.g. "Founding partner". */
  badge?: string;
};

export const ENGINEERING_PARTNERS: Partner[] = [
  {
    name: 'Eclo Solutions',
    kind: 'IoT product engineering',
    badge: 'Founding partner',
    blurb:
      'IoT products engineered end to end – hardware, PCB, firmware in C# on .NET nanoFramework, connectivity and cloud, by a single team. Home of the .NET nanoFramework project.',
    website: 'https://www.eclo.solutions',
    profile: '/partner-program/partners-eclo-solutions/',
    logo: 'eclo-logo.png',
  },
  {
    name: 'CSA Engineering AG',
    kind: 'Consulting · R&D · Support',
    blurb:
      'Expert knowledge in hardware, embedded software and application development, plus requirements engineering, verification & validation and project management.',
    website: 'https://www.csa.ch',
    profile: '/partner-program/partners-csa-engineering-ag/',
    logo: 'CSA-cmyk.png',
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
  {
    name: 'CodeRabbit',
    kind: 'AI code reviews',
    blurb: 'AI-assisted pull request reviews, helping our maintainers review contributions across the project repositories.',
    website: 'https://www.coderabbit.ai',
    logo: 'https://github.com/coderabbitai.png',
  },
  {
    name: 'Cloudsmith',
    kind: 'Package hosting',
    blurb: 'Hosts the .NET nanoFramework firmware packages, so every release is delivered fast and reliably.',
    website: 'https://cloudsmith.com',
    logo: 'https://github.com/cloudsmith-io.png',
  },
  {
    name: 'SonarQube Cloud',
    kind: 'Static analysis',
    blurb: 'Continuous static code analysis on the .NET nanoFramework C# libraries, formerly known as SonarCloud.',
    website: 'https://www.sonarsource.com/products/sonarcloud/',
    logo: 'https://github.com/SonarSource.png',
  },
];
