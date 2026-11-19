import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { upsertCustomer, listMailboxDocs } from '../src/shipping/store';
import { idExpiryNotices } from '../src/lib/mailboxJobs';
import { POST as vPost } from '../src/pages/api/virtual';
import { POST as docsPost } from '../src/pages/api/mailbox-docs';
import { POST as mbPost } from '../src/pages/api/mailbox';

// IDs and mail holds for virtual mailbox customers (Peter, Nov 19 2026): tracked even without a website account.
const post = (fn: any, path: string) => async (body: Record<string, unknown>) => {
  const res = await fn({ request: new Request(`http://x${path}`, { method: 'POST', body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const v = post(vPost, '/api/virtual');
const docs = post(docsPost, '/api/mailbox-docs');
const mb = post(mbPost, '/api/mailbox');
const PNG = `data:image/png;base64,${btoa('\x89PNG id card')}`;
const plus = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

describe('virtual customers: IDs and mail holds', () => {
  let id = 0; let key = '';
  beforeAll(async () => {
    Object.assign(env as any, { COUNTER_PIN: '1234', SITE_URL: 'http://localhost:4321', DOCS_KEY: '', ANYTIME_API_KEY: '' });
    const r = await v({ pin: '1234', action: 'add', vno: '6610', name: 'Vic Holden', email: 'vic@example.com', phone: '318-555-0166' });
    id = r.body.virtual.id;
    key = (await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id).doc_key;
  });

  it('keeps documents under the virtual customer when there is no website account', async () => {
    expect(key).toBe(`V-${id}`);
    const a = await docs({ pin: '1234', action: 'add', customer_id: key, kind: 'photo_id', name: 'dl.png', data: PNG, expires_on: plus(10) });
    expect(a.status).toBe(200);
    const l = await docs({ pin: '1234', action: 'list', customer_id: key });
    expect(l.body.customer.name).toBe('Vic Holden');
    expect(l.body.boxes).toEqual(['V6610']);
    const row = (await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id);
    expect(row.docs).toBe(1);
    expect(row.id_state.state).toBe('expiring');
  });

  it('shows up in IDs to update and gets the ID notices', async () => {
    const l = (await mb({ pin: '1234', action: 'list' })).body.ids_expiring;
    expect(l.find((d: any) => d.customer_id === key)).toMatchObject({ virtual: 'Anytime Mailbox #6610', box_no: null });
    expect(await idExpiryNotices(env as any)).toBeGreaterThanOrEqual(1);
    expect(await idExpiryNotices(env as any, plus(11))).toBeGreaterThanOrEqual(1); // expired: mail held
  });

  it('an expired ID puts them on hold in the list and in Mail check', async () => {
    const d = (await listMailboxDocs(env as any, key))[0];
    await docs({ pin: '1234', action: 'set_expiry', id: d.id, expires_on: plus(-3) });
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id).id_state.state).toBe('hold');
    const hit = (await mb({ pin: '1234', action: 'search', q: '6610' })).body.virtual.find((x: any) => x.vno === '6610');
    expect(hit).toMatchObject({ doc_key: key, id_state: { state: 'hold' } });
    // Reinstated only with a new ID checked in person.
    expect((await docs({ pin: '1234', action: 'add', customer_id: key, kind: 'photo_id', name: 'new.png', data: PNG, expires_on: plus(900) })).body.code).toBe('in_person');
    expect((await docs({ pin: '1234', action: 'add', customer_id: key, kind: 'photo_id', name: 'new.png', data: PNG, expires_on: plus(900), in_person: true })).body.reinstated).toBe(true);
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id).id_state).toBeNull();
  });

  it('linking a website account moves their documents to it', async () => {
    const cust = (await upsertCustomer(env as any, { name: 'Vic Holden', email: 'vic@example.com', phone: '318-555-0166' }))!;
    await v({ pin: '1234', action: 'update', id, vno: '6610', name: 'Vic Holden', email: 'vic@example.com', phone: '318-555-0166', customer_id: cust });
    expect(await listMailboxDocs(env as any, key)).toEqual([]);
    expect((await listMailboxDocs(env as any, cust)).length).toBe(2);
    const row = (await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === id);
    expect([row.doc_key, row.docs]).toEqual([cust, 2]);
  });

  it('an ID date with no file (the ID stays at Anytime Mailbox), and the "no ID date" reminder', async () => {
    const a = await v({ pin: '1234', action: 'add', vno: 'N77', name: 'Nora Nodate' });
    const k = `V-${a.body.virtual.id}`;
    let row = (await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === a.body.virtual.id);
    expect(row.no_id).toBe(true);
    expect((await mb({ pin: '1234', action: 'search', q: 'N77' })).body.virtual[0].no_id).toBe(true);
    expect((await docs({ pin: '1234', action: 'add_date', customer_id: k, expires_on: 'soon' })).status).toBe(400);
    const d = await docs({ pin: '1234', action: 'add_date', customer_id: k, expires_on: plus(-2) });
    expect(d.body.doc).toMatchObject({ name: 'On file at Anytime Mailbox', bytes: 0, kind: 'photo_id' });
    row = (await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === a.body.virtual.id);
    expect([row.no_id, row.id_state.state]).toEqual([false, 'hold']); // an expired date puts their mail on hold
    expect((await docs({ pin: '1234', action: 'add_date', customer_id: k, expires_on: plus(700) })).body.code).toBe('in_person');
    expect((await docs({ pin: '1234', action: 'add_date', customer_id: k, expires_on: plus(700), in_person: true })).body.reinstated).toBe(true);
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === a.body.virtual.id).id_state).toBeNull();
  });
});
