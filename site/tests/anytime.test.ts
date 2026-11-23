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
const renterExtra: any[] = [];
// Box statuses for List Mailboxes: P1 is a sign-up not verified yet; S1, B255, A103, G7, Z9 are set up.
let BOXES: { id: number; name: string; status: string }[] = [];
let boxesDown = false;

describe('Anytime Mailbox: Test and Sync now (read only)', () => {
  beforeAll(async () => {
    vi.stubGlobal('fetch', async (u: string, init: any) => {
      calls.push(`${init?.method ?? 'GET'} ${u}`);
      if (init?.headers?.Authorization !== `Bearer ${KEY}`) return new Response('{}', { status: 401 });
      const q = new URL(u).searchParams;
      if (new URL(u).pathname.endsWith('/mailboxes')) {
        if (boxesDown) return new Response('nope', { status: 404 });
        return new Response(JSON.stringify({ success: true, data: { has_more: false, mailboxes: BOXES } }), { status: 200 });
      }
      const after = Number(q.get('starting_after') ?? 0);
      const rest = [...RENTERS, ...renterExtra].filter((r) => r.id > after && q.get('status')!.split(',').includes(r.status));
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
    expect(calls.filter((c) => c.includes('/v1/renters?')).length).toBe(2);
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
    const ren: Renter[] = [{ id: 1, name: 'A B', company: '', email: null, phone: null, status: 'active', mailboxes: ['Q1'], assigned: { q1: true }, boxes: [{ name: 'Q1', assigned: '2026-01-01' }] }];
    expect(compare(ren, [{ id: 9, vno: 'q1', name: 'A B', email: null, phone: null, names: [], status: 'closed' }]).rows[0].kind).toBe('reopen');
  });

describe('only verified renters count (Peter, Nov 23 2026)', () => {
  it('a sign-up whose box is pending is not added, and one already imported is flagged to close here', async () => {
    renterExtra.push(renter(31000, 'Pat', 'Pending', ['P1'], { email: 'pat@example.com' }), renter(31001, 'Ivy', 'Imported', ['P2']));
    BOXES = [{ id: 1, name: 'P1', status: 'pending-assignment' }, { id: 2, name: 'P2', status: 'pending-assignment' }, { id: 3, name: 'A103', status: 'assigned' }];
    await v({ pin: '1234', action: 'add', vno: 'P2', name: 'Ivy Imported' }); // came in before this check
    const r = await v({ pin: '1234', action: 'sync_preview', provider: 'anytime' });
    expect(r.body.box_check).toBe('status');
    const by = Object.fromEntries(r.body.rows.map((x: any) => [x.vno, x.kind]));
    expect(by.P1).toBe('pending');
    expect(by.P2).toBe('unverified');
    expect(by.A103).toBe('new'); // assigned: a real customer
    expect(r.body.rows.filter((x: any) => x.kind === 'new').map((x: any) => x.vno)).not.toContain('P1');
  });

  it("without box statuses, a box with no assigned date doesn't count either", async () => {
    boxesDown = true;
    renterExtra.push({ ...renter(31002, 'No', 'Date', ['P3']), mailboxes: [{ id: 9, name: 'P3', assigned: null }] });
    const r = await v({ pin: '1234', action: 'sync_preview', provider: 'anytime' });
    expect(r.body.box_check).toBe('assigned_date');
    expect(r.body.rows.find((x: any) => x.vno === 'P3').kind).toBe('pending');
    boxesDown = false;
  });
});

describe('Check at Anytime Mailbox (one box, read only)', () => {
  it('shows every renter with the box, its status and dates, and what Sync decides', async () => {
    const list = (await v({ pin: '1234', action: 'list' })).body.virtual;
    const p2 = list.find((x: any) => x.vno === 'P2');
    const r = await v({ pin: '1234', action: 'renter_check', id: p2.id });
    expect(r.body).toMatchObject({ ok: true, vno: 'P2', box_status: 'pending-assignment', box_check: 'status' });
    expect(r.body.holders[0]).toMatchObject({ id: 31001, status: 'active' });
    expect(r.body.sync_says).toMatch(/Not verified/);
    expect(calls.at(-1)).toMatch(/^GET /);
    expect(calls.some((c) => c.includes('status=active%2Cinactive%2Cdeleted'))).toBe(true);
  });
});
});
