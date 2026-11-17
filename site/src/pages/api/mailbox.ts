export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate, atLeast } from '../../lib/auth';
import { readSession } from '../../lib/session';
import { createMailboxCheckout, createCardSetup, ensureStripeCustomer } from '../../lib/stripe';
import { sendEmail } from '../../shipping/notify';
import {
  getCustomer, searchCustomers, logAudit, reserveMailbox, waitingReservation, listWaitingReservations, getReservation, setReservationStatus,
  assignMailbox, getMailbox, listAllMailboxes, updateMailbox, createRenewal, countMailboxDocs, type MailboxRow,
  countItemsIn, listMailboxItems, getMailboxItem, deleteMailboxItem, clearMailboxItems, getMailboxSettings, saveMailboxSettings,
  listMailboxCharges, settleMailboxCharges, addMailboxForward, listMailboxForwards, setMailboxForward, activeBox,
} from '../../shipping/store';
import { SIZES, sizeById, sizeForBox, isTerm, priceFor, addMonths, day, isDay, boxStatus, dueReminder, mailAction, onExpiredList, HOLD_MONTHS, KEEP_MONTHS } from '../../lib/mailbox';
import { sendReminder, sendDueReminders, holdEndNotices, extendedDate, logMail, chargeOverages, billOverages, autoRenewals, balanceFor } from '../../lib/mailboxJobs';
import { fullness } from '../../lib/mailbox';

// Physical mailboxes on the website (Peter, Nov 15 and 17 2026).
// Customer (signed in): reserve {size, term}, cancel_reservation, renew_checkout {id, term} (Stripe; the box is
//   extended when the payment comes back, in lib/mailboxJobs.ts payRenewal).
// Staff (PIN): list, find {q}, assign {customer_id, box_no, term, start_date?, reservation_code?},
//   adjust {id, months: 6, 12, -6 or -12} (add time, or take it back off; never to on or before the start date),
//   set_paid_through {id, date} (after the start date),
//   renew {id, term} (the same as adjust with a positive term), close {id}, remind {id} (one now),
//   send_due (every reminder due today, each once; also run every morning by src/worker.ts),
//   for_customer {customer_id} (their boxes, open and closed, and how many documents), search {q} (a box number or a name, email or phone: current and past boxes, with what to do with their mail).
// Ended boxes (expired or closed): mail is held HOLD_MONTHS, then returned to sender; listed for KEEP_MONTHS.
// Every change is audited.
// The counter's register stays the full record (IDs, the 1583, payments); this is what the website shows and sends.

export const POST: APIRoute = async ({ request }) => {
  try {
    const b: any = await request.json().catch(() => ({}));
    const today = day(new Date());

    // ---- customer
    if (['reserve', 'cancel_reservation', 'renew_checkout', 'card_setup', 'card_remove', 'set_prefs', 'forward_request', 'forward_cancel'].includes(b.action)) {
      const meId = await readSession(env, request.headers.get('cookie')).catch(() => null);
      const me = meId ? await getCustomer(env, meId) : null;
      if (!me) return json({ error: 'Sign in to reserve a mailbox.', signin: true }, 401);
      if (b.action === 'cancel_reservation') {
        const r = await waitingReservation(env, me.id);
        if (r) await setReservationStatus(env, r.id, 'cancelled');
        return json({ ok: true });
      }
      // The holder's dashboard (Peter, Nov 16 2026): card on file, automatic renewal, notices, forwarding.
      if (b.action === 'card_setup') {
        const st = await getMailboxSettings(env, me.id);
        const sc = await ensureStripeCustomer(env, me, st.stripe_customer_id);
        if (sc && sc !== st.stripe_customer_id) await saveMailboxSettings(env, me.id, { stripe_customer_id: sc });
        return json({ ok: true, url: await createCardSetup(env, { customer_id: me.id, stripe_customer_id: sc, added_by: 'customer', back: 'account' }) });
      }
      if (b.action === 'card_remove') {
        await saveMailboxSettings(env, me.id, { payment_method_id: null, card_brand: null, card_last4: null, card_exp: null, autorenew: 0 });
        await logAudit(env, { id: null, name: 'Customer (online)' }, 'mailbox.card_removed', me.id, null);
        return json({ ok: true });
      }
      if (b.action === 'set_prefs') {
        const st = await getMailboxSettings(env, me.id);
        const patch: Record<string, number> = {};
        for (const k of ['autorenew', 'notify_sms', 'notify_email'] as const) if (typeof b[k] === 'boolean') patch[k] = b[k] ? 1 : 0;
        if (patch.autorenew && !st.payment_method_id) return json({ error: 'Add a card first to turn on automatic renewal.' }, 400);
        const next = await saveMailboxSettings(env, me.id, patch);
        if ('autorenew' in patch) await logAudit(env, { id: null, name: 'Customer (online)' }, 'mailbox.autorenew_set', me.id, patch.autorenew ? 'on' : 'off');
        return json({ ok: true, settings: { autorenew: !!next.autorenew, notify_sms: !!next.notify_sms, notify_email: !!next.notify_email } });
      }
      if (b.action === 'forward_request') {
        const box = await getMailbox(env, Number(b.id));
        if (!box || box.status !== 'active' || box.customer_id !== me.id) return json({ error: 'No such mailbox on your account.' }, 404);
        const address = String(b.address ?? '').trim().slice(0, 300);
        if (address.length < 10) return json({ error: 'Enter the full address to forward to.' }, 400);
        const f = await addMailboxForward(env, { customer_id: me.id, mailbox_id: box.id, address, note: String(b.note ?? '').trim().slice(0, 300) || null });
        await logAudit(env, { id: null, name: 'Customer (online)' }, 'mailbox.forward_request', `#${box.box_no}`, address);
        if (env.STAFF_EMAIL) await sendEmail(env, env.STAFF_EMAIL, `Forwarding request: box #${box.box_no}`, `${me.name} asked to forward the mail in box #${box.box_no} to:\n\n${address}${f.note ? `\n\nNote: ${f.note}` : ''}\n\n${env.SITE_URL}/counter/mailboxes`).catch(() => {});
        return json({ ok: true, forward: f });
      }
      if (b.action === 'forward_cancel') {
        const f = (await listMailboxForwards(env, { customer_id: me.id, status: 'open' })).find((x) => x.id === Number(b.id));
        if (!f) return json({ error: 'No such request' }, 404);
        await setMailboxForward(env, f.id, 'cancelled', 'customer');
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

    // One box for the staff page: its holder, status, and what to do with its mail today.
    const people = new Map<string, any>();
    const person = async (id: string) => {
      if (!people.has(id)) people.set(id, await getCustomer(env, id));
      const c = people.get(id); return c ? { name: c.name, email: c.email, phone: c.phone } : { name: '?', email: null, phone: null };
    };
    let docCounts: Map<string, number> | null = null;
    let inBox: Awaited<ReturnType<typeof countItemsIn>> | null = null;
    const view = async (x: MailboxRow) => {
      docCounts ??= await countMailboxDocs(env);
      inBox ??= await countItemsIn(env);
      const n = inBox.get(x.id) ?? { letters: 0, packages: 0, last: null };
      return { ...x, customer: await person(x.customer_id), state: boxStatus(x, today), mail: mailAction(x, today), docs: docCounts.get(x.customer_id) ?? 0, inbox: { ...n, ...fullness(n.letters + n.packages, x.size) } };
    };

    if (b.action === 'list') {
      const [res, all] = await Promise.all([listWaitingReservations(env), listAllMailboxes(env)]);
      const open = all.filter((x) => x.status === 'active').sort((a, c) => a.box_no - c.box_no);
      const used = new Set(open.map((x) => x.box_no));
      const views = await Promise.all(open.map(view));
      // Ended boxes: the hold that's over first (return to sender), then the hold that ends soonest.
      const ended = (await Promise.all(all.filter((x) => onExpiredList(x, today)).map(view)))
        .sort((a, c) => (a.mail.do === 'rts' ? 0 : 1) - (c.mail.do === 'rts' ? 0 : 1) || ((a.mail as any).until ?? '').localeCompare((c.mail as any).until ?? ''));
      return json({
        today, hold_months: HOLD_MONTHS, keep_months: KEEP_MONTHS,
        sizes: SIZES.map((s) => ({ ...s, free: Array.from({ length: s.to - s.from + 1 }, (_, i) => s.from + i).filter((n) => !used.has(n)).length })),
        reservations: await Promise.all(res.map(async (r) => ({ ...r, customer: await person(r.customer_id), price: priceFor(r.size as any, r.term as any) }))),
        boxes: views.filter((x) => x.mail.do === 'box').map((x) => ({ ...x, due: dueReminder({ ...x, reminders: JSON.parse(x.reminders) }, today) })),
        forwards: await Promise.all((await listMailboxForwards(env, { status: 'open' })).map(async (f) => ({ ...f, box_no: all.find((x) => x.id === f.mailbox_id)?.box_no ?? null, customer: await person(f.customer_id) }))),
        ended,
      });
    }
    if (b.action === 'for_customer') { // the Customers page's Mailbox section: every box they've had, newest first
      const id = String(b.customer_id ?? '');
      const mine = (await listAllMailboxes(env)).filter((x) => x.customer_id === id);
      mine.sort((a, c) => (a.status === 'active' ? 0 : 1) - (c.status === 'active' ? 0 : 1) || c.id - a.id);
      const docs = (await countMailboxDocs(env)).get(id) ?? 0;
      return json({ boxes: await Promise.all(mine.map(view)), docs, reservation: (await listWaitingReservations(env)).find((r) => r.customer_id === id) ?? null });
    }
    if (b.action === 'search') {
      const q = String(b.q ?? '').trim().slice(0, 60);
      if (!q) return json({ boxes: [] });
      const all = await listAllMailboxes(env);
      const num = /^#?\s*(\d{3,5})$/.exec(q);
      let hits: MailboxRow[];
      if (num) hits = all.filter((x) => x.box_no === Number(num[1]));
      else {
        const ids = new Set((await searchCustomers(env, q, 20)).customers.map((c) => c.id));
        hits = all.filter((x) => ids.has(x.customer_id));
      }
      // The box's current holder first, then past holders, newest first.
      hits.sort((a, c) => (a.status === 'active' ? 0 : 1) - (c.status === 'active' ? 0 : 1) || c.id - a.id);
      return json({ boxes: await Promise.all(hits.slice(0, 20).map(view)) });
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
    // ---- the mail log (Peter, Nov 16 2026)
    if (b.action === 'mail_in') {
      const box = await activeBox(env, Number(String(b.box_no ?? '').replace(/\D/g, '')));
      if (!box) return json({ error: `No open box #${b.box_no} on the website.` }, 404);
      const kind = b.kind === 'package' ? 'package' : 'letter';
      const r = await logMail(env, who, box, kind, String(b.note ?? '').trim().slice(0, 120) || null, today);
      await logAudit(env, who, 'mailbox.mail_in', `#${box.box_no}`, `${kind}${r.over ? ' · OVER CAPACITY' : ''}${r.notified ? ' · holder notified' : ''}`);
      return json({ ok: true, ...r, box_no: box.box_no, customer: await person(box.customer_id) });
    }
    if (b.action === 'mail_undo') {
      const it = await getMailboxItem(env, Number(b.item_id));
      if (!it || it.status !== 'in') return json({ error: 'That piece is already out of the box.' }, 404);
      await deleteMailboxItem(env, it.id);
      const fee = (await listMailboxCharges(env, { customer_id: it.customer_id, status: 'unbilled' })).find((c) => c.description.endsWith(`(piece ${it.id})`));
      if (fee) await settleMailboxCharges(env, [fee.id], 'waived', `undo by ${who.name}`);
      await logAudit(env, who, 'mailbox.mail_undo', `#${it.box_no}`, `${it.kind} logged ${it.arrived_at}`);
      return json({ ok: true });
    }
    if (b.action === 'forward_set') {
      if (!['done', 'cancelled'].includes(b.status)) return json({ error: 'Pick done or cancelled' }, 400);
      await setMailboxForward(env, Number(b.id), b.status, who.name);
      await logAudit(env, who, 'mailbox.forward_' + b.status, String(b.id), null);
      return json({ ok: true });
    }
    if (b.action === 'run_billing') {
      if (!atLeast(user, 'manager')) return json({ error: 'Only a manager or owner can run billing.' }, 403);
      const renewed = await autoRenewals(env, today);
      const overages = await billOverages(env);
      return json({ ok: true, renewed, overages });
    }
    // Card and charges for one holder.
    if (['card_link', 'set_autorenew', 'charge_now', 'paid_counter', 'waive'].includes(b.action)) {
      const c = await getCustomer(env, String(b.customer_id ?? ''));
      if (!c) return json({ error: 'No such customer' }, 404);
      if (b.action === 'card_link') {
        if (b.agreed !== true) return json({ error: 'The customer has to agree to automatic charges first.' }, 400);
        const st = await getMailboxSettings(env, c.id);
        const sc = await ensureStripeCustomer(env, c, st.stripe_customer_id);
        if (sc && sc !== st.stripe_customer_id) await saveMailboxSettings(env, c.id, { stripe_customer_id: sc });
        await logAudit(env, who, 'mailbox.card_link', c.id, 'customer agreed to automatic charges');
        return json({ ok: true, url: await createCardSetup(env, { customer_id: c.id, stripe_customer_id: sc, added_by: who.name, back: 'counter' }) });
      }
      if (b.action === 'set_autorenew') {
        const st = await getMailboxSettings(env, c.id);
        if (b.on && !st.payment_method_id) return json({ error: 'Add a card first.' }, 400);
        await saveMailboxSettings(env, c.id, { autorenew: b.on ? 1 : 0 });
        await logAudit(env, who, 'mailbox.autorenew_set', c.id, b.on ? 'on' : 'off');
        return json({ ok: true });
      }
      if (b.action === 'charge_now') {
        if (!atLeast(user, 'manager')) return json({ error: 'Only a manager or owner can charge a card.' }, 403);
        const r = await chargeOverages(env, c.id, { retryFailed: true });
        await logAudit(env, who, 'mailbox.charge_now', c.id, JSON.stringify(r));
        return json({ ok: true, ...r });
      }
      const due = (await listMailboxCharges(env, { customer_id: c.id })).filter((x) => x.status === 'unbilled' || x.status === 'failed');
      if (b.action === 'waive' && !atLeast(user, 'manager')) return json({ error: 'Only a manager or owner can waive fees.' }, 403);
      await settleMailboxCharges(env, due.map((x) => x.id), b.action === 'waive' ? 'waived' : 'paid_counter', who.name);
      const total = Math.round(due.reduce((a, x) => a + x.amount, 0) * 100) / 100;
      await logAudit(env, who, `mailbox.${b.action}`, c.id, `$${total.toFixed(2)}, ${due.length} charge${due.length === 1 ? '' : 's'}`);
      return json({ ok: true, total });
    }
    if (b.action === 'forwards') {
      const open = await listMailboxForwards(env, { status: 'open' });
      const all = await listAllMailboxes(env);
      return json({ forwards: await Promise.all(open.map(async (f) => ({ ...f, box_no: all.find((x) => x.id === f.mailbox_id)?.box_no ?? null, customer: await person(f.customer_id) }))) });
    }

    if (b.action === 'send_due') {
      const sent = await sendDueReminders(env, who, today);
      const holds_ended = await holdEndNotices(env, today);
      return json({ ok: true, sent, holds_ended });
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
    if (b.action === 'box_detail') { // the Edit window: what's in the box, the card, money owed, forwarding
      const st = await getMailboxSettings(env, box.customer_id);
      const bal = await balanceFor(env, box.customer_id);
      return json({
        items: await listMailboxItems(env, box.id, true),
        card: st.payment_method_id ? { brand: st.card_brand, last4: st.card_last4, exp: st.card_exp, added_by: st.card_added_by, added_at: st.card_added_at } : null,
        autorenew: !!st.autorenew, balance: { due: bal.due, pieces: bal.pieces, declined: bal.declined },
        charges: bal.charges.slice(0, 20), forwards: await listMailboxForwards(env, { customer_id: box.customer_id, status: 'open' }),
        can_charge: atLeast(user, 'manager'),
      });
    }
    if (b.action === 'pickup') {
      const how = ['picked_up', 'forwarded', 'returned'].includes(b.how) ? b.how : 'picked_up';
      const n = await clearMailboxItems(env, box.id, how);
      await logAudit(env, who, 'mailbox.pickup', `#${box.box_no}`, `${n} piece${n === 1 ? '' : 's'} ${how.replace('_', ' ')}`);
      return json({ ok: true, n });
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
