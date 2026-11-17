import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { day, addMonths } from '../src/lib/mailbox';
import { upsertCustomer, assignMailbox } from '../src/shipping/store';
import { signSession } from '../src/lib/session';
import { POST } from '../src/pages/api/mailbox';
import { GET as photoGet } from '../src/pages/api/mailbox-photo';

// Photos of mail as it comes in, and keeping the letter count right (Peter, Nov 16 2026).
const call = async (body: Record<string, unknown>, cookie?: string) => {
  const res = await (POST as any)({ request: new Request('http://x/api/mailbox', { method: 'POST', headers: cookie ? { cookie } : {}, body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const getPhoto = (id: string, cookie?: string) => (photoGet as any)({ url: new URL(`http://x/api/mailbox-photo?id=${id}`), request: new Request('http://x', { headers: cookie ? { cookie } : {} }) });
// A real (tiny) JPEG header is enough: decodeImage checks the type and size, not the picture.
const JPEG = `data:image/jpeg;base64,${btoa('\xff\xd8\xff\xe0 label photo')}`;

describe('photos and pickup', () => {
  let me = '';
  let cookie = '';
  let other = '';
  beforeAll(async () => {
    Object.assign(env as any, { COUNTER_PIN: '1234', SITE_URL: 'http://x' });
    const today = day(new Date());
    me = (await upsertCustomer(env as any, { name: 'Phoebe Photo', email: 'phoebe@example.com', phone: '318-555-0181' }))!;
    cookie = `gp_customer=${encodeURIComponent(await signSession(env as any, me))}`;
    other = `gp_customer=${encodeURIComponent(await signSession(env as any, (await upsertCustomer(env as any, { name: 'Nosy Ned', email: 'ned@example.com', phone: '318-555-0182' }))!))}`;
    await assignMailbox(env as any, { box_no: 1177, customer_id: me, size: 'small', term: 6, start_date: today, paid_through: addMonths(today, 6) });
  });

  it('a package photo is saved with the piece; only the holder can see it', async () => {
    const r = await call({ pin: '1234', action: 'mail_in', box_no: 1177, kind: 'package', photo: JPEG });
    expect(r.body).toMatchObject({ ok: true, photo: true });
    const box = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    const detail = (await call({ pin: '1234', action: 'box_detail', id: box.id })).body;
    const pid = detail.packages[0].photo_id;
    expect(pid).toMatch(/^[0-9a-f]{32}$/);
    expect((await getPhoto(pid, cookie)).status).toBe(200);
    expect((await getPhoto(pid, other)).status).toBe(404);
    expect((await getPhoto(pid)).status).toBe(404);
    const staff = await call({ pin: '1234', action: 'photo', photo_id: pid });
    expect(staff.body.type).toBe('image/jpeg');
    // Undo removes the photo too.
    await call({ pin: '1234', action: 'mail_undo', item_id: r.body.item.id });
    expect((await getPhoto(pid, cookie)).status).toBe(404);
  });

  it('refuses a photo that is not a JPEG or PNG, and logs nothing', async () => {
    const r = await call({ pin: '1234', action: 'mail_in', box_no: 1177, kind: 'package', photo: 'data:image/gif;base64,R0lGOD' });
    expect(r.status).toBe(400);
    const box = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    expect(box.inbox.packages).toBe(0);
  });

  it('asks once a day whether a box with letters is empty, and clears only the letters', async () => {
    expect((await call({ pin: '1234', action: 'box_peek', box_no: 1177 })).body.ask).toBe(false); // nothing in it
    await call({ pin: '1234', action: 'mail_in', box_no: 1177, kind: 'letter' });
    await call({ pin: '1234', action: 'mail_in', box_no: 1177, kind: 'package' });
    // A new day (the check key is per day): simulate by clearing the box's keys.
    const box = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    const { updateMailbox } = await import('../src/shipping/store');
    await updateMailbox(env as any, box.id, { reminders: '[]' });
    expect((await call({ pin: '1234', action: 'box_peek', box_no: 1177 })).body).toMatchObject({ letters: 1, ask: true });
    expect((await call({ pin: '1234', action: 'box_checked', box_no: 1177, empty: true })).body.n).toBe(1);
    const after = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    expect([after.inbox.letters, after.inbox.packages]).toEqual([0, 1]); // the package is at the counter, untouched
    await call({ pin: '1234', action: 'mail_in', box_no: 1177, kind: 'letter' });
    expect((await call({ pin: '1234', action: 'box_peek', box_no: 1177 })).body.ask).toBe(false); // already checked today
  });

  it('the holder can say they emptied their box', async () => {
    const box = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    expect((await call({ action: 'emptied', id: box.id }, other)).status).toBe(404);
    expect((await call({ action: 'emptied', id: box.id }, cookie)).body.n).toBe(1);
    const after = (await call({ pin: '1234', action: 'list' })).body.boxes.find((x: any) => x.box_no === 1177);
    expect([after.inbox.letters, after.inbox.packages]).toEqual([0, 1]);
  });
});
