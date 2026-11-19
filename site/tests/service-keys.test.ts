import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { listAudit } from '../src/shipping/store';
import { serviceKey, storedServiceKey } from '../src/lib/serviceKeys';
import { POST as vPost } from '../src/pages/api/virtual';

// The Anytime Mailbox key pasted on the website by an owner (Peter, Nov 19 2026): locked, write-only, owner only.
const v = async (body: Record<string, unknown>) => {
  const res = await vPost({ request: new Request('http://x/api/virtual', { method: 'POST', body: JSON.stringify(body) }) } as any);
  return { status: res.status, body: await res.json() };
};
const KEY = 'test-operator-key-abcd1234WXYZ';

describe('service API keys on the website', () => {
  afterAll(() => { vi.unstubAllGlobals(); });
  beforeAll(() => {
    vi.stubGlobal('fetch', async (_u: string, init: any) => new Response(JSON.stringify(init?.headers?.Authorization === `Bearer ${KEY}` ? { success: true, data: { has_more: false, renters: [] } } : { success: false }), { status: init?.headers?.Authorization === `Bearer ${KEY}` ? 200 : 401 }));
    Object.assign(env as any, { COUNTER_PIN: '1234', OWNER_PIN: '9999', SITE_URL: 'http://localhost:4321', DOCS_KEY: '', ANYTIME_API_KEY: '' });
  });

  it('only an owner can save or remove it, and it must look like a key', async () => {
    expect((await v({ pin: '1234', action: 'key_save', provider: 'anytime', key: KEY })).status).toBe(403);
    expect((await v({ pin: '9999', action: 'key_save', provider: 'anytime', key: 'has a space' })).status).toBe(400);
    expect((await v({ pin: '9999', action: 'key_save', provider: 'nope', key: KEY })).status).toBe(400);
    const counter = await v({ pin: '1234', action: 'list' });
    expect(counter.body.can_manage_keys).toBe(false);
    expect(counter.body.providers[0].key.source).toBeNull();
  });

  it('is locked when stored and never sent back, only its last four', async () => {
    const r = await v({ pin: '9999', action: 'key_save', provider: 'anytime', key: `  ${KEY}  ` });
    expect(r.body.key).toMatchObject({ source: 'site', last4: 'WXYZ' });
    const raw = (await storedServiceKey(env as any, 'anytime'))!;
    expect(raw).not.toContain(KEY);
    expect(raw).not.toContain('abcd1234');
    expect(await serviceKey(env as any, 'anytime')).toBe(KEY);
    const list = await v({ pin: '9999', action: 'list' });
    expect(list.body.can_manage_keys).toBe(true);
    expect(JSON.stringify(list.body)).not.toContain('abcd1234');
    expect(list.body.providers[0].connected).toBe(true);
    expect((await v({ pin: '1234', action: 'key_test', provider: 'anytime' })).body).toEqual({ ok: true, result: 'ok' });
    const audit = (await listAudit(env as any)).filter((a) => a.action.startsWith('virtual.key'));
    expect(audit.map((a) => a.action)).toContain('virtual.key_save');
    expect(JSON.stringify(audit)).not.toContain('abcd1234');
  });

  it('a key set on the server wins; removing the website key works', async () => {
    (env as any).ANYTIME_API_KEY = 'server-key-0000QRST';
    expect((await v({ pin: '1234', action: 'list' })).body.providers[0].key).toMatchObject({ source: 'server', last4: 'QRST' });
    expect(await serviceKey(env as any, 'anytime')).toBe('server-key-0000QRST');
    expect((await v({ pin: '1234', action: 'key_test', provider: 'anytime' })).body.result).toBe('rejected'); // not the key their server knows
    (env as any).ANYTIME_API_KEY = '';
    const r = await v({ pin: '9999', action: 'key_remove', provider: 'anytime' });
    expect(r.body.key.source).toBeNull();
    expect(await serviceKey(env as any, 'anytime')).toBeNull();
    expect((await v({ pin: '1234', action: 'key_test', provider: 'anytime' })).body.result).toBe('no_key');
  });

  it('the live site refuses to store a key without DOCS_KEY', async () => {
    Object.assign(env as any, { SITE_URL: 'https://example.com' });
    const r = await v({ pin: '9999', action: 'key_save', provider: 'anytime', key: KEY });
    expect(r.status).toBe(500);
    expect(r.body.error).toMatch(/DOCS_KEY/);
    expect((await v({ pin: '9999', action: 'list' })).body.keys_ready).toBe(false);
    Object.assign(env as any, { SITE_URL: 'http://localhost:4321' });
  });
});
