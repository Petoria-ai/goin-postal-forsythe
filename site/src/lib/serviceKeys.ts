// API keys for outside services, typed in on the website by an owner (Peter, Nov 19 2026): "its better to be able
// to attach on the website", so a new owner can paste their own key without a Cloudflare login.
// The key is encrypted (AES-GCM, a key made from the DOCS_KEY secret, like mailbox documents) before it is stored in
// the ORDERS KV namespace, never in D1, so /counter/export and the audit log never see it. It is write-only: the
// pages only ever get the last four characters. A key set on the server (e.g. ANYTIME_API_KEY in Cloudflare or
// .dev.vars) is used first.

const memory = new Map<string, string>();
const kv = (env: Env) => env.ORDERS ?? ({ get: async (k: string) => memory.get(k) ?? null, put: async (k: string, v: string) => { memory.set(k, v); }, delete: async (k: string) => { memory.delete(k); } } as unknown as KVNamespace);
const KV_KEY = (service: string) => `servicekey:${service}`;
const isLocal = (env: Env) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(env.SITE_URL ?? '');

/** The server setting that overrides the website key, e.g. "anytime" → ANYTIME_API_KEY. */
export const envName = (service: string) => `${service.toUpperCase()}_API_KEY`;
/** True when keys can be saved on the website: DOCS_KEY is set, or this is the local dev server. */
export const keysReady = (env: Env) => !!env.DOCS_KEY || isLocal(env);

async function lockKey(env: Env): Promise<CryptoKey> {
  const secret = env.DOCS_KEY || (isLocal(env) ? 'local-dev-only-documents-key' : undefined);
  if (!secret) throw new Error('Keys can\'t be saved on the live site until DOCS_KEY is set (ask William).');
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`gp-service-keys:${secret}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

type Stored = { iv: string; data: string; last4: string; at: string; by: string };
export type KeyInfo = { source: 'server' | 'site' | null; last4: string | null; at: string | null; by: string | null };

/** Checks a pasted key: one piece of text with no spaces, 8 to 500 characters. */
export function cleanKey(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return /^\S{8,500}$/.test(s) ? s : null;
}

export async function saveServiceKey(env: Env, service: string, key: string, by: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await lockKey(env), new TextEncoder().encode(key)));
  const row: Stored = { iv: b64(iv), data: b64(sealed), last4: key.slice(-4), at: new Date().toISOString(), by };
  await kv(env).put(KV_KEY(service), JSON.stringify(row));
}
export const removeServiceKey = (env: Env, service: string) => kv(env).delete(KV_KEY(service));

async function stored(env: Env, service: string): Promise<Stored | null> {
  const s = await kv(env).get(KV_KEY(service));
  try { return s ? JSON.parse(s) : null; } catch { return null; }
}
const fromServer = (env: Env, service: string): string | undefined => ((env as any)[envName(service)] || undefined);

/** What the pages may know about a key: where it's from and its last four characters. Never the key. */
export async function serviceKeyInfo(env: Env, service: string): Promise<KeyInfo> {
  const server = fromServer(env, service);
  if (server) return { source: 'server', last4: server.slice(-4), at: null, by: null };
  const s = await stored(env, service);
  return s ? { source: 'site', last4: s.last4, at: s.at, by: s.by } : { source: null, last4: null, at: null, by: null };
}

/** The key itself, for calling the service's API (server code only; never send it to a page). */
export async function serviceKey(env: Env, service: string): Promise<string | null> {
  const server = fromServer(env, service);
  if (server) return server;
  const s = await stored(env, service);
  if (!s) return null;
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv) }, await lockKey(env), unb64(s.data));
  return new TextDecoder().decode(plain);
}

/** Raw stored text (tests use this to check the key is not stored in the clear). */
export const storedServiceKey = async (env: Env, service: string) => kv(env).get(KV_KEY(service));
