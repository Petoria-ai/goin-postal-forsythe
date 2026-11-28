# SEO, Local SEO, GEO and AEO: progress log

The living record of the SEO program for the store website (`site/`). Read this first in any new
session: it says what is done, what is not, where everything lives and what the owners still have
to do. Update it at the end of every milestone.

- **Original brief:** the owner's "Goin' Postal Monroe: Comprehensive SEO, Local SEO, GEO & AEO
  Implementation" request (20 sections, three priorities). Work proceeds one priority at a time, and
  each priority ends with a validated milestone commit and a stop for owner review.
- **Rules from the owner:** do not deploy to production; do not invent business facts, prices,
  reviews or profile links; publish only services that exist; no paid dependencies; no new npm packages.

## Status

| Milestone | State | Commit |
|---|---|---|
| Priority 1: essentials before launch | ✅ Done and validated, Nov 28 2026 | "SEO milestone 1" on branch `seo/priority-1` |
| Priority 1 revisions: owner decisions applied | ✅ Done and validated, Nov 28 2026 | "SEO milestone 1b" on branch `seo/priority-1` |
| Priority 2: growth and visibility | ⏸ Waiting for owner go-ahead (part of the code is already written, see below) | n/a |
| Priority 3: future scalability | ⏸ Waiting for owner go-ahead (part of the code is already written, see below) | n/a |

Nothing has been deployed. The work is on branch `seo/priority-1`, not on `main`.

## How the SEO system works (architecture in one screen)

Everything flows from data files through one registry:

```
src/data/store.ts       business facts: name, legal name, address, phone, time zone, weekly hours,
                        special hours, service area, carriers, verified profile links, logo
src/data/services.ts    every service page and hub (copy, FAQs, related links, status)
src/data/guides.ts      educational guides (published + drafts)
src/data/catalog.ts     shop categories and products (prices read from src/lib/cards.ts)
src/data/redirects.json old URL -> new URL (301s)
src/data/crawlers.ts    robots.txt policy: search / AI search / user fetchers allowed, training blocked
        │
        ▼
src/lib/routes.ts       allRoutes(): every public URL with title, description, H1, canonical,
                        indexable flag, lastmod, breadcrumbs, hreflang, links. THE single list.
        │
        ├── src/layouts/Base.astro   <head>: title, description, robots, canonical, OG/Twitter,
        │                             hreflang, verification tags, JSON-LD @graph; breadcrumbs; footer
        ├── /sitemap.xml + /sitemap-{pages,services,guides,products}.xml   (src/lib/feeds.ts)
        ├── /robots.txt, /llms.txt, /feeds/google-merchant.xml              (src/lib/feeds.ts)
        ├── tests/seo.test.ts        rules every route must pass (unique titles, lengths, links ...)
        └── scripts/seo-audit.mjs    the same rules checked on the built HTML (CI runs it)
```

- **Copy never hard-codes facts.** Text in the data files uses `{tokens}` such as `{phone}`,
  `{street}`, `{weekdayClose}`, `{sundayHours}` (see `storeTokens()` in `src/lib/richtext.ts`).
  Change the hours in `store.ts` and every page, the footer, the JSON-LD and llms.txt change with it.
- **Hours engine:** `src/lib/hours.ts` (pure, tested): display groups, open-now status in
  America/Chicago, schema.org OpeningHoursSpecification, special hours and closures.
- **Adding a page:** add an entry to `services.ts`, `guides.ts` or `catalog.ts` with
  `status: 'published'`. Title, meta, canonical, JSON-LD, breadcrumbs, sitemap, llms.txt and the
  checks all follow. `seo: { title, description, canonical, noindex, ogImage }` overrides anything
  generated. Drafts are not built; `SEO_PREVIEW_DRAFTS=1 npm run build` builds them noindexed for review.
- **Private routes:** `PRIVATE_PREFIXES` in `src/lib/seo.ts` (`/counter`, `/api`, `/account`,
  `/ship/done`, `/cards/done`, `/return/` ...). These routes are always noindexed, never in the
  sitemap or llms.txt, and get `X-Robots-Tag` from `src/middleware.ts`. The real protection is still
  the existing PINs, sessions and order codes, which were not changed.
- **URLs:** `build.format: 'file'` in `astro.config.mjs`, so pages are served at `/contact`, not
  `/contact/`. Canonicals have no trailing slash (except `/`). Cloudflare answers `/contact/` with a
  307 to `/contact`.
- **Redirects:** `src/data/redirects.json` → `dist/client/_redirects` (written by the integration in
  `astro.config.mjs`). Cloudflare applies these before anything else, so old URLs get a real 301.

## Priority 1: completed

| Brief item | What was done | Where |
|---|---|---|
| Centralized business info | Official NAP, legal name, time zone, service area, carriers, verified profiles, logo. Helpers `telHref()`, `directionsUrl()`, `verifiedProfiles()` | `src/data/store.ts`, `site/stores/forsythe.json` |
| Accurate hours, 7 days | Mon–Fri 9:00 AM–6:30 PM, Sat 9:00 AM–3:00 PM, Sun 10:00 AM–3:00 PM. Special hours supported. Open/closed badge in the store's time zone | `src/lib/hours.ts`, `components/seo/OpenStatus.astro`, `/api/hours` |
| Titles and meta descriptions | Unique per page, generated from the registry; the brand suffix is added only when the title fits in 65 characters | `src/lib/routes.ts`, `src/lib/seo.ts` |
| Canonical URLs | On every indexable page; consistent with the sitemap; overridable | `Base.astro` |
| XML sitemap | Sitemap index plus four child sitemaps, only indexable URLs, lastmod, hreflang-ready | `src/pages/sitemap*.xml.ts`, `src/lib/feeds.ts` |
| robots.txt | Search engines, AI search crawlers and user fetchers allowed; AI training crawlers and Google-Extended blocked; private paths disallowed; sitemap listed | `src/data/crawlers.ts` |
| AI crawler accessibility | OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot and Bingbot allowed. All content is plain server-built HTML | as above |
| LocalBusiness JSON-LD | One entity, `@id` `<site>/#business`, on every public page, with WebSite, Organization, WebPage and BreadcrumbList. No geo, payment, ratings or reviews (unverified) | `src/lib/seo.ts` |
| Service landing pages | 23 service pages and 3 hubs, each with a unique H1, intro, sections, pricing explanation, restrictions, FAQs, hours/location block, call and directions buttons, related links, Service + FAQPage JSON-LD | `src/data/services.ts`, `src/pages/[category]/[...slug].astro` |
| About, Contact, 404, Privacy | New About page; Contact rebuilt (call, directions, hours, map, existing quote form kept); real-404 page with useful links; Privacy page | `src/pages/about.astro`, `contact.astro`, `404.astro`, `privacy.astro` |
| Breadcrumbs, semantic HTML | Visible breadcrumbs plus BreadcrumbList; one H1 per page; FAQ as `<details>`; tables for comparisons | `components/seo/*` |
| Footer NAP and internal links | Name, address, phone, hours, open status, service area, verified profiles, links to every section, the independence statement | `components/seo/SiteFooter.astro` |
| Private page protection | noindex meta, `X-Robots-Tag`, robots Disallow, excluded from the sitemap and llms.txt. Auth unchanged | `src/lib/seo.ts`, `src/middleware.ts` |
| Mobile and accessibility | Checked at iPhone 13 width on 21 pages: no horizontal scroll, no console errors, 1 H1 each. Skip link, labeled navs and forms, keyboard-usable FAQ | `src/styles/global.css` (appended section) |
| HTTPS, headers, caching | Middleware redirects HTTP to HTTPS on Worker routes; `public/_headers` adds HSTS, nosniff, frame and referrer policy, a 1-year immutable cache for `/_astro/*`, noindex on utility files | `public/_headers`, `src/middleware.ts` |
| Redirect mapping | 16 legacy or alternative URLs → 301 (e.g. `/returns` was linked from the home page but never existed) | `src/data/redirects.json` |
| Broken link fixed | Home "Returns drop-off" linked to the missing `/returns`; it now goes to `/shipping/returns` | `src/data/store.ts` |
| SEO health check | `npm run seo:audit` (titles, descriptions, duplicates, H1, canonicals, JSON-LD parse and business `@id`, no review markup, image alt, broken internal links, sitemap vs noindex, robots groups). Added to CI | `site/scripts/seo-audit.mjs`, `.github/workflows/ci.yml` |
| Images | OG share image (1200×630), logo (512), Apple touch icon, business-card product image. Text wordmarks only; the GP Brands logo is not used | `site/public/images/` |

### Validation at milestone 1 (Nov 28 2026)

- `npm test` (astro check, vitest, build): **0 type errors; 139/139 tests pass** (115 existing + 24 new in `tests/seo.test.ts`); build OK.
- `npm run seo:audit`: **OK, 0 errors, 0 warnings** (at milestone 1b: `npm run seo:check` OK with 44 indexable pages, 45 sitemap URLs; 142/142 tests). 49 pages built, 46 indexable, 48 sitemap URLs (the extra two are the server-rendered `/ship` and `/track`).
- Local Worker (`astro preview`, wrangler):
  - Public pages return 200.
  - `/returns`, `/notary`, `/blog` and `/business-cards` return 301, keeping the query string.
  - An unknown URL returns 404 with noindex.
  - `/counter*`, `/account` and `/api/*` carry `X-Robots-Tag: noindex, nofollow`.
  - `/cards` (the editor) is noindexed.
  - The staff API accepts the right PIN and refuses a wrong one, as before.
  - `/api/zip` and `/api/rates` behave as before.
  - The D1 schema (with four new tables) applies cleanly.
- The schema re-runs cleanly in sqlite.
- The one build-log line "Error: Request was cancelled" is pre-existing: it was in the baseline build before any change (the sandbox cannot reach Cloudflare's `Request.cf` endpoint).

## Code already written for Priority 2 and 3 (in this commit, NOT yet validated as a milestone)

This code was written before the milestone process was introduced. It is kept, it builds and its
basic tests pass, but it has not had its own milestone review. Treat it as a starting point for P2
and P3, not as finished work.

| Area | State | Files |
|---|---|---|
| Analytics (GA4, GTM, Google Ads, Meta Pixel) with Consent Mode v2, GPC respected, PII scrubbing, one-install rule | Written. **Inert: loads nothing until a `PUBLIC_*` ID is set.** Events not yet verified in GA4 DebugView | `src/lib/analytics-config.ts`, `src/lib/track.ts`, `src/lib/referral.ts`, `components/seo/Analytics.astro`, `ConsentBanner.astro` |
| AI referral classification (ChatGPT, Claude, Gemini, Perplexity, Copilot ...) | Written; not unit-tested yet | `src/lib/referral.ts` |
| Conversion events wired | `phone_click`, `directions_click`, `generate_lead` (contact form), `customize_start`, `view_item` (product page). **Not yet wired:** ship checkout, card checkout, purchase on the done pages | various |
| Guides | 10 published guides + 8 drafts. Built and audited with P1 | `src/data/guides.ts`, `src/pages/guides/*` |
| IndexNow | Library, key file route `/indexnow.txt`, D1 log table. **No admin button or workflow yet** | `src/lib/indexnow.ts`, `src/pages/indexnow.txt.ts` |
| Shop / product SEO | `/shop`, `/shop/business-cards` (Product + AggregateOffer from the live card prices), category page (built, noindexed until it has 2+ products), Merchant Center feed | `src/data/catalog.ts`, `src/pages/shop/*`, `/feeds/google-merchant.xml` |
| Vietnamese page | Written (`/vi/gui-hang-di-viet-nam`), **draft until a native speaker reviews it**. hreflang switches on automatically when published | `services.ts` (`translations.vi`), `src/pages/vi/[slug].astro` |
| llms.txt | Built and checked by tests | `src/pages/llms.txt.ts` |
| Admin data layer | D1 tables `seo_redirects`, `special_hours`, `ai_visibility_log`, `indexnow_log` with store functions (D1 + memory) and export registration. **No `/counter/seo` page or `/api/seo` yet** | `db/schema.sql`, `src/shipping/store.ts` |

## Remaining work

### Priority 2 (next, when authorized)
1. Review and finish analytics: wire `shipping_quote`/`begin_checkout` on `/ship`, `begin_checkout` on `/cards`, and `purchase` on `/ship/done` and `/cards/done`; add unit tests for `referral.ts` and `scrubParams`; verify with real IDs in GA4 DebugView.
2. IndexNow: `/api/seo` action and a manager-only button; daily GitHub workflow `.github/workflows/indexnow.yml` using `SEO_TASK_KEY`; tests for `indexNowDiff`.
3. Search Console and Bing Webmaster verification (meta tags are already supported through env vars), and the setup instructions below.
4. Internal linking review across existing PeterShip pages; performance pass (Core Web Vitals measurement, image sizes, the 500 kB server chunk warning, which already existed).
5. FAQ and guide content review with the owners (see Decisions below).

### Priority 3 (when authorized)
1. `/counter/seo` admin page plus `/api/seo`, with: SEO health report, SERP preview, live redirects (D1), special hours and closures (D1, already read by `/api/hours`), AI visibility log, IndexNow submit. Patch the staff nav line in every counter page, and add the i18n key `st.nav.seo` in 14 languages.
2. **Known issue to solve:** D1-managed redirects run in `src/middleware.ts` on 404s, but Cloudflare serves the static 404 page without invoking the Worker middleware (found in milestone 1 testing). Options: put the 404 route on the server (`prerender = false`), or set `run_worker_first` for unknown paths. The static `_redirects` file works today.
3. Product/category growth, Merchant Center setup, publishing the Vietnamese page after review, and a return policy page (needed before `MerchantReturnPolicy` markup).
4. Content-managed SEO overrides without code (currently overrides are fields in the data files plus a rebuild).

## Implementation decisions (and why)

- **One registry, no SEO plugin.** No `@astrojs/sitemap` or similar was added; the registry drives everything, so there are no new dependencies and the sitemap and `<head>` always agree.
- **Consolidated pages** to avoid cannibalization:
  - package drop-off + prepaid label drop-off → `/shipping/drop-off`
  - professional + custom box packing → `/shipping/packing`
  - personal mailbox + package receiving → `/mailboxes/physical`
  - business address + small-business mailbox → `/mailboxes/business-address`
  - printing + copying → `/business-services/printing`
  - Vietnam cargo + shipping to Vietnam → `/shipping/vietnam`

  Old or alternative slugs for these 301 to the consolidated pages.
- **New SEO copy is English-only HTML, not run through the 14-language `data-i18n` system.** Machine-translating long service copy into 14 languages would break the brief's rule to publish only complete, accurate translations. The header, nav and footer still switch languages. Real translated pages use server-rendered `/vi/...` URLs with hreflang.
- **Brand suffix dropped when the title is too long.** This keeps titles under about 65 characters. Every title still names Monroe.
- **`/cards` (the editor) is noindexed**; `/shop/business-cards` is the indexable landing page. The header "Business cards" link now points to the landing page, which has a "Start designing" button.
- **FAQPage markup is used**, knowing Google now shows FAQ rich results only for a few authoritative sites. It still helps other engines and AI assistants.
- **No `geo`, `paymentAccepted`, `priceRange`, reviews or ratings** in structured data until they are confirmed.
- **Service copy avoids unverified specifics.** It says "call for a quote" rather than giving prices, transit times, freight partners or fingerprinting type. Published carrier size and weight limits are included because they are carriers' own published numbers.
- **Training crawlers blocked, search allowed**, per the brief. Google-Extended is blocked too; see the decision below.
- **Store name** changed from "Goin' Postal Forsythe" to **"Goin' Postal Monroe"** everywhere customer-facing, including the ship-from label name. The internal store id stays `forsythe`.

## Decisions for Peter and Rin

### Settled (Nov 28 2026, applied in milestone 1b)
- **Legal name: Holsom Postal LLC.** The site already used it. "Wholesome Postal" was corrected in `CLAUDE.md`, `AGENDA.md`, `README.md`, `monetization/README.md`, `monetization/it-llc/README.md`, `monetization/resale-macmini/dropship/README.md` and `shipping-client/llc/README.md`. `CHANGELOG.md` was left as is, because it is generated from past releases.
- **No domain yet.** The store advertises through the franchise site, www.goinpostal.com, for now, and wants its own domain soon. The guessed `goinpostalforsythe.com` was removed. The site now builds in **pre-launch mode** until `PUBLIC_SITE_URL` is set: every page is noindex, robots.txt disallows all crawlers, there are no canonicals, and nothing points at a domain the store does not own. Setting the domain and rebuilding switches everything on; no code change is needed.
- **Online shipping is off** until the e-commerce and mailbox side is stable. Switch: `onlineShipping: false` in `src/data/store.ts`. While it is off:
  - `/ship`, `/petership` and `/developers` are noindexed and out of the sitemap.
  - Service pages hide "Compare rates online" buttons and online-only sections and FAQs (marked `onlineOnly` in `services.ts`), and show Call and Get directions instead.
  - The footer, 404 and About pages drop their online-shipping links, and llms.txt says shipping is booked at the counter or by phone.
  - International shipping is described as booked at the counter or by phone.

  Setting the switch to `true` restores all of it. Tests cover both states.
- **Freight, fingerprinting, fax, scanning and custom boxes are confirmed.** Prices are given in person on purpose; those pages invite customers to walk in or call.
- **Owner priority:** e-commerce and mailboxes come before online shipping. Order the Priority 2 and 3 work accordingly.
- **Header and home page stay as they are.** Peter will update the "Ship a package" and "About PeterShip" tabs and the home page's PeterShip panel himself as the business changes. Do not hide or restyle them.
- **Google-Extended stays blocked.** It gives no search benefit: Google Search, AI Overviews, Maps and "near me" answers do not depend on it. Recorded in `src/data/crawlers.ts`.
- **Franchise store page:** `https://goinpostal.com/store/GP490.1` is in `profiles.other`, and is shown in the footer and in `sameAs`.
- **Virtual mailbox sign-up:** `profiles.anytimeMailbox` is `https://www.anytimemailbox.com/s/monroe-1800-forsythe-avenue` (Peter set the location up himself). `/mailboxes/virtual` shows a "Sign up online" button to it (CTA keyword `anytimeMailbox`; the button hides if the link is ever blanked). The page could not be loaded from the build environment, because its network blocks anytimemailbox.com, so Peter is checking it in a private browser window.
- **Google Business Profile exists and is being promoted.** Its share link, `https://share.google/WSq90cS7IAT59Xtjm`, is in `profiles.googleBusiness`. It now appears in the footer as "Google Maps", and in the LocalBusiness `sameAs` and `hasMap`. Optional: swap in the full Google Maps URL, which is more robust than a short link.

### Still open
1. **Domain name to buy**, and whether GP Brands' franchise rules limit domains that use "Goin' Postal".
2. **The Business Profile's "Ask for reviews" link** (`profiles.googleReview`). The delivered-package email can then ask for reviews (`reviewUrl`).
3. **Physical mailbox prices** (the register's template prices are placeholders).
4. **Exact map pin** (`geo`), payment methods (`paymentAccepted`), holiday closures (`specialHours`).
5. **Privacy page:** have it reviewed before launch.

## Manual actions required from the owners (none block the code)

There is **no Cloudflare account yet**; the site has only been run locally. The code is built for Cloudflare Workers (KV, D1 and assets), and the free plan should cover it. Launch steps, in order:

1. [x] **Google Business Profile:** done and being promoted. Make sure its name, address, phone and hours match `store.ts` exactly. On launch day, set its website field to the new domain.
2. [ ] **Buy a domain.** Check GP Brands' rules on using "Goin' Postal" in it first.
3. [ ] **Create a Cloudflare account** and connect this GitHub repo (Workers Builds). Create the KV namespace and the D1 database, and paste their ids into `site/wrangler.jsonc` (the `REPLACE_WITH_...` values). Run `npm run db:remote`. Add the domain.
4. [ ] Set the build variable **`PUBLIC_SITE_URL=https://<the domain>`**. This turns off pre-launch mode.
5. [ ] In Cloudflare, turn on **Always Use HTTPS**. Under AI Crawl Control / Bot settings, make sure OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User, Claude-User and Perplexity-User are not blocked (new zones may block AI crawlers by default, and Bot Fight Mode can too), and that Cloudflare's managed robots.txt does not replace the site's own.
6. [ ] Replace the Formspree placeholder `formEndpoint` in `store.ts`; until then the contact form does not send (this was already the case before).
7. [ ] After going live: Google Search Console and Bing Webmaster Tools (verify, then submit `/sitemap.xml`); Bing Places and Apple Business Connect; put each verified profile URL in `profiles` in `store.ts`.
8. [ ] Merge `seo/priority-1` into `main` after review. CI runs the tests and `npm run seo:check`.

### Environment variables (all optional; blank means the feature is off)

| Name | Where | Purpose |
|---|---|---|
| `PUBLIC_SITE_URL` | Cloudflare build env | **Required to go live.** The canonical origin, e.g. `https://www.example.com`. Unset = pre-launch mode (noindex everywhere, robots.txt blocks all) |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | build env | Search Console meta tag |
| `PUBLIC_BING_SITE_VERIFICATION` | build env | Bing Webmaster meta tag |
| `PUBLIC_FACEBOOK_DOMAIN_VERIFICATION` | build env | Meta domain verification |
| `PUBLIC_GTM_ID` / `PUBLIC_GA4_ID` / `PUBLIC_GOOGLE_ADS_ID` / `PUBLIC_GOOGLE_ADS_LABELS` / `PUBLIC_META_PIXEL_ID` | build env | Analytics (P2). With GTM set, the others are configured inside GTM, not loaded twice |
| `INDEXNOW_KEY`, `SEO_TASK_KEY` | `wrangler secret put` | IndexNow (P2) |
| `SEO_PREVIEW_DRAFTS=1` | local build only | Build draft pages, noindexed, for review |

## Files

### Created
- `SEO_PROGRESS.md`
- **Core libraries:** `site/src/lib/{seo,hours,routes,richtext,feeds,indexnow,analytics-config,track,referral}.ts`
- **Data:**
  - `site/src/data/{services,guides,catalog,crawlers,content-types}.ts`
  - `site/src/data/redirects.json`
- **Components:** `site/src/components/seo/{Analytics,ConsentBanner,Breadcrumbs,OpenStatus,Faq,Related,VisitUs,SiteFooter,ContentSections}.astro`
- **Middleware:** `site/src/middleware.ts`
- **Pages:**
  - `site/src/pages/[category]/[...slug].astro`
  - `about.astro`, `privacy.astro`, `404.astro`
  - `guides/index.astro`, `guides/[slug].astro`
  - `shop/index.astro`, `shop/[slug].astro`, `shop/category/[slug].astro`
  - `vi/[slug].astro`
- **Endpoints:**
  - `robots.txt.ts`, `sitemap.xml.ts`, `sitemap-[name].xml.ts`, `llms.txt.ts`
  - `feeds/google-merchant.xml.ts`, `indexnow.txt.ts`, `api/hours.ts`
- **Static files:** `site/public/_headers`, `site/public/images/{og-default,logo,apple-touch-icon}.png`, `site/public/images/products/business-cards.png`
- **Checks:** `site/scripts/seo-audit.mjs`, `site/tests/seo.test.ts`

### Modified
- `site/astro.config.mjs`: `site`, `build.format: 'file'`, the `_redirects` integration.
- `site/src/data/store.ts`:
  - New fields and helpers.
  - Name, phone and hours updated.
  - Service links now go to the new service pages.
- `site/stores/forsythe.json`: name, legal name, address and phone, matching `store.ts`.
- `site/src/layouts/Base.astro`:
  - SEO `<head>`, breadcrumbs, new footer, consent banner, tracking init, page language.
  - A duplicate service-worker registration line was removed.
- `site/src/pages/contact.astro`: rebuilt, with the same Formspree form.
- `site/src/pages/index.astro`: a local intro section and links to the hubs.
- Name updates ("Forsythe" → "Monroe"):
  - `site/src/pages/petership.astro`
  - `site/src/i18n/strings.ts`: `ps.lead` in all 14 languages.
  - `site/src/lib/cards.ts`: sample card details.
- `site/src/pages/cards/index.astro`: dropped "like Vistaprint" from the description.
- `site/src/styles/global.css`: an appended block for the new components.
- `site/src/env.d.ts`: new env types.
- `site/db/schema.sql`: four new tables.
- `site/src/shipping/store.ts`:
  - The four new tables, with D1 and memory branches.
  - Added to `EXPORT_TABLES`.
- `site/package.json`: the `seo:audit` script.
- `.github/workflows/ci.yml`: a step that runs `seo:audit`.

### Not changed on purpose
- Customer portal, staff counter pages, auth, Stripe, shipping engine, carrier providers, the D1 data of existing tables, `src/i18n/api.ts` and `public/openapi.json`. The developer docs still say "Forsythe" there, tied to the API spec test.

## How to resume in a new session

1. `cd site && npm ci && npm test && npm run seo:check`. All of them should pass. (`seo:check` builds once with a placeholder domain, because a build without `PUBLIC_SITE_URL` is in pre-launch mode, and then audits it.)
2. Read this file's "Remaining work" for the next authorized priority.
3. Keep the milestone process: when the priority is done, run the build, the tests and the audit, smoke-test with `npx astro preview`, update this file, make one commit per milestone, then stop for review. **Never deploy.**
