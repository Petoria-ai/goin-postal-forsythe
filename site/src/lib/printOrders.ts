// Print orders made by Gelato (Peter, Nov 25 2026): the order record, the customer's artwork, and the signed link
// Gelato downloads the artwork from. Kept in the ORDERS KV namespace like business card orders (memory on a dev
// server without one), with a list of all order numbers for the staff page and one per customer.
//
// The life of an order: awaiting_payment → paid (waiting for staff to approve) → sent (to Gelato) → in_production →
// shipped (tracking) → delivered; or cancelled. Nothing goes to Gelato until staff approve it.
import type { Picks, Line } from './printProducts';

export type PrintStatus = 'awaiting_payment' | 'paid' | 'sent' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
export interface PrintOrder {
  id: string;                 // PO-XXXXXX
  created_at: string;
  status: PrintStatus;
  customer_id: string;
  customer: { name: string; email: string; phone: string | null };
  product_id: string;
  product_name: string;
  picks: Picks;
  lines: Line[];
  quantity: number;
  subtotal: number;
  shipping: number;
  tax?: { percent: number; amount: number };
  fee?: { percent: number; flat: number; amount: number };
  total: number;
  cost_estimate: number;      // the owners' estimate of Gelato's price (staff page only)
  ship_to: 'store' | 'home';
  address: { name: string; line1: string; line2?: string; city: string; state: string; zip: string };
  art: { file: string; id: string; w: number; h: number; type: string }[]; // one per printed side (or the flat page)
  notes: string;
  paid_at?: string;
  stripe_session_id?: string;
  approved_by?: string;
  approved_at?: string;
  gelato?: { order_id: string; mode: 'draft' | 'live' | 'pretend'; status?: string; sent_at: string };
  tracking?: { code: string | null; url: string | null };
  history: { at: string; what: string; by?: string }[];
}

const memory = new Map<string, string>();
const kv = (env: Env) => env.ORDERS ?? ({ get: async (k: string, t?: string) => { const v = memory.get(k) ?? null; return v && t === 'arrayBuffer' ? Uint8Array.from(atob(v), (c) => c.charCodeAt(0)).buffer : v; }, put: async (k: string, v: string | ArrayBuffer) => { memory.set(k, typeof v === 'string' ? v : btoa(String.fromCharCode(...new Uint8Array(v)))); } } as unknown as KVNamespace);
const KEEP = { expirationTtl: 60 * 60 * 24 * 365 };
const KEY = (id: string) => `print:${id}`;
const ALL = 'printorders:all';
const MINE = (c: string) => `printsof:${c}`;
const ART = (id: string) => `printart:${id}`;
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rand = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => alphabet[x % alphabet.length]).join('');
export const newPrintId = () => `PO-${rand(6)}`;

export async function savePrintOrder(env: Env, o: PrintOrder) {
  await kv(env).put(KEY(o.id), JSON.stringify(o), KEEP);
}
export async function getPrintOrder(env: Env, id: string): Promise<PrintOrder | null> {
  const raw = await kv(env).get(KEY(String(id).toUpperCase()));
  return raw ? JSON.parse(raw) : null;
}
/** Adds a new order to the staff list and the customer's own list (newest first). */
export async function indexPrintOrder(env: Env, o: PrintOrder) {
  for (const k of [ALL, MINE(o.customer_id)]) {
    const ids: string[] = JSON.parse((await kv(env).get(k)) ?? '[]');
    if (!ids.includes(o.id)) ids.unshift(o.id);
    await kv(env).put(k, JSON.stringify(ids.slice(0, k === ALL ? 1000 : 100)), KEEP);
  }
}
export async function listPrintOrders(env: Env, customerId?: string, limit = 200): Promise<PrintOrder[]> {
  const ids: string[] = JSON.parse((await kv(env).get(customerId ? MINE(customerId) : ALL)) ?? '[]');
  const all = await Promise.all(ids.slice(0, limit).map((id) => getPrintOrder(env, id)));
  return all.filter((o): o is PrintOrder => !!o && (!customerId || o.customer_id === customerId));
}
export async function updatePrintOrder(env: Env, id: string, change: Partial<PrintOrder>, what: string, by?: string): Promise<PrintOrder | null> {
  const o = await getPrintOrder(env, id);
  if (!o) return null;
  const next = { ...o, ...change, history: [...o.history, { at: new Date().toISOString(), what, by }].slice(-50) };
  await savePrintOrder(env, next);
  return next;
}

// ---- artwork -------------------------------------------------------------------------------------------------
const MAX_ART = 20_000_000;
/** Reads a PNG or JPEG data URL: its bytes, type and pixel size (from the file header; nothing is decoded). */
export function readArt(dataUrl: string): { bytes: Uint8Array; type: string; w: number; h: number } {
  const m = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error('The artwork must be a PNG or JPEG picture.');
  const bin = atob(m[2]);
  if (bin.length > MAX_ART) throw new Error('That picture is too big (20 MB at most).');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const size = m[1] === 'image/png' ? pngSize(bytes) : jpegSize(bytes);
  if (!size) throw new Error('That picture could not be read. Try saving it again as PNG or JPEG.');
  return { bytes, type: m[1], ...size };
}
function pngSize(b: Uint8Array) {
  if (b.length < 24 || b[0] !== 0x89 || b[1] !== 0x50) return null;
  const v = new DataView(b.buffer, b.byteOffset); return { w: v.getUint32(16), h: v.getUint32(20) };
}
function jpegSize(b: Uint8Array) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1]; const len = (b[i + 2] << 8) | b[i + 3];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    i += 2 + len;
  }
  return null;
}
export async function saveArt(env: Env, bytes: Uint8Array, type: string): Promise<string> {
  const id = rand(20);
  await kv(env).put(ART(id), bytes.buffer as ArrayBuffer, { ...KEEP, metadata: { type } } as any);
  await kv(env).put(`${ART(id)}:type`, type, KEEP);
  return id;
}
export async function loadArt(env: Env, id: string): Promise<{ bytes: ArrayBuffer; type: string } | null> {
  if (!/^[A-Z2-9]{20}$/.test(id)) return null;
  const bytes = await kv(env).get(ART(id), 'arrayBuffer');
  const type = await kv(env).get(`${ART(id)}:type`);
  return bytes && type ? { bytes, type } : null;
}

// ---- the signed link Gelato downloads the artwork from ---------------------------------------------------------
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
async function sign(env: Env, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`print-art:${env.SESSION_SECRET || `dev-only-${env.SITE_URL ?? ''}`}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))).slice(0, 32);
}
/** A link only someone given it can open (the artwork's id plus a signature); Gelato downloads the file from it. */
export async function artUrl(env: Env, id: string) {
  return `${env.SITE_URL}/api/print-file?a=${id}&s=${await sign(env, id)}`;
}
export async function artSignatureOk(env: Env, id: string, s: string) {
  return s.length === 32 && s === (await sign(env, id));
}
