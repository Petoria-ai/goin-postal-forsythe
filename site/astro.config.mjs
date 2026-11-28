// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { readFileSync, writeFileSync } from 'node:fs';

// Writes dist/client/_redirects from src/data/redirects.json after every build. Cloudflare applies the
// file to every request before static assets or the Worker, so old URLs get a real 301 even though
// unknown paths are answered by the static 404 page.
/** @type {import('astro').AstroIntegration} */
const legacyRedirects = {
  name: 'legacy-redirects',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const { redirects } = JSON.parse(readFileSync(new URL('./src/data/redirects.json', import.meta.url), 'utf8'));
      const lines = Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`);
      writeFileSync(new URL('_redirects', dir), `# Generated from src/data/redirects.json by astro.config.mjs. Do not edit here.\n${lines.join('\n')}\n`);
      logger.info(`_redirects: ${lines.length} legacy URLs`);
    },
  },
};

// Pages stay static. Only the routes that export `prerender = false`
// (the shipping API and the order pages) run as Cloudflare functions.
//
// `site` is the canonical origin every canonical URL, sitemap entry and structured-data @id is built
// from (src/lib/seo.ts). It comes from PUBLIC_SITE_URL (e.g. https://www.example.com). The store has no
// domain yet, so without it the site builds in PRE-LAUNCH MODE: every page says noindex, robots.txt
// blocks all crawlers, and no URL points at a domain the store does not own. Set PUBLIC_SITE_URL in the
// build settings on launch day and rebuild; nothing else changes.
// `build.format: 'file'` writes /contact.html rather than /contact/index.html, so Cloudflare serves
// every page at its extensionless URL (/contact), matching the canonical URLs and the links the site
// has always used.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'static',
  build: { format: 'file' },
  // The adapter's platform proxy is on by default: wrangler.jsonc and .dev.vars are read in `npm run dev`.
  adapter: cloudflare(),
  integrations: [legacyRedirects],
});
