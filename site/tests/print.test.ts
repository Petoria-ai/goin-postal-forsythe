import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { upsertCustomer, listAudit } from '../src/shipping/store';
import { signSession } from '../src/lib/session';
import { priceItem, productById, sharpness, filesNeeded, gelatoUid } from '../src/lib/printProducts';
import { readArt, getPrintOrder } from '../src/lib/printOrders';
import { POST as printPost } from '../src/pages/api/print-orders';
import { POST as staffPost } from '../src/pages/api/print-staff';
import { GET as fileGet } from '../src/pages/api/print-file';
import { GET as mockPaid } from '../src/pages/api/mock-paid';
import { POST as hookPost } from '../src/pages/api/gelato-webhook';

// Printed products made by Gelato (Peter, Nov 25 2026): presets, artwork checks, order, pay, staff approve, Gelato.
const call = (fn: any) => async (body: Record<string, unknown>, cookie?: string) => {
  const res = await fn({ request: new Request('http://x/api', { method: 'POST', headers: cookie ? { cookie } : {}, body: JSON.stringify(body) }) });
  return { status: res.status, body: await res.json() };
};
const shop = call(printPost); const staff = call(staffPost);
/** A PNG of a given pixel size (only the header, which is all the website reads). */
const png = (w: number, h: number) => {
  const b = new Uint8Array(33); b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  const v = new DataView(b.buffer); v.setUint32(16, w); v.setUint32(20, h);
  return `data:image/png;base64,${btoa(String.fromCharCode(...b))}`;
};
const jpeg = (w: number, h: number) => {
  const b = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 0, 0, 0]);
  return `data:image/jpeg;base64,${btoa(String.fromCharCode(...b))}`;
};

describe('presets and prices', () => {
  it('prices shirts by size and spots, and refuses anything not offered', () => {
    const t = productById('tshirt')!;
    const p = priceItem(t, { color: 'black', spots: ['front', 'back'], sizes: { m: 2, '2xl': 1 } });
    expect(p.quantity).toBe(3);
    expect(p.lines.map((l) => [l.qty, l.unit])).toEqual([[2, 30.99], [1, 33.99]]); // 24.99 + 6 back; 2XL +3
    expect(p.subtotal).toBe(95.97);
    expect(() => priceItem(t, { color: 'purple', spots: ['front'], sizes: { m: 1 } })).toThrow(/color/);
    expect(() => priceItem(t, { color: 'black', spots: ['front', 'chest'], sizes: { m: 1 } })).toThrow(/not both/);
    expect(() => priceItem(t, { color: 'black', spots: ['front'], sizes: { m: 13 } })).toThrow(/quote/);
    expect(filesNeeded(t, ['chest', 'back']).map((f) => f.file)).toEqual(['front', 'back']);
    expect(gelatoUid(t, 'm', 'black')).toContain('gsi_m_gco_black');
    expect(productById('embroidered')).toBeNull(); // turned off until its Gelato code is filled in
  });
  it('prices posters and flyers from their table, and rates sharpness', () => {
    const f = productById('flyer')!;
    expect(priceItem(f, { size: 'us-letter', quantity: 100 }).subtotal).toBe(49.99);
    expect(() => priceItem(f, { size: 'us-letter', quantity: 77 })).toThrow(/quantities/);
    expect(sharpness({ w: 1800, h: 2700 }, { w: 12, h: 18 })).toEqual({ dpi: 150, level: 'good' });
    expect(sharpness({ w: 1300, h: 1950 }, { w: 12, h: 18 }).level).toBe('ok');
    expect(sharpness({ w: 600, h: 900 }, { w: 12, h: 18 }).level).toBe('low');
  });
  it('reads a picture size from PNG and JPEG headers, and refuses other files', () => {
    expect(readArt(png(1200, 1800))).toMatchObject({ w: 1200, h: 1800, type: 'image/png' });
    expect(readArt(jpeg(640, 480))).toMatchObject({ w: 640, h: 480, type: 'image/jpeg' });
    expect(() => readArt('data:application/pdf;base64,JVBERi0=')).toThrow(/PNG or JPEG/);
  });
});

describe('ordering, paying, approving, Gelato', () => {
  let cookie = ''; let id = '';
  beforeAll(async () => {
    Object.assign(env as any, { COUNTER_PIN: '1234', OWNER_PIN: '9999', SITE_URL: 'http://localhost:4321', STRIPE_SECRET_KEY: '', GELATO_API_KEY: '', DOCS_KEY: '' });
    const cid = (await upsertCustomer(env as any, { name: 'Pat Poster', email: 'pat@example.com', phone: '318-555-0700' }))!;
    cookie = `gp_customer=${encodeURIComponent(await signSession(env as any, cid))}`;
  });
  afterAll(() => { vi.unstubAllGlobals(); });

  it('anyone sees the catalog and a quote; ordering needs sign-in and sharp, cropped artwork', async () => {
    const cat = await shop({ action: 'catalog' });
    expect(cat.body.products.map((p: any) => p.id)).toEqual(['tshirt', 'poster', 'flyer']);
    const q = await shop({ action: 'quote', product: 'poster', picks: { size: '300x450-mm-12x18-inch', quantity: 2 } });
    expect(q.body).toMatchObject({ subtotal: 36.99, shipping: 6.99 });
    const base = { action: 'order', product: 'poster', picks: { size: '300x450-mm-12x18-inch', quantity: 2 }, ship_to: 'store' };
    expect((await shop({ ...base, art: [{ file: 'default', data: png(1800, 2700) }] })).status).toBe(401);
    expect((await shop({ ...base, art: [{ file: 'default', data: png(600, 900) }] }, cookie)).body.error).toMatch(/too small/);
    expect((await shop({ ...base, art: [{ file: 'default', data: png(1800, 1800) }] }, cookie)).body.error).toMatch(/cropped/);
    const ok = await shop({ ...base, art: [{ file: 'default', data: png(1800, 2700) }] }, cookie);
    expect(ok.body.url).toBe(`http://localhost:4321/api/mock-paid?order=${ok.body.order}`);
    id = ok.body.order;
    const o = await getPrintOrder(env as any, id);
    expect(o).toMatchObject({ status: 'awaiting_payment', ship_to: 'store', address: { city: 'Monroe', state: 'LA' } });
    expect(o!.total).toBeCloseTo(36.99 + 6.99 + (o!.tax?.amount ?? 0) + (o!.fee?.amount ?? 0), 2);
  });

  it('paying makes it wait for staff; staff approve and it goes to the pretend Gelato', async () => {
    expect((await staff({ pin: '1234', action: 'approve', id })).body.error).toMatch(/Not paid/);
    const r = await mockPaid({ url: new URL(`http://x/api/mock-paid?order=${id}`), redirect: (to: string) => new Response(null, { status: 302, headers: { location: to } }) } as any);
    expect(r.headers.get('location')).toBe(`/print/done?order=${id}`);
    const list = await staff({ pin: '1234', action: 'list' });
    expect(list.body.mode).toBe('pretend');
    expect(list.body.orders.find((x: any) => x.id === id).status).toBe('paid');
    const a = await staff({ pin: '1234', action: 'approve', id });
    expect(a.body.order).toMatchObject({ status: 'sent', gelato: { order_id: `PRETEND-${id}`, mode: 'pretend' } });
    expect((await staff({ pin: '1234', action: 'approve', id })).status).toBe(409);
    expect((await shop({ action: 'get', order: id }, cookie)).body.order).toMatchObject({ id, status: 'sent' });
    expect((await listAudit(env as any)).map((x) => x.action)).toContain('print.approve');
  });

  it('the artwork opens only with the signed link', async () => {
    const art = (await staff({ pin: '1234', action: 'art', id })).body.art[0];
    const u = new URL(art.url);
    expect((await fileGet({ url: u } as any)).status).toBe(200);
    u.searchParams.set('s', '0'.repeat(32));
    expect((await fileGet({ url: u } as any)).status).toBe(404);
  });

  it('with a key: drafts until an owner switches real orders on; status and tracking come back', async () => {
    const sent: any[] = [];
    vi.stubGlobal('fetch', async (u: string, init: any) => {
      sent.push({ u, init });
      if (init?.method === 'POST') return new Response(JSON.stringify({ id: 'gel-123' }), { status: 200 });
      return new Response(JSON.stringify({ id: 'gel-123', fulfillmentStatus: 'shipped', items: [{ fulfillments: [{ trackingCode: '1Z999', trackingUrl: 'https://track/1Z999' }] }] }), { status: 200 });
    });
    expect((await staff({ pin: '1234', action: 'key_save', key: 'gelato-test-key-123456' })).status).toBe(403);
    expect((await staff({ pin: '9999', action: 'key_save', key: 'gelato-test-key-123456' })).body.mode).toBe('draft');
    // A second order, paid, approved: goes to Gelato as a draft.
    const o2 = await shop({ action: 'order', product: 'tshirt', picks: { color: 'black', spots: ['chest', 'back'], sizes: { m: 1, l: 2 } }, ship_to: 'home', address: { line1: '1 Main St', city: 'Ruston', state: 'la', zip: '71270' }, art: [{ file: 'front', data: png(1650, 2100) }, { file: 'back', data: png(1650, 2100) }] }, cookie);
    await mockPaid({ url: new URL(`http://x/?order=${o2.body.order}`), redirect: (to: string) => new Response(null, { status: 302, headers: { location: to } }) } as any);
    const a = await staff({ pin: '1234', action: 'approve', id: o2.body.order });
    expect(a.body.order.gelato).toMatchObject({ order_id: 'gel-123', mode: 'draft' });
    const body = JSON.parse(sent[0].init.body);
    expect(sent[0].init.headers['X-API-KEY']).toBe('gelato-test-key-123456');
    expect(body).toMatchObject({ orderType: 'draft', orderReferenceId: o2.body.order, currency: 'USD', shippingAddress: { city: 'Ruston', state: 'LA', postCode: '71270', country: 'US' } });
    expect(body.items.map((i: any) => [i.quantity, i.productUid.includes('gsi_m_gco_black')])).toEqual([[1, true], [2, false]]);
    expect(body.items[0].files.map((f: any) => f.type)).toEqual(['front', 'back']);
    // Real orders on: owner only.
    expect((await staff({ pin: '1234', action: 'set_live', on: true })).status).toBe(403);
    expect((await staff({ pin: '9999', action: 'set_live', on: true })).body.mode).toBe('live');
    await staff({ pin: '9999', action: 'set_live', on: false });
    // Gelato's notice: the site asks Gelato itself, then saves shipped and the tracking.
    await hookPost({ request: new Request('http://x', { method: 'POST', body: JSON.stringify({ orderReferenceId: o2.body.order, fulfillmentStatus: 'delivered' }) }) } as any);
    const after = await getPrintOrder(env as any, o2.body.order);
    expect(after).toMatchObject({ status: 'shipped', tracking: { code: '1Z999', url: 'https://track/1Z999' } });
  });

  it('only a manager or owner cancels, and only before it goes to Gelato', async () => {
    const o3 = await shop({ action: 'order', product: 'flyer', picks: { size: 'us-half-letter', quantity: 50 }, ship_to: 'store', art: [{ file: 'default', data: jpeg(825, 1275) }] }, cookie);
    expect((await staff({ pin: '9999', action: 'cancel', id: o3.body.order })).body.order.status).toBe('cancelled');
    expect((await staff({ pin: '9999', action: 'cancel', id })).status).toBe(409); // already sent
  });
});
