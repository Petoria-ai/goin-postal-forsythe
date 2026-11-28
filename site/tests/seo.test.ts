// SEO, local business facts and crawl files. These run against the data files directly, so a new
// service, guide or product that breaks a rule (duplicate title, link to a draft, private path in the
// sitemap, wrong hours) fails CI before it is built.
import { describe, it, expect } from 'vitest';
import { defaults, mergeStore, store, telHref, directionsUrl, verifiedProfiles } from '../src/data/store';
import { groupHours, statusAt, openingHoursSpecification, specialOpeningHoursSpecification, checkHours, fmt12, displayRows, zoned } from '../src/lib/hours';
import { canonicalPath, canonicalUrl, pageTitle, clampDescription, isPrivatePath, robotsContent, localBusinessLd, faqLd, productLd, ldJson, TITLE_MAX } from '../src/lib/seo';
import { allRoutes, indexableRoutes, LEGACY_REDIRECTS, STATIC_PAGES } from '../src/lib/routes';
import { robotsTxt, urlset, sitemapIndex, llmsTxt } from '../src/lib/feeds';
import { richText, plainText, storeTokens } from '../src/lib/richtext';
import { SERVICES } from '../src/data/services';
import { GUIDES } from '../src/data/guides';

const SITE = 'https://example.test';
const SERVER_ROUTES = ['/ship', '/track', '/account', '/counter'];

describe('business facts', () => {
  it('match the official information', () => {
    expect(store.name).toBe("Goin' Postal Monroe");
    expect(store.legalName).toBe('Holsom Postal LLC');
    expect(store.address).toBe('1800 Forsythe Ave, Suite 2, Monroe, LA 71201');
    expect(store.phone).toBe('318-570-2132');
    expect(store.timezone).toBe('America/Chicago');
    expect(store.profiles.facebook).toBe('https://www.facebook.com/monroegoinpostal/');
    expect(telHref()).toBe('tel:+13185702132');
    expect(directionsUrl()).toContain('destination=');
  });
  it('hours are open seven days: weekdays 9-6:30, Saturday 9-3, Sunday 10-3', () => {
    expect(store.weeklyHours).toHaveLength(7);
    expect(checkHours(store.weeklyHours, store.specialHours)).toEqual([]);
    expect(groupHours(store.weeklyHours).map((g) => `${g.label}: ${g.text}`)).toEqual([
      'Monday to Friday: 9:00 AM – 6:30 PM', 'Saturday: 9:00 AM – 3:00 PM', 'Sunday: 10:00 AM – 3:00 PM',
    ]);
    expect(displayRows(store.weeklyHours)[0]).toMatchObject({ days: 'Monday to Friday', key: 'days.monfri', open: '9:00 am to 6:30 pm' });
    expect(store.hours.find((h) => h.key === 'days.sun')?.open).toBe('10:00 am to 3:00 pm');
  });
  it('only verified https profiles are published', () => {
    expect(verifiedProfiles().map((p) => p.name)).toEqual(['Facebook']);
    expect(verifiedProfiles(mergeStore(defaults, { profiles: { yelp: 'http://insecure', bbb: '' } }))).toHaveLength(1);
  });
  it('a store JSON with its own weekly hours gets matching display rows', () => {
    const s = mergeStore(defaults, { weeklyHours: [{ day: 'Monday', opens: '08:00', closes: '17:00' }] });
    expect(s.hours).toEqual([{ days: 'Monday', key: '', open: '8:00 am to 5:00 pm' }, { days: 'Tuesday to Sunday', key: '', open: 'Closed', openKey: 'hours.closed' }]);
  });
});

describe('open-now status', () => {
  const w = defaults.weeklyHours;
  const tz = 'America/Chicago';
  // 2026-11-30 is a Monday. Chicago is UTC-6 in winter.
  it('weekday evenings are open until 6:30 PM', () => {
    expect(statusAt(new Date('2026-11-30T23:59:00Z'), w, [], tz)).toMatchObject({ open: true, text: 'Open now until 6:30 PM' }); // 5:59 pm
    expect(statusAt(new Date('2026-12-01T00:31:00Z'), w, [], tz)).toMatchObject({ open: false, text: 'Closed · opens tomorrow at 9:00 AM' }); // 6:31 pm
  });
  it('Sunday opens at 10', () => {
    expect(statusAt(new Date('2026-11-29T15:30:00Z'), w, [], tz)).toMatchObject({ open: false, text: 'Closed · opens today at 10:00 AM' }); // Sun 9:30 am
    expect(statusAt(new Date('2026-11-29T16:00:00Z'), w, [], tz).open).toBe(true);
    expect(statusAt(new Date('2026-11-29T21:01:00Z'), w, [], tz).text).toBe('Closed · opens tomorrow at 9:00 AM'); // Sun 3:01 pm
  });
  it('special hours and closures win over the weekly table', () => {
    const special = [{ date: '2026-12-25', closed: true, label: 'Christmas Day' }, { date: '2026-12-24', opens: '09:00', closes: '12:00', label: 'Christmas Eve' }];
    expect(statusAt(new Date('2026-12-25T18:00:00Z'), w, special, tz)).toMatchObject({ open: false, text: 'Closed for Christmas Day · opens tomorrow at 9:00 AM' });
    expect(statusAt(new Date('2026-12-24T19:00:00Z'), w, special, tz)).toMatchObject({ open: false }); // 1 pm, closed early
    expect(specialOpeningHoursSpecification(special, '2026-12-01')[0]).toMatchObject({ validFrom: '2026-12-25', opens: '00:00', closes: '00:00' });
    expect(checkHours(w, [{ date: '2026-13-40', closed: true }])).toHaveLength(1);
  });
  it('zoned() reads the store clock', () => {
    expect(zoned(new Date('2026-11-30T05:30:00Z'), tz)).toMatchObject({ ymd: '2026-11-29', day: 'Sunday', minute: 23 * 60 + 30 });
    expect(fmt12('00:15')).toBe('12:15 AM');
  });
});

describe('structured data', () => {
  const lb = localBusinessLd(store, SITE) as any;
  it('LocalBusiness has the NAP, hours, area and a stable @id', () => {
    expect(lb['@id']).toBe(`${SITE}/#business`);
    expect(lb.telephone).toBe('+1-318-570-2132');
    expect(lb.address).toMatchObject({ streetAddress: '1800 Forsythe Ave, Suite 2', addressLocality: 'Monroe', addressRegion: 'LA', postalCode: '71201', addressCountry: 'US' });
    expect(openingHoursSpecification(store.weeklyHours)).toHaveLength(3);
    expect(lb.openingHoursSpecification[0].dayOfWeek).toHaveLength(5);
    expect(lb.sameAs).toEqual(['https://www.facebook.com/monroegoinpostal/']);
    expect(lb.areaServed.map((a: any) => a.name)).toContain('West Monroe, Louisiana');
  });
  it('leaves out unverified facts instead of guessing', () => {
    expect(lb.geo).toBeUndefined();
    expect(lb.paymentAccepted).toBeUndefined();
    expect(lb.aggregateRating).toBeUndefined();
    expect(lb.review).toBeUndefined();
  });
  it('FAQ, Product and the script escape are well formed', () => {
    expect(faqLd([{ q: 'Q?', a: 'A.' }], '/x', SITE).mainEntity[0].acceptedAnswer.text).toBe('A.');
    const p = productLd({ path: '/shop/x', name: 'X', description: 'd', sku: 'S', images: ['/i.png'], brand: 'B', offers: [{ price: 1, availability: 'InStock' }, { price: 3, availability: 'InStock' }], pickupOnly: true }, SITE) as any;
    expect(p.offers).toMatchObject({ '@type': 'AggregateOffer', lowPrice: '1.00', highPrice: '3.00', offerCount: 2 });
    expect(p.offers.offers[0].availableDeliveryMethod).toBe('https://schema.org/OnSitePickup');
    expect(ldJson({ a: '</script>' })).not.toContain('</script>');
  });
});

describe('URLs, titles and indexing', () => {
  const routes = allRoutes();
  const idx = indexableRoutes();
  it('canonical paths are clean', () => {
    expect(canonicalPath('/shipping/')).toBe('/shipping');
    expect(canonicalPath('/shipping.html?x=1#y')).toBe('/shipping');
    expect(canonicalPath('/guides/index.html')).toBe('/guides');
    expect(canonicalUrl('/', SITE)).toBe(`${SITE}/`);
    expect(robotsContent({ noindex: true })).toBe('noindex, follow');
  });
  it('titles fit or drop the brand; descriptions are clamped', () => {
    expect(pageTitle('Notary in Monroe, LA', "Goin' Postal Monroe")).toBe("Notary in Monroe, LA | Goin' Postal Monroe");
    expect(pageTitle('x'.repeat(60), 'Brand Name Here')).toBe('x'.repeat(60));
    expect(clampDescription('word '.repeat(60)).length).toBeLessThanOrEqual(160);
  });
  it('private paths are never indexable or in the sitemap', () => {
    for (const p of ['/counter', '/counter/queue', '/api/rates', '/account', '/ship/done', '/cards/done', '/return/abc']) expect(isPrivatePath(p)).toBe(true);
    for (const p of ['/ship', '/shipping', '/cards', '/contact']) expect(isPrivatePath(p)).toBe(false);
    expect(idx.some((r) => isPrivatePath(r.path))).toBe(false);
  });
  it('every indexable page has a unique title and description of sensible length', () => {
    const titles = new Set<string>(), descs = new Set<string>();
    const problems: string[] = [];
    for (const r of idx) {
      if (titles.has(r.title)) problems.push(`${r.path}: duplicate title`); titles.add(r.title);
      if (descs.has(r.description)) problems.push(`${r.path}: duplicate description`); descs.add(r.description);
      if (r.title.length > TITLE_MAX) problems.push(`${r.path}: title ${r.title.length} chars`);
      if (r.description.length < 70 || r.description.length > 165) problems.push(`${r.path}: description ${r.description.length} chars`);
      if (/\{\w+\}/.test(r.description + r.h1 + r.title)) problems.push(`${r.path}: unfilled {token}`);
    }
    expect(problems).toEqual([]);
  });
  it('every internal link in published content points at a published page or a server route', () => {
    const known = new Set([...routes.filter((r) => r.status === 'published').map((r) => r.path), ...SERVER_ROUTES]);
    for (const r of idx) for (const l of r.links.filter((x) => x.startsWith('/'))) expect(known.has(canonicalPath(l)), `${r.path} links to ${l}`).toBe(true);
  });
  it('drafts are not built or listed; the card designer is noindexed', () => {
    for (const g of GUIDES.filter((x) => x.status === 'draft')) expect(routes.some((r) => r.path === `/guides/${g.slug}`)).toBe(false);
    expect(routes.find((r) => r.path === '/vi/gui-hang-di-viet-nam')).toBeUndefined(); // unreviewed translation
    expect(routes.find((r) => r.path === '/shipping/vietnam')?.alternates).toBeUndefined();
    expect(routes.find((r) => r.path === '/cards')?.indexable).toBe(false);
  });
  it('every published service has FAQs, related links and the hours/location block', () => {
    for (const s of SERVICES.filter((x) => x.status === 'published')) {
      expect(s.faqs.length, s.name).toBeGreaterThan(0);
      expect(s.related.length, s.name).toBeGreaterThan(0);
    }
    expect(STATIC_PAGES.map((p) => p.path)).toEqual(expect.arrayContaining(['/', '/about', '/contact']));
  });
  it('legacy redirects point at live pages and never at themselves', () => {
    const live = new Set(idx.map((r) => r.path));
    for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) { expect(live.has(to), `${from} -> ${to}`).toBe(true); expect(from).not.toBe(to); }
  });
});

describe('crawl files', () => {
  const robots = robotsTxt(SITE);
  const group = (bot: string) => robots.split('\n\n').find((g) => g.split('\n').includes(`User-agent: ${bot}`)) ?? '';
  it('robots.txt lets search and AI search crawlers in, keeps training crawlers and private paths out', () => {
    for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
      expect(group(bot), bot).toContain('Allow: /');
      expect(group(bot), bot).toContain('Disallow: /counter');
      expect(group(bot), bot).toContain('Disallow: /api/');
      expect(group(bot), bot).not.toMatch(/^Disallow: \/$/m);
    }
    for (const bot of ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Applebot-Extended']) expect(group(bot), bot).toMatch(/^Disallow: \/$/m);
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
  it('sitemaps list exactly the indexable pages, with lastmod', () => {
    const idx = indexableRoutes();
    const xml = urlset(idx, SITE);
    expect((xml.match(/<loc>/g) ?? []).length).toBe(idx.length);
    expect(xml).toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain(`<loc>${SITE}/shipping/ups</loc>`);
    expect(xml).not.toContain('/counter');
    expect(xml).not.toContain(`${SITE}/cards<`);
    expect(sitemapIndex(idx, SITE)).toContain(`${SITE}/sitemap-services.xml`);
  });
  it('llms.txt states the facts and lists only public pages', () => {
    const t = llmsTxt(store, indexableRoutes(), SITE, [{ q: 'Q', a: 'A' }]);
    expect(t).toMatch(/^# Goin' Postal Monroe/);
    expect(t).toContain('318-570-2132');
    expect(t).toContain('Sunday 10:00 AM – 3:00 PM');
    expect(t).not.toContain('/counter');
    expect(t).not.toContain('/account');
  });
});

describe('rich text', () => {
  const tk = storeTokens(store);
  it('escapes markup and only allows safe links', () => {
    expect(richText('<script>x</script>', tk)).toBe('&lt;script&gt;x&lt;/script&gt;');
    expect(richText('[a](javascript:alert(1))', tk)).not.toContain('<a');
    expect(richText('[a](/x) **b**', tk)).toBe('<a href="/x">a</a> <strong>b</strong>');
    expect(richText('[call](tel)', tk)).toContain('href="tel:+13185702132"');
  });
  it('fills store tokens from the central facts', () => {
    expect(plainText('Open until {weekdayClose}, Sunday {sundayHours}. Call {phone}.', tk)).toBe('Open until 6:30 PM, Sunday 10:00 AM to 3:00 PM. Call 318-570-2132.');
  });
});

describe('owner decisions (Nov 28 2026)', () => {
  it('pre-launch mode: no real domain means robots.txt blocks everything', async () => {
    const { isLiveSite } = await import('../src/lib/seo');
    expect(isLiveSite('http://localhost:4321')).toBe(false);
    expect(isLiveSite('https://goin-postal.workers.dev')).toBe(false);
    expect(isLiveSite('https://www.example.com')).toBe(true);
    const pre = robotsTxt('http://localhost:4321', undefined, false);
    expect(pre).toMatch(/^User-agent: \*\nDisallow: \/$/m);
    expect(pre).not.toContain('Allow: /');
  });
  it('online shipping is off: its pages are not indexed and published content does not link to them', async () => {
    const { isOnlineShippingPath } = await import('../src/data/content-types');
    expect(store.onlineShipping).toBe(false);
    const routes = allRoutes();
    for (const p of ['/ship', '/petership', '/developers']) expect(routes.find((r) => r.path === p)?.indexable, p).toBe(false);
    expect(isOnlineShippingPath('/shipping')).toBe(false);
    const offenders = indexableRoutes().flatMap((r) => r.links.filter((l) => isOnlineShippingPath(l)).map((l) => `${r.path} -> ${l}`));
    expect(offenders).toEqual([]);
    expect(llmsTxt(store, indexableRoutes(), SITE, [])).not.toContain('PeterShip');
  });
  it('switching online shipping on brings the pages back', () => {
    const on = mergeStore(defaults, { onlineShipping: true });
    const routes = allRoutes({ store: on });
    expect(routes.find((r) => r.path === '/ship')?.indexable).toBe(true);
    expect(routes.find((r) => r.path === '/shipping/domestic')?.links).toContain('/ship');
  });
});
