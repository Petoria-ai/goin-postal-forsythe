import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { listAudit, exportTable } from '../src/shipping/store';
import { POST as vPost } from '../src/pages/api/virtual';
import { POST as mbPost } from '../src/pages/api/mailbox';

// Virtual mail on Anytime Mailbox (Peter, Nov 19 2026): its own list, never a wall box number, found by Mail check.
const post = (fn: any, path: string) => async (body: Record<string, unknown>) => {
  const res = await fn({ request: new Request(`http://x${path}`, { method: 'POST', body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const v = post(vPost, '/api/virtual');
const mb = post(mbPost, '/api/mailbox');

describe('virtual mailboxes', () => {
  beforeAll(() => { Object.assign(env as any, { COUNTER_PIN: '1234', ANYTIME_API_KEY: '' }); });

  it('needs a PIN, a number and a name; never a wall box number; no duplicates', async () => {
    expect((await v({ pin: '0000', action: 'list' })).status).toBe(401);
    expect((await v({ pin: '1234', action: 'add', vno: '', name: 'X' })).status).toBe(400);
    const clash = await v({ pin: '1234', action: 'add', vno: '1105', name: 'Wally Wall' });
    expect(clash.status).toBe(400);
    expect(clash.body.error).toMatch(/wall box number/);
    expect((await v({ pin: '1234', action: 'add', vno: '4521', name: 'Vera Virtual', customer_id: 'C-NOPE' })).status).toBe(400);
    const ok = await v({ pin: '1234', action: 'add', vno: '#4521', name: 'Vera Virtual', phone: '318-555-0190', names: ['Virtual Ventures LLC', ''] });
    expect(ok.body.virtual).toMatchObject({ vno: '4521', name: 'Vera Virtual', status: 'active' });
    expect((await v({ pin: '1234', action: 'add', vno: '4521', name: 'Someone Else' })).status).toBe(409);
  });

  it('lists, edits, closes and reopens', async () => {
    const list = await v({ pin: '1234', action: 'list' });
    expect(list.body.connected).toBe(false);
    const row = list.body.virtual.find((x: any) => x.vno === '4521');
    expect(row.names).toEqual(['Virtual Ventures LLC']);
    await v({ pin: '1234', action: 'update', id: row.id, vno: '4521', name: 'Vera Virtual', phone: '318-555-0190', email: 'vera@example.com', names: ['Virtual Ventures LLC'] });
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === row.id).email).toBe('vera@example.com');
    await v({ pin: '1234', action: 'close', id: row.id });
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === row.id).status).toBe('closed');
    await v({ pin: '1234', action: 'reopen', id: row.id });
    expect((await listAudit(env as any)).filter((a) => a.action.startsWith('virtual.')).map((a) => a.action)).toEqual(expect.arrayContaining(['virtual.add', 'virtual.update', 'virtual.close', 'virtual.reopen']));
    expect((await exportTable(env as any, 'virtual_mailboxes')).length).toBeGreaterThan(0);
  });

  it('Mail check finds them by number, name, business name or phone', async () => {
    for (const q of ['4521', '#4521', 'vera', 'ventures', '5550190']) {
      const r = await mb({ pin: '1234', action: 'search', q });
      expect([q, r.body.virtual.map((x: any) => x.vno)]).toEqual([q, expect.arrayContaining(['4521'])]);
    }
    expect((await mb({ pin: '1234', action: 'search', q: 'nobody-here' })).body.virtual).toEqual([]);
  });
});

describe('one tab per virtual mailbox service', () => {
  it('lists the services, keeps each customer with theirs, and Mail check names the service', async () => {
    const l = await v({ pin: '1234', action: 'list' });
    expect(l.body.providers.map((p: any) => [p.id, p.name])).toEqual([['anytime', 'Anytime Mailbox']]);
    expect(l.body.virtual.every((x: any) => x.provider === 'anytime')).toBe(true);
    expect((await v({ pin: '1234', action: 'add', provider: 'nope', vno: '7777', name: 'X' })).status).toBe(400);
    const r = await mb({ pin: '1234', action: 'search', q: 'vera' });
    expect(r.body.virtual[0]).toMatchObject({ provider: 'anytime', provider_name: 'Anytime Mailbox' });
  });
});
