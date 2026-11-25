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
