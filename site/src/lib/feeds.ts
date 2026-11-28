// The machine-readable files: robots.txt, the sitemaps, llms.txt and the Google Merchant Center
// feed. Pure string builders from the route registry and the store facts, tested in tests/seo.test.ts.
// Everything in them is public by construction: they only ever see indexable routes.
import type { StoreFacts } from '../data/store';
import { verifiedProfiles } from '../data/store';
import { crawlerPolicy, SEARCH_ENGINES, AI_SEARCH, AI_USER_FETCHERS, AI_TRAINING, DISALLOW } from '../data/crawlers';
import type { RouteMeta } from './routes';
import { canonicalUrl, absoluteUrl } from './seo';
import { groupHours } from './hours';
import type { Product } from '../data/catalog';
import { productPath } from '../data/catalog';

const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// ---- robots.txt ------------------------------------------------------------------------------------
export function robotsTxt(site: string, policy = crawlerPolicy): string {
  const group = (agents: string[], allow: boolean, note: string) => [
    `# ${note}`,
    ...agents.map((a) => `User-agent: ${a}`),
    ...(allow ? ['Allow: /', ...DISALLOW.map((d) => `Disallow: ${d}`)] : ['Disallow: /']),
    '',
  ];
  return [
    `# robots.txt for ${site}`,
    '# Public pages are open to search engines and AI search assistants. AI model training is not permitted.',
    '# Private pages are protected by sign-in; these rules are a courtesy, not the security.',
    '',
    ...group(SEARCH_ENGINES, true, 'Search engines'),
    ...group(AI_SEARCH, true, 'AI search crawlers (ChatGPT search, Claude search, Perplexity, DuckDuckGo AI)'),
    ...group(AI_USER_FETCHERS, true, 'Fetchers that act when a person asks an AI assistant about a page'),
    ...group(AI_TRAINING, policy.allowTraining, policy.allowTraining ? 'AI training crawlers (allowed by owner decision)' : 'AI training crawlers: not permitted'),
    ...group(['Google-Extended'], policy.allowGoogleExtended, 'Gemini training and Gemini app grounding (does not affect Google Search)'),
    ...group(['*'], true, 'Everyone else'),
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n');
}

// ---- sitemaps --------------------------------------------------------------------------------------
export type SitemapName = 'pages' | 'services' | 'guides' | 'products';
export const sitemapOf = (r: RouteMeta): SitemapName =>
  r.kind === 'service' || r.kind === 'service-hub' || r.kind === 'translation' ? 'services'
    : r.kind === 'guide' || r.kind === 'guide-index' ? 'guides'
      : r.kind === 'product' || r.kind === 'category' || r.kind === 'shop' ? 'products' : 'pages';

/** One <urlset>, with hreflang alternates for translated pages. Only indexable routes belong here. */
export function urlset(routes: RouteMeta[], site: string): string {
  const rows = routes.filter((r) => r.indexable).map((r) => {
    const alt = r.alternates && r.alternates.length > 1
      ? [...r.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${xmlEsc(canonicalUrl(a.path, site))}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEsc(canonicalUrl(r.alternates.find((a) => a.lang === 'en')?.path ?? r.path, site))}"/>`].join('\n') + '\n'
      : '';
    return `  <url>\n    <loc>${xmlEsc(canonicalUrl(r.path, site))}</loc>\n${r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>\n` : ''}${alt}  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${rows.join('\n')}\n</urlset>\n`;
}

/** The index at /sitemap.xml. Empty child sitemaps are left out. Each child holds up to 50,000 URLs; split a child the same way when one grows past that. */
export function sitemapIndex(routes: RouteMeta[], site: string): string {
  const names: SitemapName[] = ['pages', 'services', 'guides', 'products'];
  const rows = names.map((n) => {
    const rs = routes.filter((r) => r.indexable && sitemapOf(r) === n);
    if (!rs.length) return '';
    const last = rs.map((r) => r.lastmod ?? '').sort().pop();
    return `  <sitemap>\n    <loc>${site}/sitemap-${n}.xml</loc>\n${last ? `    <lastmod>${last}</lastmod>\n` : ''}  </sitemap>`;
  }).filter(Boolean);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</sitemapindex>\n`;
}

// ---- llms.txt --------------------------------------------------------------------------------------
/** llms.txt (llmstxt.org): an experimental plain-Markdown summary for AI assistants. Not a ranking factor; it only restates public pages. */
export function llmsTxt(s: StoreFacts, routes: RouteMeta[], site: string, faqs: { q: string; a: string }[]): string {
  const pub = routes.filter((r) => r.indexable);
  const link = (r: RouteMeta) => `- [${r.h1}](${canonicalUrl(r.path, site)}): ${r.description}`;
  const by = (k: RouteMeta['kind'][]) => pub.filter((r) => k.includes(r.kind));
  const svc = (prefix: string) => pub.filter((r) => (r.kind === 'service' || r.kind === 'service-hub') && r.path.startsWith(prefix));
  const profiles = verifiedProfiles(s);
  return [
    `# ${s.name}`,
    '',
    `> ${s.name} is an independently owned shipping store and business service center at ${s.address}. It ships with ${s.carriers.join(', ')}, packs items, accepts prepaid drop-offs and returns, rents physical and virtual mailboxes, and offers notary, fingerprinting, printing, copies, fax, scanning and shredding. It is open seven days a week. It is not a corporate location of any carrier.`,
    '',
    '## Business facts',
    '',
    `- Name: ${s.name}${s.legalName ? ` (operated by ${s.legalName})` : ''}`,
    `- Address: ${s.address}`,
    `- Phone: ${s.phone}`,
    `- Website: ${site}/`,
    `- Hours (${s.timezone}): ${groupHours(s.weeklyHours).map((g) => `${g.label} ${g.text}`).join('; ')}`,
    '- Open seven days a week. Packages dropped off on weekends leave with the next scheduled carrier pickup.',
    `- Carriers: ${s.carriers.join(', ')}`,
    `- Service area: ${s.serviceArea.join(', ')}`,
    '- Online shipping: PeterShip compares USPS, UPS, FedEx and DHL for U.S. addresses only; international shipments are booked at the counter.',
    ...(profiles.length ? [`- Official profiles: ${profiles.map((p) => `${p.name} ${p.url}`).join('; ')}`] : []),
    '',
    '## Shipping services',
    '',
    ...svc('/shipping').map(link),
    '',
    '## Mailbox services',
    '',
    ...svc('/mailboxes').map(link),
    '',
    '## Business services',
    '',
    ...svc('/business-services').map(link),
    ...(by(['product', 'category', 'shop']).length ? ['', '## Products', '', ...by(['product', 'category', 'shop']).map(link)] : []),
    '',
    '## Guides',
    '',
    ...by(['guide']).map(link),
    '',
    '## Frequently asked questions',
    '',
    ...faqs.flatMap((f) => [`### ${f.q}`, '', f.a, '']),
    '## Key pages',
    '',
    ...pub.filter((r) => ['/', '/about', '/contact', '/ship', '/track'].includes(r.path)).map(link),
    '',
  ].join('\n');
}

// ---- Google Merchant Center ------------------------------------------------------------------------
/** RSS 2.0 product feed with the g: namespace. One item per variant, grouped by item_group_id. */
export function merchantFeed(s: StoreFacts, products: Product[], site: string, fill: (t: string, p: Product) => string): string {
  const items = products.filter((p) => p.status === 'published').flatMap((p) => p.variants.map((v) => [
    '    <item>',
    `      <g:id>${xmlEsc(v.sku)}</g:id>`,
    `      <g:item_group_id>${xmlEsc(p.sku)}</g:item_group_id>`,
    `      <title>${xmlEsc(`${p.name}, ${v.name}`)}</title>`,
    `      <description>${xmlEsc(fill(p.description, p))}</description>`,
    `      <link>${xmlEsc(canonicalUrl(productPath(p), site))}</link>`,
    ...p.images.slice(0, 1).map((im) => `      <g:image_link>${xmlEsc(absoluteUrl(im.src, site))}</g:image_link>`),
    ...p.images.slice(1, 11).map((im) => `      <g:additional_image_link>${xmlEsc(absoluteUrl(im.src, site))}</g:additional_image_link>`),
    `      <g:price>${v.price.toFixed(2)} USD</g:price>`,
    `      <g:availability>${v.availability === 'OutOfStock' ? 'out_of_stock' : v.availability === 'PreOrder' ? 'preorder' : 'in_stock'}</g:availability>`,
    '      <g:condition>new</g:condition>',
    `      <g:brand>${xmlEsc(s.name)}</g:brand>`,
    '      <g:identifier_exists>no</g:identifier_exists>',
    ...(p.googleProductCategory ? [`      <g:google_product_category>${xmlEsc(p.googleProductCategory)}</g:google_product_category>`] : []),
    `      <g:product_type>${xmlEsc(p.category)}</g:product_type>`,
    '    </item>',
  ].join('\n')));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${xmlEsc(s.name)}</title>\n    <link>${site}/</link>\n    <description>${xmlEsc(`Products from ${s.name}`)}</description>\n${items.join('\n')}\n  </channel>\n</rss>\n`;
}
