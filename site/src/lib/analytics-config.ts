// Tracking and verification IDs, from build-time environment variables (Cloudflare build settings
// or a local .env). Every ID is optional: with none set, the site loads no tracking script at all.
// IDs are public by nature (they appear in page source), so PUBLIC_ variables are correct here;
// API secrets never go in these.
//
// One installation each, never two: when a Google Tag Manager container is set, GA4, Google Ads and
// the Meta Pixel are expected to be configured inside GTM and are NOT also loaded directly.
const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>;
const clean = (v: string | undefined, re: RegExp) => (v && re.test(v.trim()) ? v.trim() : '');

export const analytics = {
  gtm: clean(env.PUBLIC_GTM_ID, /^GTM-[A-Z0-9]+$/),
  ga4: clean(env.PUBLIC_GA4_ID, /^G-[A-Z0-9]+$/),
  googleAds: clean(env.PUBLIC_GOOGLE_ADS_ID, /^AW-\d+$/),
  // Conversion labels for Google Ads, as event=label pairs: "generate_lead=AbC123,purchase=XyZ789"
  googleAdsLabels: Object.fromEntries((env.PUBLIC_GOOGLE_ADS_LABELS ?? '').split(',').map((p) => p.split('=').map((x) => x.trim())).filter((p) => p.length === 2 && /^[\w-]+$/.test(p[0]) && /^[\w-]+$/.test(p[1]))) as Record<string, string>,
  metaPixel: clean(env.PUBLIC_META_PIXEL_ID, /^\d{6,20}$/),
};
export const verification = {
  google: clean(env.PUBLIC_GOOGLE_SITE_VERIFICATION, /^[\w-]{10,100}$/),
  bing: clean(env.PUBLIC_BING_SITE_VERIFICATION, /^[A-F0-9]{16,64}$/i),
  facebook: clean(env.PUBLIC_FACEBOOK_DOMAIN_VERIFICATION, /^[a-z0-9]{10,64}$/i),
};
export const anyTracking = () => !!(analytics.gtm || analytics.ga4 || analytics.googleAds || analytics.metaPixel);
