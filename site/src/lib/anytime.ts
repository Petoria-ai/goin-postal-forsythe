// Anytime Mailbox's operator API, read only (Peter, Nov 19 2026; docs screenshots of List Renters).
// Base https://connect.anytimemailbox.com/v1, "Authorization: Bearer <key>". List Renters pages with limit (1-100)
// and starting_after (the id of the last renter), filters by status (active, inactive, deleted; comma-separated),
// and answers { success, data: { has_more, renters: [{ id, first_name, last_name, company, phone, email, status,
// mailboxes: [{ id, name, assigned }] }] } }. Only renterAction() changes anything there (Deactivate / Delete Renter,
// owner or manager in api/virtual.ts, typed confirmation).

export type Renter = { id: number; name: string; company: string; email: string | null; phone: string | null; status: string; mailboxes: string[] };
export type ApiFail = { ok: false; result: 'rejected' | 'not_found' | 'error'; status?: number; message?: string };

const MAX_PAGES = 50; // 5,000 renters; far more than one store has

function toRenter(r: any): Renter {
  return {
    id: Number(r?.id),
    name: `${r?.first_name ?? ''} ${r?.last_name ?? ''}`.trim().replace(/\s+/g, ' '),
    company: String(r?.company ?? '').trim(),
    email: String(r?.email ?? '').trim() || null,
    phone: String(r?.phone ?? '').trim() || null,
    status: String(r?.status ?? ''),
    mailboxes: Array.isArray(r?.mailboxes) ? r.mailboxes.map((m: any) => String(m?.name ?? '').trim()).filter(Boolean) : [],
  };
}

async function page(base: string, path: string, key: string, q: Record<string, string>, f: typeof fetch) {
  const url = `${base.replace(/\/$/, '')}${path}?${new URLSearchParams(q)}`;
  let res: Response;
  try { res = await f(url, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' } }); }
  catch (e: any) { return { ok: false, result: 'error', message: `Couldn't reach Anytime Mailbox (${e?.message ?? 'network'})` } as ApiFail; }
  if (res.status === 401 || res.status === 403) return { ok: false, result: 'rejected', status: res.status } as ApiFail;
  if (res.status === 404) return { ok: false, result: 'not_found', status: 404 } as ApiFail;
  const j: any = await res.json().catch(() => null);
  if (!res.ok || !j?.success || !Array.isArray(j?.data?.renters)) return { ok: false, result: 'error', status: res.status, message: String(j?.error?.message ?? j?.message ?? '').slice(0, 200) || undefined } as ApiFail;
  return { ok: true as const, has_more: !!j.data.has_more, renters: (j.data.renters as any[]).map(toRenter) };
}

/** One renter, to check the key works. */
export async function testKey(base: string, path: string, key: string, f: typeof fetch = fetch) {
  const r = await page(base, path, key, { limit: '1' }, f);
  return r.ok ? { ok: true as const, any: r.renters.length > 0 } : r;
}

/** Every active and inactive renter, page by page. */
export async function listRenters(base: string, path: string, key: string, f: typeof fetch = fetch): Promise<{ ok: true; renters: Renter[] } | ApiFail> {
  const all: Renter[] = [];
  let after: number | null = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const q: Record<string, string> = { status: 'active,inactive', limit: '100' };
    if (after !== null) q.starting_after = String(after);
    const r = await page(base, path, key, q, f);
    if (!r.ok) return r;
    all.push(...r.renters);
    if (!r.has_more || !r.renters.length) break;
    after = r.renters[r.renters.length - 1].id;
  }
  return { ok: true, renters: all };
}

const digits = (p: string | null) => (p ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const same = (a: string | null, b: string | null) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();

export type Local = { id: number; vno: string; name: string; email: string | null; phone: string | null; names: string[]; status: string };
export type SyncRow =
  | { kind: 'new'; vno: string; renter: Renter }
  | { kind: 'diff'; vno: string; renter: Renter; local: Local; fields: ('name' | 'email' | 'phone')[] }
  | { kind: 'inactive'; vno: string; renter: Renter; local: Local }
  | { kind: 'reopen'; vno: string; renter: Renter; local: Local }
  | { kind: 'missing'; vno: string; local: Local };

/** Compares Anytime Mailbox's renters with the hand-kept list, by mailbox name (our "Anytime Mailbox #"). */
export function compare(renters: Renter[], locals: Local[]): { rows: SyncRow[]; matched: number } {
  const byVno = new Map(locals.map((l) => [l.vno.toLowerCase(), l]));
  const seen = new Set<string>();
  const rows: SyncRow[] = [];
  let matched = 0;
  for (const r of renters) {
    for (const vno of r.mailboxes) {
      const k = vno.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const l = byVno.get(k);
      const active = r.status === 'active';
      if (!l) { if (active) rows.push({ kind: 'new', vno, renter: r }); continue; }
      if (!active && l.status === 'active') { rows.push({ kind: 'inactive', vno, renter: r, local: l }); continue; }
      if (active && l.status !== 'active') { rows.push({ kind: 'reopen', vno, renter: r, local: l }); continue; }
      if (!active) continue;
      const fields: ('name' | 'email' | 'phone')[] = [];
      if (!same(l.name, r.name)) fields.push('name');
      if (r.email && !same(l.email, r.email)) fields.push('email');
      if (r.phone && digits(l.phone) !== digits(r.phone)) fields.push('phone');
      if (fields.length) rows.push({ kind: 'diff', vno, renter: r, local: l, fields });
      else matched++;
    }
  }
  for (const l of locals) if (l.status === 'active' && !seen.has(l.vno.toLowerCase())) rows.push({ kind: 'missing', vno: l.vno, local: l });
  return { rows, matched };
}

/** The renter at Anytime Mailbox who has this box (active or inactive), to show staff before a change. */
export async function findRenter(base: string, path: string, key: string, vno: string, f: typeof fetch = fetch): Promise<{ ok: true; renter: Renter | null } | ApiFail> {
  const r = await listRenters(base, path, key, f);
  if (!r.ok) return r;
  return { ok: true, renter: r.renters.find((x) => x.mailboxes.some((m) => m.toLowerCase() === vno.toLowerCase())) ?? null };
}

export type CallSpec = { method: string; path: string };
/** Deactivate Renter or Delete Renter, exactly as their docs give the method and path ({renter_id} is filled in). */
export async function renterAction(base: string, spec: CallSpec, key: string, renterId: number, f: typeof fetch = fetch): Promise<{ ok: true } | ApiFail> {
  if (!Number.isInteger(renterId) || renterId <= 0) return { ok: false, result: 'error', message: 'No renter id' };
  const url = `${base.replace(/\/$/, '')}${spec.path.replace('{renter_id}', String(renterId))}`;
  let res: Response;
  try { res = await f(url, { method: spec.method.toUpperCase(), headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' } }); }
  catch (e: any) { return { ok: false, result: 'error', message: `Couldn't reach Anytime Mailbox (${e?.message ?? 'network'})` }; }
  if (res.status === 401 || res.status === 403) return { ok: false, result: 'rejected', status: res.status };
  if (res.status === 404) return { ok: false, result: 'not_found', status: 404 };
  const j: any = await res.json().catch(() => null);
  if (!res.ok || j?.success === false) return { ok: false, result: 'error', status: res.status, message: String(j?.error?.message ?? j?.message ?? '').slice(0, 200) || undefined };
  return { ok: true };
}
