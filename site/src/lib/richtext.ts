// Tiny, safe formatter for the copy in src/content/*.ts. Text is HTML-escaped first, then:
//   [label](/path)   a link (site paths, https:// links, tel: and mailto:)
//   **bold**         strong text
//   {token}          a store fact, so copy never hard-codes hours, the phone number or the address
// Nothing else is interpreted, so content can never inject markup.
import type { StoreFacts } from '../data/store';
import { fmt12, hoursFor, daysOpen, latestWeekdayClose, groupHours } from './hours';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The facts a {token} can name. Unknown tokens are left as typed so a typo shows up on the page and in the SEO check. */
export function storeTokens(s: StoreFacts): Record<string, string> {
  const span = (day: Parameters<typeof hoursFor>[1]) => { const h = hoursFor(s.weeklyHours, day); return h ? `${fmt12(h.opens)} to ${fmt12(h.closes)}` : 'closed'; };
  const wkClose = latestWeekdayClose(s.weeklyHours);
  return {
    name: s.name,
    address: s.address,
    street: [s.street, s.suite].filter(Boolean).join(', '),
    city: s.city,
    phone: s.phone,
    weekdayHours: span('Monday'),
    weekdayClose: wkClose ? fmt12(wkClose) : 'closing time',
    saturdayHours: span('Saturday'),
    sundayHours: span('Sunday'),
    daysOpen: String(daysOpen(s.weeklyHours)),
    hoursSummary: groupHours(s.weeklyHours).map((g) => `${g.label}: ${g.text}`).join('; '),
    carriers: s.carriers.join(', ').replace(/, ([^,]*)$/, ' and $1'),
    tel: `tel:+1${s.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')}`,
    hoursSummaryVi: groupHours(s.weeklyHours).map((g) => `${viDays(g.label)}: ${g.opens ? `${viTime(g.opens)} đến ${viTime(g.closes!)}` : 'Đóng cửa'}`).join('. '),
  };
}

const VI_DAY: Record<string, string> = { Monday: 'Thứ Hai', Tuesday: 'Thứ Ba', Wednesday: 'Thứ Tư', Thursday: 'Thứ Năm', Friday: 'Thứ Sáu', Saturday: 'Thứ Bảy', Sunday: 'Chủ Nhật' };
const viDays = (label: string) => label.split(' to ').map((d) => VI_DAY[d] ?? d).join(' đến ');
/** "18:30" -> "6:30 chiều", "09:00" -> "9:00 sáng". */
const viTime = (t: string) => { const h = Number(t.slice(0, 2)); const h12 = h % 12 === 0 ? 12 : h % 12; return `${h12}:${t.slice(3, 5)} ${h < 12 ? 'sáng' : h < 18 ? 'chiều' : 'tối'}`; };

export function fillTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m));
}

const SAFE_HREF = /^(\/(?!\/)|https:\/\/|tel:|mailto:|#)/;
/** Rich text to HTML. Returns a string for set:html; everything in it was escaped above. */
export function richText(text: string, tokens: Record<string, string> = {}): string {
  let out = esc(fillTokens(text, tokens));
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const h = href === 'tel' ? (tokens.tel ?? '') : href.replace(/&amp;/g, '&');
    if (!SAFE_HREF.test(h)) return label;
    const ext = h.startsWith('https://');
    return `<a href="${esc(h)}"${ext ? ' rel="noopener"' : ''}${h.startsWith('tel:') ? ' data-track="phone_click"' : ''}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

/** Plain text (links reduced to their labels, bold markers dropped), for meta tags, JSON-LD and llms.txt. */
export function plainText(text: string, tokens: Record<string, string> = {}): string {
  return fillTokens(text, tokens).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
}

/** Internal links in a piece of rich text, for the broken-link check. */
export function linksIn(text: string): string[] {
  return [...text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((m) => m[1]);
}
