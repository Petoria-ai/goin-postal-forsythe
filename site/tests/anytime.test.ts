import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { compare, listRenters, type Renter } from '../src/lib/anytime';
import { POST as vPost } from '../src/pages/api/virtual';

// Sync now with Anytime Mailbox (Peter, Nov 19 2026), read only, against a pretend server shaped like their docs.
const v = async (body: Record<string, unknown>) => {
  const res = await vPost({ request: new Request('http://x/api/virtual', { method: 'POST', body: JSON.stringify(body) }) } as any);
  return { status: res.status, body: await res.json() };
};
const KEY = 'pretend-anytime-key-0001';
const renter = (id: number, first: string, last: string, boxes: string[], extra: Record<string, unknown> = {}) =>
  ({ id, first_name: first, last_name: last, company: '', phone: '', email: '', status: 'active', mailboxes: boxes.map((name, i) => ({ id: id * 10 + i, name, assigned: '2026-01-01T00:00:00Z' })), ...extra });
const RENTERS = [
  renter(30743, 'Robyn', 'Wang', ['A103', 'B255'], { email: 'robyn@wang.com', phone: '+1 213 555 7878', company: 'Wang Co' }),
  renter(30800, 'Sam', 'Same', ['S1'], { email: 's@example.com', phone: '+1 318 555 0101' }),
  renter(30900, 'Ina', 'Gone', ['G7'], { status: 'inactive' }),
];
const calls: string[] = [];

describe('Anytime Mailbox: Test and Sync now (read only)', () => {
  beforeAll(async () => {
    vi.stubGlobal('fetch', async (u: string, init: any) => {
      calls.push(`${init?.method ?? 'GET'} ${u}`);
      if (init?.headers?.Authorization !== `Bearer ${KEY}`) return new Response('{}', { status: 401 });
      const q = new URL(u).searchParams;
      const after = Number(q.get('starting_after') ?? 0);
      const rest = RENTERS.filter((r) => r.id > after && q.get('status')!.split(',').includes(r.status));
      const lim = 2; // pretend pages of two, to test paging
      return new Response(JSON.stringify({ success: true, data: { has_more: rest.length > lim, renters: rest.slice(0, lim) } }), { status: 200 });
    });
    Object.assign(env as any, { COUNTER_PIN: '1234', OWNER_PIN: '9999', SITE_URL: 'http://localhost:4321', DOCS_KEY: '', ANYTIME_API_KEY: '' });
    await v({ pin: '1234', action: 'add', vno: 'S1', name: 'Sam Same', email: 's@example.com', phone: '318-555-0101' });
    await v({ pin: '1234', action: 'add', vno: 'B255', name: 'Robin Wang', email: 'robyn@wang.com' });
    await v({ pin: '1234', action: 'add', vno: 'G7', name: 'Ina Gone' });
    await v({ pin: '1234', action: 'add', vno: 'Z9', name: 'Zed Handkept' });
  });
  afterAll(() => { vi.unstubAllGlobals(); });

  it('says what is missing before a key, then pages through every renter', async () => {
    expect((await v({ pin: '1234', action: 'sync_preview', provider: 'anytime' })).body.result).toBe('no_key');
    await v({ pin: '9999', action: 'key_save', provider: 'anytime', key: KEY });
    const r = await listRenters('https://connect.anytimemailbox.com/v1', '/renters', KEY);
    expect(r.ok && r.renters.map((x) => x.id)).toEqual([30743, 30800, 30900]);
    expect(calls.some((c) => c.includes('starting_after=30800'))).toBe(true);
    expect(calls.every((c) => c.startsWith('GET https://connect.anytimemailbox.com/v1/renters?'))).toBe(true);
  });

  it('compares with our list: new, different, inactive there, missing there, and matches', async () => {
    const r = await v({ pin: '1234', action: 'sync_preview', provider: 'anytime' });
    expect(r.body).toMatchObject({ ok: true, renters: 3, matched: 1 });
    const by = Object.fromEntries(r.body.rows.map((x: any) => [x.vno, x]));
    expect(by.A103).toMatchObject({ kind: 'new', renter: { name: 'Robyn Wang', company: 'Wang Co' } });
    expect(by.B255).toMatchObject({ kind: 'diff', fields: ['name', 'phone'] });
    expect(by.G7.kind).toBe('inactive');
    expect(by.Z9.kind).toBe('missing');
    expect(by.S1).toBeUndefined(); // same name, email and phone (+1 and dashes don't matter)
    expect(calls.every((c) => c.startsWith('GET '))).toBe(true); // never changes anything at Anytime Mailbox
  });

  it('a wrong key or a wrong path is explained', async () => {
    (env as any).ANYTIME_API_KEY = 'some-other-key-9999';
    expect((await v({ pin: '1234', action: 'key_test', provider: 'anytime' })).body.result).toBe('rejected');
    (env as any).ANYTIME_API_KEY = '';
    const f404 = (async () => new Response('nope', { status: 404 })) as unknown as typeof fetch;
    expect(await listRenters('https://x/v1', '/renters', KEY, f404)).toMatchObject({ ok: false, result: 'not_found' });
  });

  it('compare() keeps closed boxes closed and flags ones to reopen', () => {
    const ren: Renter[] = [{ id: 1, name: 'A B', company: '', email: null, phone: null, status: 'active', mailboxes: ['Q1'] }];
    expect(compare(ren, [{ id: 9, vno: 'q1', name: 'A B', email: null, phone: null, names: [], status: 'closed' }]).rows[0].kind).toBe('reopen');
  });
});
