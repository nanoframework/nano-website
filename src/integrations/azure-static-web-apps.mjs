// Writes dist/staticwebapp.config.json for Azure Static Web Apps at the end of every build.
//
// - Old WordPress addresses (src/data/redirects.mjs) become real 301 redirects on the server.
// - Missing pages get the site's 404 page, with a 404 status.
// - Fingerprinted assets (/_astro/*) are cached for a year; HTML is always revalidated.
//
// Docs: https://learn.microsoft.com/azure/static-web-apps/configuration
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** @param {{ redirects: Record<string, string> }} options */
export default function azureStaticWebApps({ redirects }) {
  return {
    name: 'azure-static-web-apps',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const routes = [
          ...Object.entries(redirects).map(([route, redirect]) => ({ route, redirect, statusCode: 301 })),
          {
            route: '/_astro/*',
            headers: { 'cache-control': 'public, max-age=31536000, immutable' },
          },
          {
            route: '/brand/*',
            headers: { 'cache-control': 'public, max-age=86400' },
          },
        ];

        const config = {
          // 'auto': page folders get a trailing slash (/blog -> /blog/), files don't (/rss.xml stays as is).
          trailingSlash: 'auto',
          routes,
          responseOverrides: {
            404: { rewrite: '/404.html', statusCode: 404 },
          },
          globalHeaders: {
            'cache-control': 'public, max-age=0, must-revalidate',
            'x-content-type-options': 'nosniff',
            'referrer-policy': 'strict-origin-when-cross-origin',
            'x-frame-options': 'SAMEORIGIN',
            'permissions-policy': 'camera=(), microphone=(), geolocation=()',
          },
          mimeTypes: {
            '.webmanifest': 'application/manifest+json',
            '.xml': 'application/xml',
          },
        };

        const json = JSON.stringify(config, null, 2);
        const size = Buffer.byteLength(json);
        if (size > 20 * 1024) {
          throw new Error(`staticwebapp.config.json is ${size} bytes; Azure Static Web Apps allows 20 KB. Trim the redirect list.`);
        }
        const out = path.join(fileURLToPath(dir), 'staticwebapp.config.json');
        await writeFile(out, json);
        logger.info(`staticwebapp.config.json written (${routes.length} routes, ${(size / 1024).toFixed(1)} KB)`);
      },
    },
  };
}
