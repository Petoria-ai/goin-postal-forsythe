import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { day, addMonths } from '../src/lib/mailbox';
import { upsertCustomer, assignMailbox, listDocDates, listAudit } from '../src/shipping/store';
import { idExpiryNotices } from '../src/lib/mailboxJobs';
import { POST as docsPost } from '../src/pages/api/mailbox-docs';
import { POST as mbPost } from '../src/pages/api/mailbox';

// ID expiration dates and the names allowed at a box (Peter, Nov 18 2026).
const post = (fn: any, path: string) => async (body: Record<string, unknown>) => {
  const res = await fn({ request: new Request(`http://x${path}`, { method: 'POST', body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const docs = post(docsPost, '/api/mailbox-docs');
const mb = post(mbPost, '/api/mailbox');
const PNG = `data:image/png;base64,${btoa('\x89PNG id card')}`;
const plus = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

describe('ID expiration dates', () => {
  let cust = ''; let boxId = 0;
  beforeAll(async () => {
    Object.assign(env as any, { COUNTER_PIN: '1234', SITE_URL: 'http://localhost:4321', DOCS_KEY: '', STAFF_EMAIL: 'staff@example.com' });
    const today = day(new Date());
    cust = (await upsertCustomer(env as any, { name: 'Ida Expiring', email: 'ida@example.com', phone: '318-555-0175' }))!;
    boxId = (await assignMailbox(env as any, { box_no: 1144, customer_id: cust, size: 'small', term: 6, start_date: today, paid_through: addMonths(today, 6) })).id;
  });

  it('takes the date on upload, shows it, and lets staff change it', async () => {
    expect((await docs({ pin: '1234', action: 'add', customer_id: cust, kind: 'photo_id', name: 'dl.png', data: PNG, expires_on: 'soon' })).status).toBe(400);
    const a = await docs({ pin: '1234', action: 'add', customer_id: cust, kind: 'photo_id', name: 'dl.png', data: PNG, expires_on: plus(400) });
    expect(a.status).toBe(200);
    let list = (await docs({ pin: '1234', action: 'list', customer_id: cust })).body.docs;
    expect(list[0].expires_on).toBe(plus(400));
    await docs({ pin: '1234', action: 'set_expiry', id: a.body.doc.id, expires_on: plus(20) });
    list = (await docs({ pin: '1234', action: 'list', customer_id: cust })).body.docs;
    expect(list[0].expires_on).toBe(plus(20));
  });

  it('lists IDs expiring within 30 days for staff', async () => {
    const l = (await mb({ pin: '1234', action: 'list' })).body.ids_expiring;
    expect(l.find((x: any) => x.customer.name === 'Ida Expiring')).toMatchObject({ kind: 'photo_id', expires_on: plus(20), expired: false, box_no: 1144 });
  });

  it('reminds the holder and staff once at 30 days, and once when it has expired', async () => {
    expect(await idExpiryNotices(env as any)).toBe(1);
    expect(await idExpiryNotices(env as any)).toBe(0);
    expect(await idExpiryNotices(env as any, plus(21))).toBe(1); // now expired
    expect(await idExpiryNotices(env as any, plus(30))).toBe(0);
    expect((await listAudit(env as any)).some((a) => a.action === 'mailbox.id_expiry')).toBe(true);
  });

  it('a new date starts over; deleting the document deletes its date', async () => {
    const [d] = (await docs({ pin: '1234', action: 'list', customer_id: cust })).body.docs;
    await docs({ pin: '1234', action: 'set_expiry', id: d.id, expires_on: plus(10) });
    expect(await idExpiryNotices(env as any)).toBe(1);
    await docs({ pin: '1234', action: 'delete', id: d.id });
    expect((await listDocDates(env as any)).find((x) => x.doc_id === d.id)).toBeUndefined();
  });

  it('names allowed at a box: add, find by Mail check, remove', async () => {
    expect((await mb({ pin: '1234', action: 'name_add', id: boxId, name: 'x' })).status).toBe(400);
    const n = await mb({ pin: '1234', action: 'name_add', id: boxId, name: 'Expiring Consulting LLC', kind: 'business' });
    expect(n.body.name).toMatchObject({ name: 'Expiring Consulting LLC', kind: 'business' });
    await mb({ pin: '1234', action: 'name_add', id: boxId, name: 'Tom  Expiring' });
    const found = (await mb({ pin: '1234', action: 'search', q: 'consulting' })).body.boxes;
    expect(found.map((x: any) => x.box_no)).toEqual([1144]);
    expect(found[0].names.map((x: any) => x.name)).toEqual(['Expiring Consulting LLC', 'Tom Expiring']);
    await mb({ pin: '1234', action: 'name_remove', id: boxId, name_id: n.body.name.id });
    expect((await mb({ pin: '1234', action: 'search', q: 'consulting' })).body.boxes).toEqual([]);
  });
});
