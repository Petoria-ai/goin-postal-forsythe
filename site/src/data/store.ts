// Single place for store facts. The values below are the first store (1800 Forsythe Ave, Monroe). A
// second store runs the same code with its own facts: a JSON file in site/stores/<slug>.json, set on
// that store's deployment as the STORE_JSON secret (scripts/new-store.py prints the commands). Anything
// the JSON leaves out keeps the default below, so a new store only has to say what differs.
//
// Everything public about the business reads from here: the header, footer, contact and about pages,
// every service page, the JSON-LD structured data, llms.txt, the open-now badge and the shipping labels.
// Change a fact here once and it changes everywhere on the next build.
//
// Rules for this file (SEO and honesty):
// - Only verified facts. Leave a field blank ('' or null) until an owner confirms it; blank fields are
//   left out of the page and the structured data rather than guessed.
// - Profile links (Google, Bing, Apple, Yelp, BBB ...) go in `profiles` only once the listing exists and
//   is claimed. A blank profile is never published.
// Items marked TODO are for the owners to confirm.
import { env as cfEnv } from 'cloudflare:workers';
import { displayRows, type DayHours, type SpecialHours } from '../lib/hours';

export interface StoreProfiles {
  facebook?: string;
  googleBusiness?: string;     // the Google Maps / Business Profile share link
  googleReview?: string;       // the "write a review" link from the Business Profile
  bingPlaces?: string;
  appleBusiness?: string;      // the Apple Maps place link
  yelp?: string;
  bbb?: string;
  instagram?: string;
  nextdoor?: string;
  upsLocator?: string;         // the store's own page on a carrier's location finder, once it exists
  fedexLocator?: string;
  dhlLocator?: string;
  anytimeMailbox?: string;     // the store's sign-up page on Anytime Mailbox (virtual mailboxes)
  other?: { name: string; url: string }[];
}

export interface StoreFacts {
  id: string;                 // short slug, used in logs and the Z-report: forsythe, west-carroll
  name: string;               // the public business name, exactly as on the Google Business Profile
  legalName?: string;         // the company that runs the store
  address: string;            // one line, for labels and running text
  street: string; suite?: string; city: string; region: string; postalCode: string; country: string;
  phone: string;              // display form: 318-570-2132
  email: string;
  timezone: string;           // IANA zone for hours and the open-now badge
  geo?: { lat: number; lng: number } | null; // null until checked against the Google Business Profile pin
  origin: { contact_name: string; company_name: string; contact_phone: string; contact_email: string; line_1: string; line_2?: string; city: string; state: string; postal_code: string; country_alpha2: string };
  formEndpoint: string;
  reviewUrl?: string;         // the Google Business Profile review link (issue 7); the delivered email asks for a review when set
  /** The weekly table every hours display is built from. A day left out is closed. */
  weeklyHours: DayHours[];
  /** Holidays and one-off closures, YYYY-MM-DD. Staff can add live ones at /counter/seo too. */
  specialHours: SpecialHours[];
  /** Older display rows, derived from weeklyHours. Kept so existing pages and the API keep their shape. */
  hours: { days: string; key: string; open: string; openKey?: string }[];
  services: { key: string; name: string; blurb: string; link?: string }[];
  /** Places the store genuinely serves, nearest first. Used in copy and as schema.org areaServed. */
  serviceArea: string[];
  carriers: string[];         // carriers customers can ship with at the counter
  paymentAccepted?: string;   // e.g. "Cash, Credit Card" once confirmed; blank leaves it out
  priceRange?: string;        // e.g. "$$" once the owners choose; blank leaves it out
  profiles: StoreProfiles;
  logo: string;               // site-relative path to the logo used in structured data
  /** Customers can buy shipping labels online (PeterShip at /ship). While false, the marketing pages do not
   *  promote online shipping, and /ship, /petership and /developers are kept out of search engines. The
   *  pages themselves still work; hiding them from the menu is a separate decision. */
  onlineShipping: boolean;
  // Other stores the same owner runs, each on its own deployment (T8). The counter pages show a switcher when this is set (T23).
  siblings?: { id: string; name: string; url: string }[];
}

// The Business Profile's "Get more reviews" link (Peter, Nov 28 2026). Used by the delivered email and the Contact page.
const GOOGLE_REVIEW = 'https://g.page/r/CV0Xlec-7zHFEAI/review';

const weeklyHours: DayHours[] = [
  { day: 'Monday', opens: '09:00', closes: '18:30' },
  { day: 'Tuesday', opens: '09:00', closes: '18:30' },
  { day: 'Wednesday', opens: '09:00', closes: '18:30' },
  { day: 'Thursday', opens: '09:00', closes: '18:30' },
  { day: 'Friday', opens: '09:00', closes: '18:30' },
  { day: 'Saturday', opens: '09:00', closes: '15:00' },
  { day: 'Sunday', opens: '10:00', closes: '15:00' },
];

export const defaults: StoreFacts = {
  id: 'forsythe',
  name: "Goin' Postal Monroe",
  legalName: 'Holsom Postal LLC', // the registered spelling, confirmed by Peter on Nov 28 2026
  address: '1800 Forsythe Ave, Suite 2, Monroe, LA 71201',
  street: '1800 Forsythe Ave',
  suite: 'Suite 2',
  city: 'Monroe',
  region: 'LA',
  postalCode: '71201',
  country: 'US',
  phone: '318-570-2132',
  email: 'wbp93623@gmail.com',
  timezone: 'America/Chicago',
  geo: null, // TODO: copy the exact pin from the Google Business Profile before turning this on
  // Ship-from address printed on labels.
  origin: {
    contact_name: "Goin' Postal Monroe",
    company_name: "Goin' Postal Monroe",
    contact_phone: '+13185702132',
    contact_email: 'wbp93623@gmail.com',
    line_1: '1800 Forsythe Ave Ste 2',
    city: 'Monroe',
    state: 'LA',
    postal_code: '71201',
    country_alpha2: 'US',
  },
  formEndpoint: 'https://formspree.io/f/REPLACE_ME', // TODO: create a Formspree form and paste its ID
  reviewUrl: GOOGLE_REVIEW, // the delivered email asks for a review with this link (issue 7)
  weeklyHours,
  // Example: { date: '2026-12-25', closed: true, label: 'Christmas Day' }. Add only dates the owners have decided.
  specialHours: [],
  hours: displayRows(weeklyHours),
  services: [
    { key: 'ship', name: 'Shipping', blurb: 'UPS, FedEx, USPS and DHL under one roof. We compare rates so you pay the least.', link: '/shipping' },
    { key: 'pack', name: 'Packing', blurb: 'Bring it in loose. We box, cushion and label it so it arrives in one piece.', link: '/shipping/packing' },
    { key: 'returns', name: 'Returns drop-off', blurb: 'Amazon, UPS, FedEx and USPS returns. We print the label from your phone, box it, and scan it in so you have proof.', link: '/shipping/returns' },
    { key: 'mailbox', name: 'Mailbox rental', blurb: 'A real street address and package acceptance from every carrier. Sign up at the counter with two IDs.', link: '/mailboxes' },
    { key: 'print', name: 'Printing and copies', blurb: 'Flyers, banners and everyday copies, often same day. Design your own business cards online.', link: '/business-services/printing' },
    { key: 'notary', name: 'Notary', blurb: 'Notary on call. Phone ahead and we will have one here when you arrive.', link: '/business-services/notary' },
    { key: 'shred', name: 'Shredding', blurb: 'Drop off a bag or a box. Secure, by the pound.', link: '/business-services/shredding' },
  ],
  serviceArea: ['Monroe', 'West Monroe', 'Ouachita Parish', 'Sterlington', 'Bastrop', 'Northeast Louisiana'],
  carriers: ['UPS', 'FedEx', 'USPS', 'DHL'],
  paymentAccepted: '', // TODO: confirm (cash, cards, ...) before it is published
  priceRange: '',
  profiles: {
    facebook: 'https://www.facebook.com/monroegoinpostal/',
    // Fill in only after each listing is claimed and verified. Blank ones are never shown.
    googleBusiness: 'https://share.google/WSq90cS7IAT59Xtjm', // the Business Profile share link Peter sent, Nov 28 2026
    googleReview: GOOGLE_REVIEW, bingPlaces: '', appleBusiness: '', yelp: '', bbb: '',
    instagram: '', nextdoor: '', upsLocator: '', fedexLocator: '', dhlLocator: '',
    anytimeMailbox: 'https://www.anytimemailbox.com/s/monroe-1800-forsythe-avenue', // the store's location page, set up by Peter (Nov 28 2026)
    other: [{ name: "Goin' Postal store page", url: 'https://goinpostal.com/store/GP490.1' }], // the franchise's page for this store, from Peter Nov 28 2026
  },
  logo: '/images/logo.png',
  // Off until the e-commerce and mailbox side is stable (Peter, Nov 28 2026). Flip to true to promote online shipping again.
  onlineShipping: false,
};

/** The defaults with a store's own facts laid over them. Top-level fields replace; `origin` and `profiles` merge field by field; lists replace whole. */
export function mergeStore(base: StoreFacts, over: Partial<StoreFacts> | null | undefined): StoreFacts {
  if (!over || typeof over !== 'object') return base;
  const merged: StoreFacts = { ...base, ...over, origin: { ...base.origin, ...(over.origin ?? {}) }, profiles: { ...base.profiles, ...(over.profiles ?? {}) } };
  // A store that gives its own weekly table but not the old display rows gets rows built from its table.
  if (over.weeklyHours && !over.hours) merged.hours = displayRows(over.weeklyHours);
  return merged;
}

function overrideFromEnv(): Partial<StoreFacts> | null {
  try {
    const raw = (cfEnv as unknown as { STORE_JSON?: string } | undefined)?.STORE_JSON;
    return raw ? (JSON.parse(raw) as Partial<StoreFacts>) : null;
  } catch (e) {
    console.error('STORE_JSON is not valid JSON; using the default store facts', e);
    return null;
  }
}

export const store: StoreFacts = mergeStore(defaults, overrideFromEnv());

/** Digits-only phone for tel: links, with the country code. */
export const telHref = (s: StoreFacts = store) => `tel:+1${s.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')}`;
/** A Google Maps directions link to the store (works on phones and opens Apple Maps on iOS if the visitor chooses). */
export const directionsUrl = (s: StoreFacts = store) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.name}, ${s.address}`)}`;
/** The verified profile links only, in a stable order, for sameAs and the footer. */
export function verifiedProfiles(s: StoreFacts = store): { name: string; url: string }[] {
  const p = s.profiles;
  const named: [string, string | undefined][] = [
    ['Facebook', p.facebook], ['Google Maps', p.googleBusiness], ['Bing Places', p.bingPlaces], ['Apple Maps', p.appleBusiness],
    ['Yelp', p.yelp], ['Better Business Bureau', p.bbb], ['Instagram', p.instagram], ['Nextdoor', p.nextdoor],
    ['UPS location page', p.upsLocator], ['FedEx location page', p.fedexLocator], ['DHL location page', p.dhlLocator],
  ];
  return [...named.filter(([, u]) => !!u && /^https:\/\//.test(u!)).map(([name, url]) => ({ name, url: url! })), ...(p.other ?? []).filter((o) => /^https:\/\//.test(o.url))];
}
