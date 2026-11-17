export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate } from '../../lib/auth';
import { readSession } from '../../lib/session';
import { createMailboxCheckout } from '../../lib/stripe';
import {
  getCustomer, searchCustomers, logAudit, reserveMailbox, waitingReservation, listWaitingReservations, getReservation, setReservationStatus,
  assignMailbox, getMailbox, listActiveMailboxes, updateMailbox, createRenewal,
} from '../../shipping/store';
import { SIZES, sizeById, sizeForBox, isTerm, priceFor, addMonths, day, isDay, boxStatus, dueReminder } from '../../lib/mailbox';
import { sendReminder, sendDueReminders, extendedDate } from '../../lib/mailboxJobs';

// Physical mailboxes on the website (Peter, Nov 15 and 17 2026).
// Customer (signed in): reserve {size, term}, cancel_reservation, renew_checkout {id, term} (Stripe; the box is
//   extended when the payment comes back, in lib/mailboxJobs.ts payRenewal).
// Staff (PIN): list, find {q}, assign {customer_id, box_no, term, start_date?, reservation_code?},
//   adjust {id, months: 6, 12, -6 or -12} (add time, or take it back off; never to on or before the start date),
//   set_paid_through {id, date} (after the start date),
//   renew {id, term} (the same as adjust with a positive term), close {id}, remind {id} (one now),
//   send_due (every reminder due today, each once; also run every morning by src/worker.ts). Every change is audited.
// The counter's register stays the full record (IDs, the 1583, payments); this is what the website shows and sends.

export const POST: APIRoute = async ({ request }) => {
  try {
    const b: any = await request.json().catch(() => ({}));
    const today = day(new Date());

    // ---- customer
    if (b.action === 'reserve' || b.action === 'cancel_reservation' || b.action === 'renew_checkout') {
      const meId = await readSession(env, request.headers.get('cookie')).catch(() => null);
      const me = meId ? await getCustomer(env, meId) : null;
      if (!me) return json({ error: 'Sign in to reserve a mailbox.', signin: true }, 401);
      if (b.action === 'cancel_reservation') {
        const r = await waitingReservation(env, me.id);
        if (r) await setReservationStatus(env, r.id, 'cancelled');
        return json({ ok: true });
      }
      if (b.action === 'renew_checkout') {
        const box = await getMailbox(env, Number(b.id));
        if (!box || box.status !== 'active' || box.customer_id !== me.id) return json({ error: 'No such mailbox on your account.' }, 404);
        const term = Number(b.term);
        if (!isTerm(term)) return json({ error: 'Pick 6 months or a year.' }, 400);
        const amount = priceFor(box.size as any, term);
        if (amount == null) return json({ error: 'This box has no online price. Renew at the counter.' }, 400);
        const r = await createRenewal(env, { mailbox_id: box.id, customer_id: me.id, term, amount });
        const url = await createMailboxCheckout(env, { code: r.code, email: me.email, amount, box_no: box.box_no, term, new_paid_through: extendedDate(box, term, today) });
        return json({ ok: true, url, code: r.code });
      }
      const size = sizeById(String(b.size ?? ''));
      const term = Number(b.term);
      if (!size) return json({ error: 'Pick a mailbox size.' }, 400);
      if (!isTerm(term)) return json({ error: 'Pick 6 months or a year.' }, 400);
      const r = await reserveMailbox(env, { customer_id: me.id, size: size.id, term });
      return json({ ok: true, reservation: { code: r.code, size: size.id, term, price: priceFor(size.id, term) } });
    }

    // ---- staff
    const user = await authenticate(env, b.pin);
    if (!user) return json({ error: 'Wrong PIN' }, 401);
    const who = { id: user.id, name: user.name };

    if (b.action === 'list') {
      const [res, boxes] = await Promise.all([listWaitingReservations(env), listActiveMailboxes(env)]);
      const people = new Map<string, any>();
      for (const id of new Set([...res.map((r) => r.customer_id), ...boxes.map((x) => x.customer_id)])) people.set(id, await getCustomer(env, id));
      const person = (id: string) => { const c = people.get(id); return c ? { name: c.name, email: c.email, phone: c.phone } : { name: '?', email: null, phone: null }; };
      const used = new Set(boxes.map((x) => x.box_no));
      return json({
        today,
        sizes: SIZES.map((s) => ({ ...s, free: Array.from({ length: s.to - s.from + 1 }, (_, i) => s.from + i).filter((n) => !used.has(n)).length })),
        reservations: res.map((r) => ({ ...r, customer: person(r.customer_id), price: priceFor(r.size as any, r.term as any) })),
        boxes: boxes.map((x) => ({ ...x, customer: person(x.customer_id), state: boxStatus(x, today), due: dueReminder({ ...x, reminders: JSON.parse(x.reminders) }, today) })),
      });
    }
    if (b.action === 'find') {
      const { customers } = await searchCustomers(env, String(b.q ?? '').slice(0, 60), 10);
      return json({ customers: customers.map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone })) });
    }
    if (b.action === 'assign') {
      const boxNo = Number(b.box_no);
      const size = sizeForBox(boxNo);
      if (!size) return json({ error: `Box #${b.box_no} is not in any size's range (${SIZES.map((s) => `${s.name} ${s.from}-${s.to}`).join(', ')}).` }, 400);
      const term = Number(b.term);
      if (!isTerm(term)) return json({ error: 'Term must be 6 or 12 months.' }, 400);
      const customer = await getCustomer(env, String(b.customer_id ?? ''));
      if (!customer) return json({ error: 'Pick the customer’s account first.' }, 400);
      const start = isDay(b.start_date) ? b.start_date : today;
      const paid_through = isDay(b.paid_through) ? b.paid_through : addMonths(start, term);
      const box = await assignMailbox(env, { box_no: boxNo, customer_id: customer.id, size: size.id, term, start_date: start, paid_through });
      if (b.reservation_code) { const r = await getReservation(env, String(b.reservation_code)); if (r && r.customer_id === customer.id) await setReservationStatus(env, r.id, 'done'); }
      await logAudit(env, who, 'mailbox.assign', `#${boxNo}`, `${customer.name} · ${size.name} · ${term} months · paid through ${paid_through}`);
      return json({ ok: true, box });
    }
    if (b.action === 'send_due') {
      return json({ ok: true, sent: await sendDueReminders(env, who, today) });
    }

    const box = b.id != null ? await getMailbox(env, Number(b.id)) : null;
    if (!box || box.status !== 'active') return json({ error: 'No such open box' }, 404);

    if (b.action === 'renew' || b.action === 'adjust') {
      const months = Number(b.action === 'renew' ? b.term : b.months);
      if (![6, 12, -6, -12].includes(months)) return json({ error: 'Add or take off 6 or 12 months.' }, 400);
      // Adding time on a box that's still paid adds to its date; on a lapsed box it starts again from today.
      // Taking time off counts back from the current date, never to before the box started.
      const paid_through = months > 0 ? extendedDate(box, months, today) : addMonths(box.paid_through, months);
      if (paid_through <= box.start_date) return json({ error: `That would end before the box started (${box.start_date}). Set the date instead, or close the box.` }, 400);
      await updateMailbox(env, box.id, { paid_through, ...(months > 0 ? { term: months } : {}) });
      await logAudit(env, who, months > 0 ? 'mailbox.renew' : 'mailbox.undo', `#${box.box_no}`, `${months > 0 ? '+' : ''}${months} months · paid through ${box.paid_through} → ${paid_through}`);
      return json({ ok: true, paid_through });
    }
    if (b.action === 'set_paid_through') {
      if (!isDay(b.date)) return json({ error: 'Pick a date.' }, 400);
      if (b.date <= box.start_date) return json({ error: `Pick a date after the box started (${box.start_date}).` }, 400);
      await updateMailbox(env, box.id, { paid_through: b.date });
      await logAudit(env, who, 'mailbox.set_date', `#${box.box_no}`, `paid through ${box.paid_through} → ${b.date}`);
      return json({ ok: true, paid_through: b.date });
    }
    if (b.action === 'close') {
      await updateMailbox(env, box.id, { status: 'closed', closed_at: new Date().toISOString() });
      await logAudit(env, who, 'mailbox.close', `#${box.box_no}`, null);
      return json({ ok: true });
    }
    if (b.action === 'remind') {
      const left = Math.round((Date.parse(box.paid_through) - Date.parse(today)) / 86_400_000);
      const sent = await sendReminder(env, box, `${box.paid_through}:${left < 0 ? 'over' : String(left)}`);
      await logAudit(env, who, 'mailbox.remind', `#${box.box_no}`, `by hand · text ${sent.sms ? 'sent' : 'no phone'} · email ${sent.email ? 'sent' : 'no email'}`);
      return json({ ok: true, ...sent });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? 'Try again' }, /already in use/.test(e?.message ?? '') ? 409 : 500);
  }
};
