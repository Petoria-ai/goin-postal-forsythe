// Every public URL the site publishes, with its SEO facts, from one function. The sitemap, llms.txt,
// IndexNow, the SEO health check and each page's own <head> all read this list, so they can never
// disagree about what is public. A new service, guide or product is in here the moment its data
// entry is published.
import { store as defaultStore, type StoreFacts } from '../data/store';
import { SERVICES, CATEGORY_NAMES } from '../data/services';
import { GUIDES } from '../data/guides';
import { PRODUCTS, CATEGORIES, productPath, categoryPath, liveCategories, categoryIndexable, lowPrice, publishedProducts } from '../data/catalog';
import { pathOf, guidePath, type SeoOverrides, type Status } from '../data/content-types';
import { canonicalPath, pageTitle, isPrivatePath, type Crumb } from './seo';
import { storeTokens, plainText, linksIn } from './richtext';
import redirectsJson from '../data/redirects.json';

export type RouteKind = 'page' | 'service' | 'service-hub' | 'guide' | 'guide-index' | 'product' | 'category' | 'shop' | 'translation';
export interface RouteMeta {
  path: string;
  kind: RouteKind;
  title: string;          // full <title>, brand included
  rawTitle: string;       // before the brand is added (for the SERP preview and checks)
  description: string;
  h1: string;
  indexable: boolean;     // in the sitemap and without noindex
  status: Status;
  lastmod?: string;       // YYYY-MM-DD
  lang: 'en' | 'vi';
  alternates?: { lang: string; path: string }[]; // hreflang partners, this page included
  canonical?: string;     // only when it points somewhere else
  ogImage?: string; ogImageAlt?: string;
  links: string[];        // internal links in the content, for the broken-link check
  images: { src: string; alt: string }[];
  crumbs: Crumb[];
  section?: string;
}

/** Build drafts too (noindexed, out of the sitemap) for review: SEO_PREVIEW_DRAFTS=1 npm run build. */
export const previewDrafts = (): boolean => {
  try { return (globalThis as any).process?.env?.SEO_PREVIEW_DRAFTS === '1'; } catch { return false; }
};
const built = (status: Status) => status === 'published' || previewDrafts();

/** The plain pages, by hand. Their .astro files read their title and description from here. */
export const STATIC_PAGES: { path: string; title: string; h1: string; description: string; indexable: boolean; lastmod: string; section?: string; ogImage?: string }[] = [
  { path: '/', title: '{name}: Shipping, Mailboxes & Printing in Monroe, LA', h1: 'Ship it, pack it, print it', description: 'UPS, FedEx, USPS and DHL shipping, packing, mailboxes, notary and printing at {street}, Monroe, LA. Open 7 days, weekdays until {weekdayClose}.', indexable: true, lastmod: '2026-11-28' },
  { path: '/about', title: 'About {name}', h1: 'About {name}', description: 'Independently owned shipping and business service center at {street}, Monroe, LA, serving Monroe, West Monroe and Northeast Louisiana.', indexable: true, lastmod: '2026-11-28' },
  { path: '/contact', title: 'Contact Us & Directions', h1: 'Contact {name}', description: 'Call {phone}, get directions to {street}, Monroe, or ask for a shipping quote. Open 7 days a week, weekdays until {weekdayClose}.', indexable: true, lastmod: '2026-11-28' },
  { path: '/ship', title: 'Ship a Package Online: Compare USPS, UPS, FedEx & DHL', h1: 'Ship a package', description: 'Compare USPS, UPS, FedEx and DHL rates for U.S. addresses and buy a label online. Print at home or show the QR code at our Monroe counter.', indexable: true, lastmod: '2026-11-28', section: 'Shipping' },
  { path: '/track', title: 'Track a Package', h1: 'Track a package', description: 'Track a package shipped from {name} with your pickup code or tracking number.', indexable: true, lastmod: '2026-11-28', section: 'Shipping' },
  { path: '/petership', title: 'PeterShip: Our Online Shipping Counter', h1: 'PeterShip', description: 'PeterShip is our own shipping software: compare USPS, UPS, FedEx and DHL, buy labels online, business accounts, batch shipping, returns and pickups.', indexable: true, lastmod: '2026-11-28' },
  { path: '/developers', title: 'Shipping API for Developers', h1: 'API for developers', description: 'The PeterShip public API: rates, labels, tracking, batches and pickups for business accounts, with an OpenAPI description.', indexable: true, lastmod: '2026-11-28' },
  { path: '/guides', title: 'Shipping, Mailbox & Business Guides', h1: 'Guides', description: 'Plain answers about shipping, packing, mailboxes, returns and business services from the counter at {name} in Monroe, LA.', indexable: true, lastmod: '2026-11-28' },
  { path: '/privacy', title: 'Website Privacy & Cookies', h1: 'Website privacy and cookies', description: 'How the {name} website uses cookies and analytics, what is never collected, and how to change your choice.', indexable: true, lastmod: '2026-11-28' },
  // The card designer is an editor, not a landing page: the indexable page is /shop/business-cards.
  { path: '/cards', title: 'Business Card Designer', h1: 'Design your business cards', description: 'Design your own business cards in the browser, pay online and pick them up in Monroe.', indexable: false, lastmod: '2026-11-28' },
];

export interface RouteOpts { store?: StoreFacts }

const filled = (s: StoreFacts) => { const tk = storeTokens(s); return (t: string) => plainText(t, tk); };
const crumbsFor = (_path: string, trail: Crumb[]): Crumb[] => [{ name: 'Home', path: '/' }, ...trail].filter((c, i, a) => a.findIndex((x) => x.path === c.path) === i);

function applySeo(r: RouteMeta, seo: SeoOverrides | undefined, brand: string, fill: (t: string) => string): RouteMeta {
  if (!seo) return r;
  if (seo.title) { r.rawTitle = fill(seo.title); r.title = pageTitle(r.rawTitle, brand); }
  if (seo.description) r.description = fill(seo.description);
  if (seo.canonical) r.canonical = seo.canonical;
  if (seo.noindex) r.indexable = false;
  if (seo.ogImage) { r.ogImage = seo.ogImage; r.ogImageAlt = seo.ogImageAlt; }
  if (r.canonical && canonicalPath(r.canonical) !== r.path) r.indexable = false; // a page pointing elsewhere is not listed itself
  return r;
}

/** Every route the build publishes. Drafts are left out unless previewDrafts() is on, and then they are noindexed. */
export function allRoutes(opts: RouteOpts = {}): RouteMeta[] {
  const s = opts.store ?? defaultStore;
  const fill = filled(s);
  const brand = s.name;
  const out: RouteMeta[] = [];
  const tk = { ...storeTokens(s) };

  for (const p of STATIC_PAGES) {
    const rawTitle = fill(p.title);
    out.push({ path: p.path, kind: p.path === '/guides' ? 'guide-index' : 'page', rawTitle, title: pageTitle(rawTitle, brand), description: fill(p.description), h1: fill(p.h1), indexable: p.indexable, status: 'published', lastmod: p.lastmod, lang: 'en', links: [], images: [], crumbs: p.path === '/' ? [] : crumbsFor(p.path, [{ name: fill(p.h1), path: p.path }]), section: p.section, ogImage: p.ogImage });
  }

  for (const sv of SERVICES) {
    if (!built(sv.status)) continue;
    const path = pathOf(sv);
    const hub = SERVICES.find((x) => x.category === sv.category && !x.slug);
    const trail: Crumb[] = sv.slug ? [{ name: CATEGORY_NAMES[sv.category], path: pathOf({ category: sv.category, slug: '' }) }, { name: sv.name, path }] : [{ name: sv.name, path }];
    const text = [sv.intro, ...sv.sections.flatMap((x) => [...(x.body ?? []), ...(x.list ?? [])]), ...sv.faqs.map((f) => f.a)].join('\n');
    const rawTitle = fill(sv.title);
    const vi = sv.translations?.vi;
    const viBuilt = vi && built(vi.status);
    const alternates = viBuilt && vi.status === 'published' && sv.status === 'published' ? [{ lang: 'en', path }, { lang: 'vi', path: vi.path }] : undefined;
    out.push(applySeo({
      path, kind: sv.slug ? 'service' : 'service-hub', rawTitle, title: pageTitle(rawTitle, brand), description: fill(sv.description), h1: fill(sv.h1),
      indexable: sv.status === 'published', status: sv.status, lastmod: sv.updated, lang: 'en', alternates,
      links: [...linksIn(text), ...sv.related, ...(sv.cta ?? []).map((c) => c.href).filter((h) => h.startsWith('/'))],
      images: sv.image ? [sv.image] : [], crumbs: crumbsFor(path, trail), section: CATEGORY_NAMES[sv.category],
    }, sv.seo, brand, fill));
    if (hub && hub.status !== 'published' && sv.slug) out[out.length - 1].links.push(pathOf(hub));
    if (viBuilt) {
      const vt = fill(vi.title);
      const vtext = [vi.intro, ...vi.sections.flatMap((x) => [...(x.body ?? []), ...(x.list ?? [])]), ...vi.faqs.map((f) => f.a)].join('\n');
      out.push({ path: vi.path, kind: 'translation', rawTitle: vt, title: pageTitle(vt, brand), description: fill(vi.description), h1: fill(vi.h1), indexable: vi.status === 'published' && sv.status === 'published', status: vi.status, lastmod: vi.updated, lang: 'vi', alternates, links: linksIn(vtext), images: [], crumbs: [{ name: 'Trang chủ', path: '/' }, { name: vi.name, path: vi.path }] });
    }
  }

  const guides = GUIDES.filter((g) => built(g.status));
  for (const g of guides) {
    const path = guidePath(g);
    const rawTitle = fill(g.seoTitle ?? g.title);
    const text = [g.summary, ...g.sections.flatMap((x) => [...(x.body ?? []), ...(x.list ?? [])]), ...(g.faqs ?? []).map((f) => f.a)].join('\n');
    out.push(applySeo({ path, kind: 'guide', rawTitle, title: pageTitle(rawTitle, brand), description: fill(g.description), h1: fill(g.title), indexable: g.status === 'published', status: g.status, lastmod: g.updated, lang: 'en', links: [...linksIn(text), ...g.related], images: g.image ? [g.image] : [], crumbs: crumbsFor(path, [{ name: 'Guides', path: '/guides' }, { name: fill(g.title), path }]), section: 'Guides' }, g.seo, brand, fill));
  }

  // Shop: the hub, live categories, published products (drafts too when previewing).
  const prods = PRODUCTS.filter((p) => built(p.status));
  if (prods.length) {
    out.push({ path: '/shop', kind: 'shop', rawTitle: 'Shop Custom Printing', title: pageTitle('Shop Custom Printing', brand), description: fill('Order custom printing online from {name}: business cards today, more products on the way. Pick up in Monroe, LA.'), h1: 'Shop', indexable: publishedProducts().length > 0, status: 'published', lastmod: prods.map((p) => p.updated).sort().pop(), lang: 'en', links: prods.map(productPath), images: [], crumbs: crumbsFor('/shop', [{ name: 'Shop', path: '/shop' }]) });
  }
  for (const c of liveCategories(CATEGORIES, prods)) {
    const path = categoryPath(c);
    out.push(applySeo({ path, kind: 'category', rawTitle: fill(c.title), title: pageTitle(fill(c.title), brand), description: fill(c.description), h1: fill(c.h1), indexable: categoryIndexable(c, prods.filter((p) => p.status === 'published')), status: c.status, lastmod: prods.filter((p) => p.category === c.slug).map((p) => p.updated).sort().pop(), lang: 'en', links: prods.filter((p) => p.category === c.slug).map(productPath), images: [], crumbs: crumbsFor(path, [{ name: 'Shop', path: '/shop' }, { name: c.name, path }]) }, c.seo, brand, fill));
  }
  for (const p of prods) {
    const path = productPath(p);
    const ptk = { ...tk, low: `$${lowPrice(p).toFixed(2)}`, quantities: p.variants.map((v) => v.name.replace(/ cards$/, '')).join(', ').replace(/, ([^,]*)$/, ' or $1') };
    const pf = (t: string) => plainText(t, ptk);
    const cat = CATEGORIES.find((c) => c.slug === p.category);
    const rawTitle = pf(p.title);
    out.push(applySeo({ path, kind: 'product', rawTitle, title: pageTitle(rawTitle, brand), description: pf(p.description), h1: pf(p.h1), indexable: p.status === 'published', status: p.status, lastmod: p.updated, lang: 'en', links: [...p.related, ...(p.designUrl ? [p.designUrl] : [])], images: p.images, crumbs: crumbsFor(path, [{ name: 'Shop', path: '/shop' }, ...(cat ? [{ name: cat.name, path: categoryPath(cat) }] : []), { name: p.name, path }]), ogImage: p.images[0]?.src, ogImageAlt: p.images[0]?.alt, section: cat?.name }, p.seo, brand, pf));
  }

  for (const r of out) {
    if (isPrivatePath(r.path)) r.indexable = false;
    if (r.status !== 'published') r.indexable = false;
  }
  return out;
}

/** The routes search engines should see: indexable, published, canonical to themselves. */
export const indexableRoutes = (opts: RouteOpts = {}) => allRoutes(opts).filter((r) => r.indexable);

/** The meta for one path; pages call this so their <head> matches the sitemap exactly. */
export function routeMeta(path: string, opts: RouteOpts = {}): RouteMeta | undefined {
  const p = canonicalPath(path);
  return allRoutes(opts).find((r) => r.path === p);
}

/** Old or alternative URLs that should 301 to the current one, from src/data/redirects.json (one list for
 *  the Cloudflare _redirects file the build writes, the middleware and the tests). */
export const LEGACY_REDIRECTS: Record<string, string> = redirectsJson.redirects;
