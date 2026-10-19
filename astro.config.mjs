// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import redirects from './src/data/redirects.mjs';
import azureStaticWebApps from './src/integrations/azure-static-web-apps.mjs';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://nanoframework.net',
  // WordPress permalinks end with a slash (/<post-slug>/); keep that so old links keep working.
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Redirects also work in `astro dev`; on Azure they are served as real 301s (see the integration).
  redirects,
  integrations: [sitemap(), azureStaticWebApps({ redirects })],
  markdown: {
    shikiConfig: {
      // Same token colors C# developers see in VS Code / Visual Studio.
      theme: 'dark-plus',
      wrap: false,
    },
  },
});
