export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { readSession } from '../../lib/session';
import { getCustomer } from '../../shipping/store';
import { effectiveAddons, onlineFee, salesTax } from '../../lib/addons';
import { activeProducts, productById, priceItem, filesNeeded, sharpness, PRINT } from '../../lib/printProducts';
import { newPrintId, savePrintOrder, indexPrintOrder, getPrintOrder, listPrintOrders, readArt, saveArt, type PrintOrder } from '../../lib/printOrders';
import { createPrintCheckout } from '../../lib/stripe';
import { store } from '../../data/store';

// Printed products made to order by Gelato, the customer side (Peter, Nov 25 2026; /api/print is the label print queue, not this). Anyone: catalog (the presets),
// quote {product, picks}. Signed in: order {product, picks, art: [{file, data}], ship_to: 'store'|'home', address?,
// notes} → Stripe's page; get {order}; mine. Staff approve each paid order before it goes to Gelato (api/print-staff).
const money = (n: number) => Math.round(n * 100) / 100;
const clean = (v: unknown, max: number) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

async function quote(b: any) {
  const product = productById(b.product);
  if (!product) throw new Error('Pick a product.');
  const priced = priceItem(product, b.picks ?? {});
  const cfg = await effectiveAddons(env);
  const tax = salesTax(cfg, priced.subtotal + priced.shipping);
  const fee = onlineFee(cfg, priced.subtotal);
  const total = money(priced.subtotal + priced.shipping + (tax?.amount ?? 0) + (fee?.amount ?? 0));
  return { product, priced, tax, fee, total };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const b: any = await request.json().catch(() => ({}));
    if (b.action === 'catalog') {
      return json({ products: activeProducts(), shipping: PRINT.shipping.price, min_dpi: PRINT.min_dpi, good_dpi: PRINT.good_dpi, max_quantity_online: PRINT.max_quantity_online, store: { name: store.name, address: store.address } });
    }
    if (b.action === 'quote') {
      const q = await quote(b);
      return json({ lines: q.priced.lines, subtotal: q.priced.subtotal, shipping: q.priced.shipping, tax: q.tax ?? null, fee: q.fee ?? null, total: q.total, files: filesNeeded(q.product, q.priced.picks.spots) });
    }
    // The rest needs a signed-in customer (their account gives the name, email and phone on the order).
    const meId = await readSession(env, request.headers.get('cookie')).catch(() => null);
    const me = meId ? await getCustomer(env, meId) : null;
    if (!me) return json({ error: 'Sign in to order.', signin: true }, 401);
    if (b.action === 'get') {
      const o = await getPrintOrder(env, String(b.order ?? ''));
      if (!o || o.customer_id !== me.id) return json({ error: 'No such order' }, 404);
      return json({ order: publicView(o) });
    }
    if (b.action === 'mine') return json({ orders: (await listPrintOrders(env, me.id, 50)).map(publicView) });
    if (b.action !== 'order') return json({ error: 'Unknown action' }, 400);

    const q = await quote(b);
    const product = q.product;
    // Artwork: one picture per printed side for shirts, or the page for posters and flyers.
    const need = product.kind === 'flat' ? [{ file: 'default' }] : filesNeeded(product, q.priced.picks.spots);
    const given: any[] = Array.isArray(b.art) ? b.art : [];
    const art: PrintOrder['art'] = [];
    for (const n of need) {
      const g = given.find((x) => x?.file === n.file);
      if (!g?.data) throw new Error(n.file === 'back' ? 'Add the design for the back.' : 'Add your design.');
      const a = readArt(String(g.data));
      // Posters and flyers: the file must be sharp enough for the paper size (the page makes it at print size).
      if (product.kind === 'flat') {
        const size = product.sizes.find((s) => s.id === q.priced.picks.size)!;
        const sh = sharpness(a, { w: size.w_in!, h: size.h_in! });
        if (sh.level === 'low') throw new Error(`That picture is too small to print sharp at ${size.name} (${sh.dpi} dots per inch; ${PRINT.min_dpi} at least). Use a bigger picture or a smaller size.`);
        if (Math.abs(a.w / a.h - size.w_in! / size.h_in!) > 0.03) throw new Error('The picture must be cropped to the paper size; use the page to place it.');
      }
      art.push({ file: n.file, id: await saveArt(env, a.bytes, a.type), w: a.w, h: a.h, type: a.type });
    }
    const shipTo: 'store' | 'home' = b.ship_to === 'home' ? 'home' : 'store';
    const o = store.origin;
    const address = shipTo === 'store'
      ? { name: me.name, line1: o.line_1, line2: o.line_2, city: o.city, state: o.state, zip: o.postal_code }
      : { name: clean(b.address?.name, 60) || me.name, line1: clean(b.address?.line1, 80), line2: clean(b.address?.line2, 80) || undefined, city: clean(b.address?.city, 40), state: clean(b.address?.state, 2).toUpperCase(), zip: clean(b.address?.zip, 10) };
    if (shipTo === 'home' && (!address.line1 || !address.city || !/^[A-Z]{2}$/.test(address.state) || !/^\d{5}(-\d{4})?$/.test(address.zip))) throw new Error('Type the full shipping address (street, city, 2-letter state, ZIP).');
    const order: PrintOrder = {
      id: newPrintId(), created_at: new Date().toISOString(), status: 'awaiting_payment',
      customer_id: me.id, customer: { name: me.name, email: me.email ?? '', phone: me.phone ?? null },
      product_id: product.id, product_name: product.name, picks: q.priced.picks, lines: q.priced.lines, quantity: q.priced.quantity,
      subtotal: q.priced.subtotal, shipping: q.priced.shipping, tax: q.tax, fee: q.fee, total: q.total, cost_estimate: q.priced.cost,
      ship_to: shipTo, address, art, notes: clean(b.notes, 300), history: [{ at: new Date().toISOString(), what: 'ordered online' }],
    };
    if (!order.customer.email) throw new Error('Your account needs an email address for the receipt.');
    await savePrintOrder(env, order);
    await indexPrintOrder(env, order);
    return json({ ok: true, order: order.id, url: await createPrintCheckout(env, order) });
  } catch (e: any) {
    return json({ error: e.message ?? 'Try again' }, 400);
  }
};

/** What the customer sees of their order (no costs, no internal notes). */
function publicView(o: PrintOrder) {
  return { id: o.id, created_at: o.created_at, status: o.status, product_name: o.product_name, lines: o.lines, subtotal: o.subtotal, shipping: o.shipping, tax: o.tax ?? null, fee: o.fee ?? null, total: o.total, ship_to: o.ship_to, tracking: o.tracking ?? null };
}
