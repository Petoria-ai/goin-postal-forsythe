// Browser-side conversion tracking. One function, track(), that every page uses; it pushes to the
// GTM dataLayer, GA4/Google Ads (gtag) and the Meta Pixel when each is loaded, and does nothing when
// none are. Parameters pass through scrubParams() first, so personal data (names, emails, phone
// numbers, addresses, mailbox numbers, tracking numbers) can never reach an analytics platform.
//
// Automatic events (no page code needed):
//   phone_click        any tel: link
//   directions_click   any link with data-track="directions_click" or to Google/Apple Maps
//   social_click       links to the store's social profiles (data-track="social_click")
//   [data-track]       any element with data-track="event_name" (and data-track-* params) on click
//   form[data-track-submit="event_name"]   on submit
//   ai_referral        once per session, when the visit came from an AI assistant
import { classifyReferral, scrubParams } from './referral';

type Params = Record<string, unknown>;
interface Cfg { gtm: string; ga4: string; ads: string; labels: Record<string, string>; pixel: string }
const w = window as any;
const cfg = (): Cfg => w.__gpAnalytics ?? { gtm: '', ga4: '', ads: '', labels: {}, pixel: '' };

const META: Record<string, string> = { phone_click: 'Contact', directions_click: 'FindLocation', generate_lead: 'Lead', quote_request: 'Lead', view_item: 'ViewContent', customize_start: 'CustomizeProduct', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', mailbox_inquiry: 'Contact' };

const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} } };
const session = { get: (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch {} } };

export function track(event: string, params: Params = {}) {
  if (!/^[a-z][a-z0-9_]{1,39}$/.test(event)) return;
  const p = scrubParams(params);
  // A purchase is counted once, even if the thank-you page is reloaded.
  if (event === 'purchase' && p.transaction_id) {
    const seen = (store.get('gp-tx') ?? '').split(',');
    if (seen.includes(String(p.transaction_id))) return;
    store.set('gp-tx', [...seen.slice(-20), String(p.transaction_id)].join(','));
  }
  const c = cfg();
  w.dataLayer = w.dataLayer || [];
  if (c.gtm) { w.dataLayer.push({ event, ...p }); return; } // GTM routes it to GA4, Ads and Meta: no second copy
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, p);
    const label = c.labels[event];
    if (c.ads && label) w.gtag('event', 'conversion', { send_to: `${c.ads}/${label}`, value: p.value, currency: p.currency, transaction_id: p.transaction_id });
  }
  if (typeof w.fbq === 'function' && META[event]) {
    const std = ['Contact', 'FindLocation', 'Lead', 'ViewContent', 'CustomizeProduct', 'AddToCart', 'InitiateCheckout', 'Purchase'].includes(META[event]);
    w.fbq(std ? 'track' : 'trackCustom', META[event], { value: p.value, currency: p.currency, content_name: p.item_name, content_ids: p.item_id ? [p.item_id] : undefined }, p.transaction_id ? { eventID: String(p.transaction_id) } : undefined);
  }
}

const MAPS = /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.apple\.com)/;
export function initTracking() {
  if (w.__gpTrackInit) return;
  w.__gpTrackInit = true;

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-track]');
    if (!el) return;
    const params: Params = { page_path: location.pathname };
    for (const [k, v] of Object.entries(el.dataset)) if (k.startsWith('track') && k !== 'track') params[k.slice(5).replace(/^./, (c) => c.toLowerCase()).replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())] = v;
    const href = el.getAttribute('href') ?? '';
    if (el.dataset.track) { track(el.dataset.track, { ...params, link_text: (el.textContent ?? '').trim().slice(0, 60) }); return; }
    if (href.startsWith('tel:')) track('phone_click', params);
    else if (MAPS.test(href)) track('directions_click', params);
  }, { capture: true });

  document.addEventListener('submit', (e) => {
    const f = e.target as HTMLFormElement;
    const ev = f?.dataset?.trackSubmit;
    if (ev) track(ev, { page_path: location.pathname, form_name: f.dataset.trackForm ?? f.id ?? '' });
  }, { capture: true });

  // AI referral, once per session.
  if (!session.get('gp-ref')) {
    const r = classifyReferral(document.referrer, location.href, location.hostname);
    session.set('gp-ref', `${r.channel}:${r.platform}`);
    if (r.channel === 'ai') track('ai_referral', { ai_platform: r.platform, landing_page: location.pathname });
  }
}

// ---- consent ---------------------------------------------------------------------------------------
export type Consent = 'granted' | 'denied';
export const consentChoice = (): Consent | null => { const v = store.get('gp-consent'); return v === 'granted' || v === 'denied' ? v : null; };
export const gpcOn = () => !!(navigator as any).globalPrivacyControl;
export function setConsent(v: Consent) {
  store.set('gp-consent', v);
  const state = v === 'granted' ? 'granted' : 'denied';
  if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: state, ad_storage: state, ad_user_data: state, ad_personalization: state });
  if (typeof w.fbq === 'function') w.fbq('consent', v === 'granted' ? 'grant' : 'revoke');
  document.dispatchEvent(new CustomEvent('gp-consent', { detail: v }));
}
