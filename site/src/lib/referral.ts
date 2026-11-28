// Where a visit came from, worked out from the referrer and the landing URL. GA4 already sorts
// search, paid, social and direct traffic into channels; what it does not do out of the box is name
// AI assistants, so this file does that and the tracker sends it as an `ai_referral` event plus an
// `ai_platform` parameter. Many AI visits arrive with no referrer at all (apps, copy-pasted links),
// so these numbers are a floor, not a full count.
export type Channel = 'ai' | 'organic' | 'paid' | 'social' | 'email' | 'referral' | 'direct';
export interface Referral { channel: Channel; platform: string }

const AI: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|(^|\.)openai\.com$/, 'ChatGPT'],
  [/(^|\.)claude\.ai$|(^|\.)anthropic\.com$/, 'Claude'],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, 'Gemini'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity'],
  [/(^|\.)copilot\.microsoft\.com$|(^|\.)copilot\.cloud\.microsoft$|(^|\.)edgeservices\.bing\.com$/, 'Microsoft Copilot'],
  [/(^|\.)meta\.ai$/, 'Meta AI'],
  [/(^|\.)grok\.com$|(^|\.)x\.ai$/, 'Grok'],
  [/(^|\.)you\.com$|(^|\.)phind\.com$|(^|\.)poe\.com$|(^|\.)deepseek\.com$|(^|\.)chat\.mistral\.ai$|(^|\.)duck\.ai$/, 'Other AI'],
];
const AI_UTM: [RegExp, string][] = [
  [/chatgpt|openai/i, 'ChatGPT'], [/claude|anthropic/i, 'Claude'], [/gemini|bard/i, 'Gemini'],
  [/perplexity/i, 'Perplexity'], [/copilot/i, 'Microsoft Copilot'],
];
const SEARCH: [RegExp, string][] = [
  [/(^|\.)google\.[a-z.]+$/, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yahoo\.com$/, 'Yahoo'], [/(^|\.)ecosia\.org$/, 'Ecosia'], [/(^|\.)search\.brave\.com$/, 'Brave'],
];
const SOCIAL: [RegExp, string][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)m\.facebook\.com$|(^|\.)l\.facebook\.com$/, 'Facebook'], [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/, 'X'], [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)nextdoor\.com$/, 'Nextdoor'], [/(^|\.)youtube\.com$/, 'YouTube'], [/(^|\.)tiktok\.com$/, 'TikTok'], [/(^|\.)reddit\.com$/, 'Reddit'],
];

const host = (u: string) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
const match = (h: string, list: [RegExp, string][]) => list.find(([re]) => re.test(h))?.[1];

export function classifyReferral(referrer: string, landingUrl: string, ownHost = ''): Referral {
  let params: URLSearchParams;
  try { params = new URL(landingUrl).searchParams; } catch { params = new URLSearchParams(); }
  const utmSource = params.get('utm_source') ?? '';
  const utmMedium = (params.get('utm_medium') ?? '').toLowerCase();
  const h = host(referrer);

  // AI first: ChatGPT tags its links with utm_source=chatgpt.com even when the referrer is stripped.
  const ai = match(h, AI) ?? match(utmSource.toLowerCase(), AI) ?? AI_UTM.find(([re]) => re.test(utmSource))?.[1];
  if (ai) return { channel: 'ai', platform: ai };

  // Google Gemini answers inside Google Search arrive as Google: they count as organic, not AI.
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid') || params.has('msclkid') || /^(cpc|ppc|paid|paidsearch|paid_social|paidsocial)$/.test(utmMedium)) {
    const p = params.has('msclkid') ? 'Microsoft Ads' : params.has('fbclid') || /facebook|instagram|meta/i.test(utmSource) ? 'Meta Ads' : params.has('gclid') || params.has('gbraid') || params.has('wbraid') || /google/i.test(utmSource) ? 'Google Ads' : utmSource || 'Paid';
    return { channel: 'paid', platform: p };
  }
  if (utmMedium === 'email' || /mail/i.test(utmSource)) return { channel: 'email', platform: utmSource || 'Email' };
  const search = match(h, SEARCH);
  if (search) return { channel: 'organic', platform: search };
  const social = match(h, SOCIAL) ?? (params.has('fbclid') ? 'Facebook' : undefined);
  if (social) return { channel: 'social', platform: social };
  if (h && h !== ownHost.toLowerCase()) return { channel: 'referral', platform: h };
  if (utmSource) return { channel: 'referral', platform: utmSource };
  return { channel: 'direct', platform: '(direct)' };
}

// ---- privacy ---------------------------------------------------------------------------------------
const PII_KEYS = /(^|_)(e-?mail|phone|tel|name|first|last|address|street|line_?\d|zip|postal|city|card|cc|cvv|ssn|dob|birth|password|pin|token|session|mailbox|box_?number|tracking|recipient|message|note)s?($|_)/i;
const SAFE_KEYS = /^(item_name|item_id|item_category|item_variant|item_list_name|form_name|link_text|page_name|service_name|carrier_name)$/;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
/** Only safe analytics parameters survive: no keys that name personal data, no values that look like an email or phone number, strings capped at 100 characters. */
export function scrubParams(params: Record<string, unknown> = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k) || (PII_KEYS.test(k) && !SAFE_KEYS.test(k))) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') { if (EMAIL.test(v) || PHONE.test(v)) continue; out[k] = v.slice(0, 100); }
  }
  return out;
}
