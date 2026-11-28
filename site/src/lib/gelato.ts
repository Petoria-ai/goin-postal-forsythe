// Gelato's print API (Peter, Nov 25 2026: "its more about executing the job"). Sends an approved print order to
// Gelato and reads its status and tracking back. Three modes:
//   pretend: no Gelato key saved; nothing leaves the website (a made-up order number), for trying the whole flow.
//   draft:   a key is saved but real orders are switched off; Gelato receives the order as a draft (not printed,
//            not charged), so the connection can be tested for real.
//   live:    an owner switched real orders on (Counter → Print orders); Gelato prints, ships and bills.
// The key is pasted by an owner on Counter → Print orders (lib/serviceKeys.ts, service "gelato"; GELATO_API_KEY on
// the server wins). Gelato sends the key as "X-API-KEY". Their API docs: https://dashboard.gelato.com/docs/
// Addresses and fields follow Gelato's Order API v4; check them against Gelato's docs when the key arrives.
import { serviceKey } from './serviceKeys';
import { productById, gelatoUid, type Product } from './printProducts';
import { artUrl, type PrintOrder } from './printOrders';
import { store } from '../data/store';

export const GELATO_ORDERS = 'https://order.gelatoapis.com/v4/orders';
const memory = new Map<string, string>();
const kv = (env: Env) => env.ORDERS ?? ({ get: async (k: string) => memory.get(k) ?? null, put: async (k: string, v: string) => { memory.set(k, v); } } as unknown as KVNamespace);
const LIVE = 'gelato:live';

export async function gelatoMode(env: Env): Promise<'pretend' | 'draft' | 'live'> {
  if (!(await serviceKey(env, 'gelato'))) return 'pretend';
  return (await kv(env).get(LIVE)) === '1' ? 'live' : 'draft';
}
export async function setGelatoLive(env: Env, on: boolean) { await kv(env).put(LIVE, on ? '1' : '0'); }

const split = (name: string) => { const p = name.trim().split(/\s+/); return { firstName: p[0] ?? '', lastName: p.slice(1).join(' ') || '-' }; };

/** The order as Gelato's Order API wants it: one item per shirt size (or the one flat product), artwork by link. */
export async function gelatoBody(env: Env, o: PrintOrder, mode: 'draft' | 'live'): Promise<any> {
  const product = productById(o.product_id) as Product | null;
  if (!product) throw new Error(`The product "${o.product_name}" is no longer on sale; change it in src/data/printProducts.json.`);
  if (!product.gelato_uid) throw new Error(`"${product.name}" has no Gelato product code yet (gelato_uid in src/data/printProducts.json).`);
  const files = await Promise.all(o.art.map(async (a) => ({ type: product.kind === 'flat' ? 'default' : a.file, url: await artUrl(env, a.id) })));
  const items = product.kind === 'apparel'
    ? Object.entries(o.picks.sizes ?? {}).map(([size, qty], i) => ({ itemReferenceId: `${o.id}-${i + 1}`, productUid: gelatoUid(product, size, o.picks.color), files, quantity: qty }))
    : [{ itemReferenceId: `${o.id}-1`, productUid: gelatoUid(product, String(o.picks.size)), files, quantity: o.quantity }];
  const a = o.address;
  return {
    orderType: mode === 'live' ? 'order' : 'draft',
    orderReferenceId: o.id,
    customerReferenceId: o.customer_id,
    currency: 'USD',
    items,
    shippingAddress: { ...split(a.name), companyName: o.ship_to === 'store' ? store.name : undefined, addressLine1: a.line1, addressLine2: a.line2 || undefined, city: a.city, state: a.state, postCode: a.zip, country: 'US', email: o.customer.email, phone: o.customer.phone ?? undefined },
  };
}

export type SendResult = { ok: true; order_id: string; mode: 'pretend' | 'draft' | 'live' } | { ok: false; error: string; status?: number };

/** Sends an approved order to Gelato (or the pretend Gelato). */
export async function sendToGelato(env: Env, o: PrintOrder, f: typeof fetch = fetch): Promise<SendResult> {
  const mode = await gelatoMode(env);
  if (mode === 'pretend') return { ok: true, order_id: `PRETEND-${o.id}`, mode };
  let body: any;
  try { body = await gelatoBody(env, o, mode); } catch (e: any) { return { ok: false, error: e.message }; }
  const key = (await serviceKey(env, 'gelato'))!;
  let res: Response;
  try { res = await f(GELATO_ORDERS, { method: 'POST', headers: { 'X-API-KEY': key, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }); }
  catch (e: any) { return { ok: false, error: `Couldn't reach Gelato (${e?.message ?? 'network'})` }; }
  const j: any = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403) return { ok: false, error: 'Gelato refused the key. Check it on Counter → Print orders.', status: res.status };
  if (!res.ok || !j?.id) return { ok: false, error: String(j?.message ?? j?.error ?? `Gelato answered ${res.status}`).slice(0, 300), status: res.status };
  return { ok: true, order_id: String(j.id), mode };
}

/** Finds the first value for any of these keys anywhere in Gelato's answer (tracking sits on items or shipments). */
function dig(x: any, keys: string[]): string | null {
  if (!x || typeof x !== 'object') return null;
  for (const k of keys) if (typeof x[k] === 'string' && x[k]) return x[k];
  for (const v of Object.values(x)) { const r = dig(v, keys); if (r) return r; }
  return null;
}
/** Gelato's status word turned into ours. */
export function ourStatus(gelato: string | null | undefined): PrintOrder['status'] | null {
  const s = String(gelato ?? '').toLowerCase();
  if (!s) return null;
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('ship')) return 'shipped';
  if (s.includes('production') || s.includes('print') || s.includes('passed')) return 'in_production';
  return null;
}

/** Asks Gelato for an order's status and tracking (never trusting a webhook's body alone). */
export async function gelatoStatus(env: Env, gelatoOrderId: string, f: typeof fetch = fetch): Promise<{ ok: true; status: string | null; ours: PrintOrder['status'] | null; tracking: { code: string | null; url: string | null } } | { ok: false; error: string }> {
  if (gelatoOrderId.startsWith('PRETEND-')) return { ok: true, status: 'pretend', ours: null, tracking: { code: null, url: null } };
  const key = await serviceKey(env, 'gelato');
  if (!key) return { ok: false, error: 'No Gelato key saved.' };
  const res = await f(`${GELATO_ORDERS}/${encodeURIComponent(gelatoOrderId)}`, { headers: { 'X-API-KEY': key, Accept: 'application/json' } }).catch(() => null);
  if (!res?.ok) return { ok: false, error: `Gelato answered ${res?.status ?? 'nothing'}` };
  const j: any = await res.json().catch(() => null);
  const status = j?.fulfillmentStatus ?? j?.status ?? null;
  return { ok: true, status, ours: ourStatus(status), tracking: { code: dig(j, ['trackingCode', 'trackingNumber']), url: dig(j, ['trackingUrl']) } };
}

// ---- Gelato's product catalog (Peter, Nov 25 2026: "would it help if i attached gelato's api for you to see all of
// gelatos products in one spot?"). Read only: Gelato's Product API lists its catalogs (t-shirts, mugs, ...), each with
// the choices it has (size, color, ...) and the product codes we send with an order. The staff page asks for one
// catalog at a time (a Worker can only make so many calls per request) and saves the lot as a file to send Claude.
export const GELATO_PRODUCTS = 'https://product.gelatoapis.com/v3';
type Get = (url: string, init?: RequestInit) => Promise<any>;
/** Gelato said no: its status and the start of its answer (never the key), so the saved file says why. */
export class GelatoError extends Error { constructor(msg: string, public status: number | null) { super(msg); } }
function getter(key: string, f: typeof fetch): Get {
  return async (url, init) => {
    const headers: Record<string, string> = { 'X-API-KEY': key, Accept: 'application/json' };
    if (init?.body) headers['Content-Type'] = 'application/json';
    for (let i = 0; i < 3; i++) {
      let res: Response | null = null; let why = '';
      try { res = await f(url, { ...init, headers }); } catch (e: any) { why = String(e?.message ?? e).slice(0, 120); }
      if (res?.status === 429) { await new Promise((r) => setTimeout(r, 1200 * (i + 1))); continue; }
      if (!res) throw new GelatoError(`Gelato answered nothing${why ? ` (${why})` : ''}`, null);
      if (!res.ok) {
        const text = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
        throw new GelatoError(`Gelato answered ${res.status}${res.status === 401 || res.status === 403 ? ' (check the key)' : ''}${text ? `: ${text}` : ''}`, res.status);
      }
      return res.json();
    }
    throw new GelatoError('Gelato is busy (too many requests); try again in a minute.', 429);
  };
}
/** Gelato's catalogs: [{ uid, title }]. */
export async function gelatoCatalogs(key: string, f: typeof fetch = fetch): Promise<{ uid: string; title: string }[]> {
  const j = await getter(key, f)(`${GELATO_PRODUCTS}/catalogs`);
  const list: any[] = Array.isArray(j) ? j : j?.data ?? j?.catalogs ?? [];
  return list.map((c) => ({ uid: String(c.catalogUid ?? c.uid ?? ''), title: String(c.title ?? c.catalogUid ?? '') })).filter((c) => c.uid && !GELATO_SKIP.has(c.uid));
}
/** Gelato's lists come as an array, or as an object keyed by id ({ "white": { title: "White" } } or { "white": "White" }). */
function listOf(x: any, idField: string): any[] {
  if (Array.isArray(x)) return x;
  if (!x || typeof x !== 'object') return [];
  return Object.entries(x).map(([k, v]) => (v && typeof v === 'object' ? { [idField]: k, ...(v as object) } : { [idField]: k, title: String(v) }));
}
/** The searches behind "Find our products' codes": only the variants the print shop sells (printProducts.json), so
 *  the answer is small even where a catalog is huge (Gelato's t-shirts catalog has over 200,000 codes). */
export const OUR_SEARCHES: { name: string; catalog: string; filters: Record<string, string[]> }[] = [
  { name: 'Unisex classic crewneck t-shirt', catalog: 't-shirts', filters: {
    GarmentCut: ['unisex'], GarmentSubcategory: ['crewneck'], GarmentQuality: ['classic'], GarmentColor: ['white', 'black', 'navy', 'sports-grey'],
    GarmentSize: ['S', 'M', 'L', 'XL', '2XL', '3XL'], GarmentPrint: ['4-0', '0-4', '4-4'], ProductStatus: ['activated'] } },
  { name: 'Posters (200 gsm uncoated, portrait)', catalog: 'posters', filters: { UnifiedPaperType: ['200-gsm-80lb-uncoated'], Orientation: ['ver'], ProductStatus: ['activated'] } },
  { name: 'Flyers (letter and smaller, portrait)', catalog: 'flyers', filters: { PaperFormat: ['LT', 'SM', 'A5', 'A6', 'DL'], Orientation: ['ver'], ProductStatus: ['activated'] } },
];
/** Gelato's own catalogs that aren't products (they answer with a server error). */
export const GELATO_SKIP = new Set(['default', 'default-flat-prices', 'enterprise']);
/** One catalog: its choices (size, color, ...) and up to `max` products with their codes and choices. Never throws:
 *  what failed is in `errors` (Gelato's own words), and a page size Gelato refuses is retried smaller. */
export async function gelatoCatalog(key: string, uid: string, f: typeof fetch = fetch, max = 500, filters?: Record<string, string[]>) {
  const get = getter(key, f);
  const base = `${GELATO_PRODUCTS}/catalogs/${encodeURIComponent(uid)}`;
  const errors: string[] = [];
  let c: any = null;
  try { c = await get(base); } catch (e: any) { errors.push(`catalog: ${e.message}`); }
  let attributes: { uid: string; title: string; values: { uid: string; title: string }[] }[] = [];
  try { attributes = listOf(c?.productAttributes, 'productAttributeUid').map((a: any) => ({
    uid: String(a.productAttributeUid ?? ''), title: String(a.title ?? a.productAttributeUid ?? ''),
    values: listOf(a.values, 'productAttributeValueUid').map((v: any) => ({ uid: String(v.productAttributeValueUid ?? ''), title: String(v.title ?? v.productAttributeValueUid ?? '') })),
  })); } catch (e: any) { errors.push(`choices: ${e.message}`); }
  const products: { uid: string; attributes: Record<string, string> }[] = [];
  let hits: any = null; let limit = 100; let done = false;
  for (let offset = 0; offset < max && !done; ) {
    let page: any;
    try { page = await get(`${base}/products:search`, { method: 'POST', body: JSON.stringify(filters ? { attributeFilters: filters, limit, offset } : { limit, offset }) }); }
    catch (e: any) {
      if ((e as GelatoError).status === 400 || (e as GelatoError).status === 422) { if (limit > 25) { limit = limit === 100 ? 50 : 25; continue; } }
      errors.push(`products (limit ${limit}, offset ${offset}): ${e.message}`); break;
    }
    hits ??= page?.hits ?? null;
    const got: any[] = page?.products ?? [];
    for (const p of got) products.push({ uid: String(p.productUid ?? ''), attributes: p.attributes ?? {} });
    offset += limit; done = got.length < limit;
  }
  // If Gelato ignored the filters (a different field name), say so rather than pass off the wrong products.
  if (filters) {
    const off = products.filter((p) => Object.entries(filters).some(([k, vals]) => p.attributes[k] != null && !vals.includes(String(p.attributes[k]))));
    if (off.length) errors.push(`filters: ${off.length} of ${products.length} products don't match the filters (Gelato may not have applied them)`);
  }
  return { uid, title: String(c?.title ?? uid), attributes, raw_choices: c?.productAttributes ?? null, products, more: !done && products.length >= max, hits, errors };
}
