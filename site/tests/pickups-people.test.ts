import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { day, addMonths } from '../src/lib/mailbox';
import { upsertCustomer, assignMailbox, listAudit, exportTable } from '../src/shipping/store';
import { POST as mbPost } from '../src/pages/api/mailbox';
import { POST as vPost } from '../src/pages/api/virtual';
import { POST as docsPost } from '../src/pages/api/mailbox-docs';

// Who may pick up packages (Peter, Nov 25 2026): added in Edit, found by name in Mail check, for both kinds of box.
const post = (fn: any) => async (body: Record<string, unknown>) => {
  const res = await fn({ request: new Request('http://x/api', { method: 'POST', body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const mb = post(mbPost); const v = post(vPost); const docs = post(docsPost);

describe('who may pick up packages', () => {
  let boxId = 0; let vid = 0; let cust = '';
  beforeAll(async () => {
    Object.assign(env as any, { COUNTER_PIN: '1234', SITE_URL: 'http://localhost:4321', DOCS_KEY: '' });
    const today = day(new Date());
    cust = (await upsertCustomer(env as any, { name: 'Holly Holder', email: 'holly@example.com', phone: '318-555-0601' }))!;
    boxId = (await assignMailbox(env as any, { box_no: 1188, customer_id: cust, size: 'small', term: 6, start_date: today, paid_through: addMonths(today, 6) })).id;
    vid = (await v({ pin: '1234', action: 'add', vno: 'Mailbox 777', name: 'Vince Virtual' })).body.virtual.id;
  });

  it('wall box: add in Edit, shows on the box, Mail check finds it by their name, remove', async () => {
    expect((await mb({ pin: '1234', action: 'pickup_add', id: boxId, name: 'X' })).status).toBe(400);
    const a = await mb({ pin: '1234', action: 'pickup_add', id: boxId, name: '  Paula   Pickup ', relation: 'sister' });
    expect(a.body.pickup).toMatchObject({ name: 'Paula Pickup', relation: 'sister', box_kind: 'wall' });
    const r = await mb({ pin: '1234', action: 'search', q: 'paula' });
    expect(r.body.boxes.map((x: any) => x.box_no)).toContain(1188);
    expect(r.body.boxes.find((x: any) => x.box_no === 1188).pickups).toEqual([{ id: a.body.pickup.id, name: 'Paula Pickup', relation: 'sister' }]);
    expect((await mb({ pin: '1234', action: 'pickup_remove', id: boxId, pickup_id: a.body.pickup.id })).body.ok).toBe(true);
    expect((await mb({ pin: '1234', action: 'search', q: 'paula' })).body.boxes.map((x: any) => x.box_no)).not.toContain(1188);
  });

  it('virtual mailbox: add, listed, found in Mail check by their name, remove', async () => {
    const a = await v({ pin: '1234', action: 'pickup_add', id: vid, name: 'Vera Assistant', relation: 'assistant' });
    expect(a.body.pickup).toMatchObject({ box_kind: 'virtual', box_id: vid });
    expect((await v({ pin: '1234', action: 'list' })).body.virtual.find((x: any) => x.id === vid).pickups).toEqual([{ id: a.body.pickup.id, name: 'Vera Assistant', relation: 'assistant' }]);
    const r = await mb({ pin: '1234', action: 'search', q: 'vera assist' });
    expect(r.body.virtual.map((x: any) => x.vno)).toContain('Mailbox 777');
    await v({ pin: '1234', action: 'pickup_remove', id: vid, pickup_id: a.body.pickup.id });
    expect((await mb({ pin: '1234', action: 'search', q: 'vera assist' })).body.virtual.map((x: any) => x.vno)).not.toContain('Mailbox 777');
    const audit = (await listAudit(env as any)).map((x) => x.action);
    expect(audit).toEqual(expect.arrayContaining(['mailbox.pickup_add', 'mailbox.pickup_remove', 'virtual.pickup_add', 'virtual.pickup_remove']));
    expect(Array.isArray(await exportTable(env as any, 'mailbox_pickups'))).toBe(true);
  });

  it("the pickup person's ID can go in Documents", async () => {
    const png = `data:image/png;base64,${btoa('\x89PNG pickup id')}`;
    const d = await docs({ pin: '1234', action: 'add', customer_id: cust, kind: 'pickup_id', name: 'paula.png', data: png, note: 'Paula Pickup' });
    expect(d.body.doc.kind).toBe('pickup_id');
  });
});
