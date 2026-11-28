#!/usr/bin/env node
// SEO health check over the built site (dist/client). No packages, no network. Run after a build:
//   npm run build && npm run seo:audit
// Fails (exit 1) on errors; prints warnings. Checks, for every built page:
//   title present, unique among indexable pages, not over 65 characters (warning)
//   meta description present, unique, 70-165 characters (warning outside)
//   exactly one <h1>; robots meta present; canonical present on indexable pages and equal to the page URL
//   every JSON-LD block parses, has @context, and the business @id is consistent
//   every <img> has alt text
//   every internal link resolves to a built page, a static file or a known server route
// And for the crawl files:
//   robots.txt allows the AI search crawlers, disallows the private paths and points at the sitemap
//   every sitemap URL is a built, indexable page whose canonical is itself; no private path is listed
//   every indexable page is in the sitemap
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../dist/client/', import.meta.url).pathname;
// Server-rendered routes (prerender = false) that exist but have no file in dist/client.
const SERVER_ROUTES = [/^\/ship$/, /^\/track$/, /^\/account$/, /^\/counter(\/.*)?$/, /^\/api\/.+/, /^\/ship\/done$/, /^\/cards\/done$/, /^\/return\/.+/, /^\/indexnow\.txt$/, /^\/labels\/.+/];
const PRIVATE = [/^\/counter/, /^\/api\//, /^\/account/, /^\/ship\/done/, /^\/cards\/done/, /^\/return\//];

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(ROOT);
// Plain files copied from public/ that are not site pages; public/_headers sends X-Robots-Tag: noindex for them.
const UTILITY_FILES = ['demo-label.html'];
const htmlFiles = files.filter((f) => f.endsWith('.html') && !UTILITY_FILES.includes(relative(ROOT, f)));
const urlOf = (f) => { const r = '/' + relative(ROOT, f).replace(/\\/g, '/'); return r === '/index.html' ? '/' : r.replace(/\.html$/, ''); };
const builtPaths = new Set(htmlFiles.map(urlOf));
const staticFiles = new Set(files.map((f) => '/' + relative(ROOT, f).replace(/\\/g, '/')));

const robots = readFileSync(join(ROOT, 'robots.txt'), 'utf8');
if (/PRE-LAUNCH MODE/.test(robots)) {
  console.log('SEO audit: this build is in pre-launch mode (no PUBLIC_SITE_URL), so every page is noindexed on purpose.');
  console.log('Run the audit on a build with a domain, e.g.: PUBLIC_SITE_URL=https://www.example.com npm run build && npm run seo:audit');
  process.exit(1);
}
const siteMatch = robots.match(/^Sitemap: (https?:\/\/[^/\s]+)\/sitemap\.xml$/m);
if (!siteMatch) err('robots.txt', 'no Sitemap line');
const SITE = siteMatch?.[1] ?? '';

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const pages = [];
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const path = urlOf(f);
  const name = path;
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = decode(attr(html.match(/<meta name="description"[^>]*>/)?.[0] ?? '', 'content') ?? '');
  const robotsMeta = attr(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? '', 'content') ?? '';
  const canonical = attr(html.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href');
  const noindex = /noindex/.test(robotsMeta);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  pages.push({ path, title, desc, noindex, canonical });

  if (!title) err(name, 'missing <title>');
  else if (title.length > 65 && !noindex) warn(name, `title is ${title.length} characters (Google shows about 60): "${title}"`);
  if (!desc) err(name, 'missing meta description');
  else if (!noindex && (desc.length < 70 || desc.length > 165)) warn(name, `description is ${desc.length} characters`);
  if (!robotsMeta) err(name, 'missing robots meta');
  if (h1s !== 1) err(name, `${h1s} <h1> elements (want exactly 1)`);
  if (!noindex) {
    if (!canonical) err(name, 'indexable page without a canonical');
    else if (canonical !== (path === '/' ? SITE + '/' : SITE + path)) err(name, `canonical ${canonical} is not this page`);
  }
  if (PRIVATE.some((re) => re.test(path)) && !noindex) err(name, 'private path is indexable');

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (j['@context'] !== 'https://schema.org') err(name, 'JSON-LD without @context https://schema.org');
      const nodes = j['@graph'] ?? [j];
      for (const n of nodes) {
        if (!n['@type']) err(name, 'JSON-LD node without @type');
        if (n['@type'] === 'LocalBusiness' && n['@id'] !== `${SITE}/#business`) err(name, `LocalBusiness @id is ${n['@id']}`);
        if (n.aggregateRating || n.review) err(name, 'review/rating markup found: only allowed for genuine, visible reviews');
      }
    } catch (e) { err(name, `JSON-LD does not parse: ${e.message}`); }
  }
  for (const img of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(img[0]) && !/\balt=""/.test(img[0])) err(name, `image without alt: ${img[0].slice(0, 80)}`);
  for (const a of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = decode(a[1]);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const p = href.split(/[?#]/)[0] || '/';
    const clean = p.length > 1 ? p.replace(/\/$/, '') : p;
    if (builtPaths.has(clean) || staticFiles.has(p) || SERVER_ROUTES.some((re) => re.test(clean))) continue;
    err(name, `broken internal link ${href}`);
  }
}

// Duplicates among indexable pages.
const idx = pages.filter((p) => !p.noindex);
for (const key of ['title', 'desc']) {
  const seen = new Map();
  for (const p of idx) { if (!p[key]) continue; if (seen.has(p[key])) err(p.path, `duplicate ${key === 'desc' ? 'description' : 'title'} with ${seen.get(p[key])}`); else seen.set(p[key], p.path); }
}

// robots.txt
for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Googlebot', 'Bingbot']) {
  const grp = robots.split(/\n\n/).find((g) => new RegExp(`^User-agent: ${bot}$`, 'm').test(g));
  if (!grp) err('robots.txt', `${bot} has no group`);
  else if (!/^Allow: \/$/m.test(grp) || /^Disallow: \/$/m.test(grp)) err('robots.txt', `${bot} is not allowed`);
  else if (!/^Disallow: \/counter$/m.test(grp)) err('robots.txt', `${bot} group does not disallow /counter`);
}
for (const bot of ['GPTBot', 'ClaudeBot', 'CCBot']) {
  const grp = robots.split(/\n\n/).find((g) => new RegExp(`^User-agent: ${bot}$`, 'm').test(g));
  if (!grp || !/^Disallow: \/$/m.test(grp)) warn('robots.txt', `${bot} (training) is not disallowed`);
}

// Sitemaps
const index = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const childLocs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const listed = new Set();
for (const loc of childLocs) {
  const file = join(ROOT, loc.replace(SITE, ''));
  if (!existsSync(file)) { err('sitemap.xml', `child ${loc} not built`); continue; }
  for (const m of readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = m[1];
    if (!url.startsWith(SITE)) { err(loc, `${url} is not on ${SITE}`); continue; }
    const path = url.slice(SITE.length) === '/' ? '/' : url.slice(SITE.length);
    listed.add(path);
    const page = pages.find((p) => p.path === path);
    if (!page) { if (!SERVER_ROUTES.some((re) => re.test(path))) err(loc, `${path} is not a built page`); continue; }
    if (page.noindex) err(loc, `${path} is noindex but listed`);
    if (page.canonical && page.canonical !== url) err(loc, `${path} canonical points elsewhere`);
    if (PRIVATE.some((re) => re.test(path))) err(loc, `private ${path} listed`);
  }
}
for (const p of idx) if (!listed.has(p.path)) err('sitemap', `indexable page ${p.path} is not in any sitemap`);

console.log(`SEO audit: ${htmlFiles.length} pages (${idx.length} indexable), ${listed.size} sitemap URLs, site ${SITE}`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(errors.length ? `${errors.length} error(s), ${warnings.length} warning(s)` : `OK, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
