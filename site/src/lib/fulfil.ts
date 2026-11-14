// Shared "buy the label now" step, used after Stripe pays (domestic) or after
// staff ring a reserved order up on the POS (international). Routes to whichever
// carrier adapter produced the chosen rate, then records the shipment in PeterShip's
// own store so tracking, the printer agent and the reports can see it.
import { buyLabel } from '../shipping/engine';
import { recordShipment, recordOrderAddons } from '../shipping/store';
import { saveOrder, type Order } from './orders';
import { returnParcel } from './options';

export async function fulfil(env: Env, order: Order, paidVia: 'stripe' | 'pos' | 'mock' | 'account' = order.international ? 'pos' : env.STRIPE_SECRET_KEY ? 'stripe' : 'mock'): Promise<Order> {
  if (order.status === 'labeled' || order.status === 'printed') return order; // idempotent
  // Insurance the customer paid for goes on the label as the carrier's own insurance (Peter, Nov 14 2026).
  const parcel = order.insurance?.declared_usd ? { ...order.parcel, insured_usd: order.insurance.declared_usd } : order.parcel;
  const label = await buyLabel(env, order.origin, order.destination, parcel, order.rate.id, { qr: true, zpl: true });
  // "Return label included": the second label runs from the destination back to the origin, without the
  // outgoing extras (no signature, no insurance). Recorded as its own shipment, code + "-R".
  // If it fails, the paid outgoing label still stands: the counter page shows the return label as not bought yet.
  let return_label = order.return_label;
  if (order.return_rate && !return_label) {
    try { return_label = await buyLabel(env, order.destination, order.origin, returnParcel(order.parcel), order.return_rate.id, { qr: true, zpl: true }); }
    catch (e) { console.error('return label failed', order.id, e); }
  }
  const next: Order = { ...order, status: 'labeled', paid_at: order.paid_at ?? new Date().toISOString(), label, ...(return_label ? { return_label } : {}) };
  await saveOrder(env, next);
  await recordShipment(env, next, label, paidVia).catch((e) => console.error('shipment record failed', e));
  if (return_label && order.return_rate) await recordShipment(env, { ...next, id: `${next.id}-R`, origin: next.destination, destination: next.origin, parcel: returnParcel(next.parcel), rate: order.return_rate, kind: 'return' }, return_label, paidVia).catch((e) => console.error('return shipment record failed', e));
  await recordOrderAddons(env, next).catch((e) => console.error('add-on record failed', e));
  return next;
}
