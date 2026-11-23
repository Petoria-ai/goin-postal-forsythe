import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { listAudit } from '../src/shipping/store';
import { POST as vPost, PROVIDERS } from '../src/pages/api/virtual';

// Deactivate / Delete a renter at Anytime Mailbox (Peter, Nov 23 2026): in Edit, typed box number, manager / owner only.
const v = async (body: Record<string, unknown>) => {
  const res = await vPost({ request: new Request('http://x/api/virtual', { method: 'POST', body: JSON.stringify(body) }) } as any);
  return { status: res.status, body: await res.json() };
};
const KEY = 'pretend-anytime-key-danger';
const writes: string[] = [];
let renters: any[] = [];

describe('Danger zone: deactivate or delete at Anytime Mailbox', () => {
  let id = 0;
  beforeAll(async () => {
    renters = [{ id: 51001, first_name: 'Una', last_name: 'Verified', company: '', phone: '', email: '', status: 'active', mailboxes: [{ id: 1, name: 'D501' }] }];
    vi.stubGlobal('fetch', async (u: string, init: any) => {
      if (init?.headers?.Authorization !== `Bearer ${KEY}`) return new Response('{}', { status: 401 });
      const m = init?.method ?? 'GET';
      if (m !== 'GET') { writes.push(`${m} ${new URL(u).pathname}`); return new Response(JSON.stringify({ success: true }), { status: 200 }); }
      return new Response(JSON.stringify({ success: true, data: { has_more: false, renters } }), { status: 200 });
    });
    Object.assign(env as any, { COUNTER_PIN: '1234', OWNER_PIN: '9999', SITE_URL: 'http://localhost:4321', DOCS_KEY: '', ANYTIME_API_KEY: KEY });
    id = (await v({ pin: '1234', action: 'add', vno: 'D501', name: 'Una Verified' })).body.virtual.id;
  });
  afterAll(() => { vi.unstubAllGlobals(); (env as any).ANYTIME_API_KEY = ''; PROVIDERS[0].deactivate = null; PROVIDERS[0].delete = null; });

  it('delete needs an owner; with no path from their docs yet, nothing is sent', async () => {
    // The shared counter PIN counts as a manager once an OWNER_PIN exists (lib/auth.ts), so it may look up and deactivate.
    expect((await v({ pin: '1234', action: 'renter_delete', id, confirm: 'D501', renter_id: 51001 })).status).toBe(403);
    expect((await v({ pin: '0000', action: 'renter_lookup', id })).status).toBe(401);
    expect((await v({ pin: '9999', action: 'renter_deactivate', id, confirm: 'D501', renter_id: 51001 })).body.result).toBe('no_path');
    const look = await v({ pin: '9999', action: 'renter_lookup', id });
    expect(look.body).toMatchObject({ ok: true, renter: { id: 51001, name: 'Una Verified' }, can_deactivate: false, can_delete: false });
    expect(writes).toEqual([]);
  });

  it('needs the box number typed and the same renter, then deactivates there and closes here', async () => {
    PROVIDERS[0].deactivate = { method: 'POST', path: '/renters/{renter_id}/deactivate' };
    expect((await v({ pin: '9999', action: 'renter_deactivate', id, confirm: 'D50', renter_id: 51001 })).status).toBe(400);
    expect((await v({ pin: '9999', action: 'renter_deactivate', id, confirm: 'D501', renter_id: 99 })).status).toBe(409);
    expect(writes).toEqual([]);
    const r = await v({ pin: '9999', action: 'renter_deactivate', id, confirm: '#d501', renter_id: 51001 });
    expect(r.body.ok).toBe(true);
    expect(writes).toEqual(['POST /v1/renters/51001/deactivate']);
    expect(r.body.virtual).toMatchObject({ status: 'closed' });
    expect(r.body.virtual.note).toMatch(/Deactivated at Anytime Mailbox/);
    const a = (await listAudit(env as any)).find((x) => x.action === 'virtual.renter_deactivate');
    expect(a?.detail).toMatch(/renter 51001 \(Una Verified\) · done/);
  });

  it('delete is owner only, uses its own call, and keeps them on our list as closed', async () => {
    PROVIDERS[0].delete = { method: 'DELETE', path: '/renters/{renter_id}' };
    renters = [{ id: 51002, first_name: 'Never', last_name: 'Verified', company: '', phone: '', email: '', status: 'inactive', mailboxes: [{ id: 2, name: 'D502' }] }];
    const id2 = (await v({ pin: '1234', action: 'add', vno: 'D502', name: 'Never Verified' })).body.virtual.id;
    expect((await v({ pin: '1234', action: 'renter_delete', id: id2, confirm: 'D502', renter_id: 51002 })).status).toBe(403);
    const r = await v({ pin: '9999', action: 'renter_delete', id: id2, confirm: 'D502', renter_id: 51002 });
    expect(r.body.ok).toBe(true);
    expect(writes.at(-1)).toBe('DELETE /v1/renters/51002');
    expect(r.body.virtual.note).toMatch(/Deleted at Anytime Mailbox/);
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id2).status).toBe('closed');
  });

  it('a box nobody has at Anytime Mailbox: nothing is sent', async () => {
    const id3 = (await v({ pin: '1234', action: 'add', vno: 'D999', name: 'Only Here' })).body.virtual.id;
    const n = writes.length;
    expect((await v({ pin: '9999', action: 'renter_deactivate', id: id3, confirm: 'D999', renter_id: 1 })).body.result).toBe('no_renter');
    expect(writes.length).toBe(n);
  });
});
