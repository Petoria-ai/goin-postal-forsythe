// The one SEO system for the site. Every page goes through Base.astro, which calls these helpers, so a
// new service, guide or product gets a title, description, canonical URL, robots directive, social
// tags and structured data without writing any of it by hand. Pure functions: tested in tests/seo.test.ts.
//
// Structured data rules (Google's and ours):
// - Only mark up what the page visibly says. No reviews or ratings unless they are real and shown.
// - One business entity, one @id (SITE/#business), referenced from every other node.
// - Leave a property out rather than guess it (geo, payment methods, prices that are not published).
import type { StoreFacts } from '../data/store';
import { verifiedProfiles } from '../data/store';
import { openingHoursSpecification, specialOpeningHoursSpecification } from './hours';

/** The canonical origin, from astro.config.mjs `site` (PUBLIC_SITE_URL at build). No trailing slash. */
export const SITE_URL: string = ((import.meta as any).env?.SITE || 'http://localhost:4321').replace(/\/+$/, '');
/** A real public https domain is configured. False = pre-launch mode: noindex everywhere, robots.txt blocks all. */
export const isLiveSite = (site: string) => /^https:\/\//.test(site) && !/^https:\/\/(localhost|127\.|[^/]*\.workers\.dev|[^/]*\.pages\.dev)/.test(site);
export const SITE_LIVE = isLiveSite(SITE_URL);

/** Paths that are never indexed: staff tools, customer accounts, order pages, the API. Robots rules are a courtesy; these routes are protected by PINs, sessions and order codes. */
export const PRIVATE_PREFIXES = ['/counter', '/api', '/account', '/ship/done', '/cards/done', '/return/', '/labels', '/demo-label', '/indexnow'] as const;
export const isPrivatePath = (path: string) => PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p.endsWith('/') ? p : p + '/') || path.startsWith(p + '.'));

/** Clean a path into its canonical form: leading slash, no trailing slash (except the home page), no query or hash, no index/.html. */
export function canonicalPath(path: string): string {
  let p = (path || '/').split(/[?#]/)[0];
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}
export const absoluteUrl = (path: string, site = SITE_URL) => (/^https?:\/\//.test(path) ? path : site + (path.startsWith('/') ? path : '/' + path));
export const canonicalUrl = (path: string, site = SITE_URL) => { const p = canonicalPath(path); return p === '/' ? site + '/' : site + p; };

/** Longest title Google usually shows in full; past this the brand suffix is dropped rather than truncated. */
export const TITLE_MAX = 65;
/** "Notary in Monroe, LA" -> "Notary in Monroe, LA | Goin' Postal Monroe". The brand is added only when it fits;
 *  titles that already name the store are left alone. Every title still names Monroe, so local relevance stays. */
export function pageTitle(title: string, brand: string): string {
  const t = title.trim();
  if (!t) return brand;
  if (t.toLowerCase().includes(brand.toLowerCase())) return t;
  const full = `${t} | ${brand}`;
  return full.length <= TITLE_MAX ? full : t;
}

/** Trim a description to Google's usual display length on a word boundary. Descriptions should be written to fit; this is the safety net. */
export function clampDescription(d: string, max = 160): string {
  const s = d.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}

export interface RobotsOpts { noindex?: boolean; nofollow?: boolean }
export function robotsContent({ noindex, nofollow }: RobotsOpts = {}): string {
  if (noindex) return `noindex, ${nofollow ? 'nofollow' : 'follow'}`;
  return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
}

// ---- JSON-LD -------------------------------------------------------------------------------------
export const ids = (site = SITE_URL) => ({
  business: `${site}/#business`,
  organization: `${site}/#organization`,
  website: `${site}/#website`,
  logo: `${site}/#logo`,
});

const clean = <T extends Record<string, unknown>>(o: T): T => {
  for (const k of Object.keys(o)) { const v = o[k]; if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) delete o[k]; }
  return o;
};

export function postalAddress(s: StoreFacts) {
  return { '@type': 'PostalAddress', streetAddress: [s.street, s.suite].filter(Boolean).join(', '), addressLocality: s.city, addressRegion: s.region, postalCode: s.postalCode, addressCountry: s.country };
}

const areaServed = (s: StoreFacts) => s.serviceArea.map((name) => ({ '@type': /parish/i.test(name) ? 'AdministrativeArea' : /louisiana/i.test(name) ? 'Place' : 'City', name: /louisiana|parish/i.test(name) ? `${name}${/louisiana/i.test(name) ? '' : ', Louisiana'}` : `${name}, Louisiana` }));

/** The store as a LocalBusiness: the entity every other node points at. */
export function localBusinessLd(s: StoreFacts, site = SITE_URL, opts: { todayYmd?: string; services?: { name: string; url: string }[] } = {}) {
  const i = ids(site);
  const sameAs = verifiedProfiles(s).filter((p) => !/location page/i.test(p.name)).map((p) => p.url);
  return clean({
    '@type': 'LocalBusiness',
    '@id': i.business,
    name: s.name,
    legalName: s.legalName,
    url: site + '/',
    telephone: '+1-' + s.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
    email: undefined, // the inbox is not published on the site; add it here if it ever is
    image: absoluteUrl('/images/og-default.png', site),
    logo: { '@type': 'ImageObject', '@id': i.logo, url: absoluteUrl(s.logo, site) },
    address: postalAddress(s),
    geo: s.geo ? { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } : undefined,
    hasMap: s.profiles.googleBusiness || undefined,
    openingHoursSpecification: openingHoursSpecification(s.weeklyHours),
    specialOpeningHoursSpecification: specialOpeningHoursSpecification(s.specialHours, opts.todayYmd),
    areaServed: areaServed(s),
    paymentAccepted: s.paymentAccepted || undefined,
    priceRange: s.priceRange || undefined,
    currenciesAccepted: 'USD',
    sameAs,
    parentOrganization: { '@id': i.organization },
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: '+1-' + s.phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'), areaServed: 'US', availableLanguage: ['English'] }],
    knowsAbout: [...s.carriers.map((c) => `${c} shipping`), 'Packing and shipping', 'Mailbox rental', 'Printing'],
    makesOffer: opts.services?.map((sv) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: sv.name, url: absoluteUrl(sv.url, site) } })),
  });
}

/** The company behind the store. Kept small: name, legal name, logo, profiles. */
export function organizationLd(s: StoreFacts, site = SITE_URL) {
  const i = ids(site);
  return clean({
    '@type': 'Organization',
    '@id': i.organization,
    name: s.name,
    legalName: s.legalName,
    url: site + '/',
    logo: { '@id': i.logo },
    sameAs: verifiedProfiles(s).filter((p) => !/location page/i.test(p.name)).map((p) => p.url),
  });
}

export function websiteLd(s: StoreFacts, site = SITE_URL, lang = 'en-US') {
  const i = ids(site);
  return { '@type': 'WebSite', '@id': i.website, url: site + '/', name: s.name, inLanguage: lang, publisher: { '@id': i.organization } };
}

export interface Crumb { name: string; path: string }
export function breadcrumbLd(crumbs: Crumb[], site = SITE_URL) {
  return { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, n) => ({ '@type': 'ListItem', position: n + 1, name: c.name, item: canonicalUrl(c.path, site) })) };
}

export function webPageLd(o: { path: string; title: string; description: string; type?: string; lang?: string; dateModified?: string; datePublished?: string; image?: string; hasBreadcrumb?: boolean; about?: string }, site = SITE_URL) {
  const url = canonicalUrl(o.path, site);
  const i = ids(site);
  return clean({
    '@type': o.type ?? 'WebPage',
    '@id': url + '#webpage',
    url,
    name: o.title,
    description: o.description,
    inLanguage: o.lang ?? 'en-US',
    isPartOf: { '@id': i.website },
    about: { '@id': o.about ?? i.business },
    primaryImageOfPage: o.image ? { '@type': 'ImageObject', url: absoluteUrl(o.image, site) } : undefined,
    datePublished: o.datePublished,
    dateModified: o.dateModified,
    breadcrumb: o.hasBreadcrumb ? { '@id': url + '#breadcrumb' } : undefined,
  });
}

export interface FaqItem { q: string; a: string; onlineOnly?: boolean }
/** FAQPage. Google shows FAQ rich results only for a few authoritative sites now; the markup still helps other engines and assistants read the answers. */
export function faqLd(faqs: FaqItem[], path: string, site = SITE_URL) {
  return { '@type': 'FAQPage', '@id': canonicalUrl(path, site) + '#faq', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function serviceLd(o: { name: string; description: string; path: string; serviceType?: string; providerName?: string; brand?: string[]; offers?: { price: number; priceCurrency?: string; description?: string }[] }, s: StoreFacts, site = SITE_URL) {
  return clean({
    '@type': 'Service',
    '@id': canonicalUrl(o.path, site) + '#service',
    name: o.name,
    serviceType: o.serviceType ?? o.name,
    description: o.description,
    url: canonicalUrl(o.path, site),
    provider: { '@id': ids(site).business },
    areaServed: areaServed(s),
    brand: o.brand?.map((b) => ({ '@type': 'Brand', name: b })),
    offers: o.offers?.map((of) => clean({ '@type': 'Offer', price: of.price.toFixed(2), priceCurrency: of.priceCurrency ?? 'USD', description: of.description, seller: { '@id': ids(site).business } })),
  });
}

export function articleLd(o: { path: string; headline: string; description: string; datePublished: string; dateModified?: string; image?: string; section?: string; type?: 'Article' | 'BlogPosting'; lang?: string }, site = SITE_URL) {
  const url = canonicalUrl(o.path, site);
  const i = ids(site);
  return clean({
    '@type': o.type ?? 'Article',
    '@id': url + '#article',
    headline: o.headline.slice(0, 110),
    description: o.description,
    url,
    mainEntityOfPage: { '@id': url + '#webpage' },
    image: o.image ? [absoluteUrl(o.image, site)] : [absoluteUrl('/images/og-default.png', site)],
    datePublished: o.datePublished,
    dateModified: o.dateModified ?? o.datePublished,
    author: { '@id': i.organization },
    publisher: { '@id': i.organization },
    articleSection: o.section,
    inLanguage: o.lang ?? 'en-US',
  });
}

export interface ProductLdInput {
  path: string; name: string; description: string; sku: string; images: string[]; brand: string; category?: string;
  offers: { price: number; name?: string; sku?: string; availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'MadeToOrder' }[];
  pickupOnly?: boolean; returnPolicyPath?: string; returnDays?: number | null; additionalProperty?: { name: string; value: string }[];
}
/** Product with its offers. Made-to-order printed goods are sold for pickup at the store; shipping details are added only when shipping is actually offered. */
export function productLd(p: ProductLdInput, site = SITE_URL) {
  const url = canonicalUrl(p.path, site);
  const i = ids(site);
  const returnPolicy = p.returnPolicyPath ? clean({
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'US',
    url: canonicalUrl(p.returnPolicyPath, site),
    returnPolicyCategory: p.returnDays ? 'https://schema.org/MerchantReturnFiniteReturnWindow' : 'https://schema.org/MerchantReturnNotPermitted',
    merchantReturnDays: p.returnDays || undefined,
  }) : undefined;
  const offer = (o: ProductLdInput['offers'][number]) => clean({
    '@type': 'Offer',
    name: o.name,
    sku: o.sku,
    url,
    price: o.price.toFixed(2),
    priceCurrency: 'USD',
    availability: `https://schema.org/${o.availability}`,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': i.business },
    availableDeliveryMethod: p.pickupOnly ? 'https://schema.org/OnSitePickup' : undefined,
    hasMerchantReturnPolicy: returnPolicy,
  });
  const prices = p.offers.map((o) => o.price);
  return clean({
    '@type': 'Product',
    '@id': url + '#product',
    name: p.name,
    description: p.description,
    sku: p.sku,
    image: p.images.map((im) => absoluteUrl(im, site)),
    brand: { '@type': 'Brand', name: p.brand },
    category: p.category,
    url,
    additionalProperty: p.additionalProperty?.map((a) => ({ '@type': 'PropertyValue', name: a.name, value: a.value })),
    offers: p.offers.length === 1 ? offer(p.offers[0]) : {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: p.offers.length,
      offers: p.offers.map(offer),
    },
  });
}

/** Wrap nodes in one @graph document for a single <script type="application/ld+json">. */
export const graph = (nodes: unknown[]) => ({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
/** JSON for a script tag: `<` escaped so text in the data can never close the tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
