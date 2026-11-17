// Mailbox work that changes data or sends messages (Peter, Nov 17 2026): reminders, extending a box, and
// recording an online renewal once Stripe says it's paid. Shared by /api/mailbox (staff buttons and the
// customer's Renew online), /api/mock-paid and the Stripe webhook, and the daily scheduled run in src/worker.ts.
// Everything takes env as an argument (no cloudflare:workers import) so the scheduled run can call it too.
import { store } from '../data/store';
import { sendEmail, sendSms } from '../shipping/notify';
import { getCustomer, listActiveMailboxes, listAllMailboxes, updateMailbox, getMailbox, logAudit, claimRenewal, getRenewal, setRenewalPaidThrough, type MailboxRow,
  addMailboxItem, countItemsIn, addMailboxCharge, listMailboxCharges, settleMailboxCharges, getMailboxSettings, saveMailboxSettings, type MailboxCharge } from '../shipping/store';
import { chargeSavedCard } from './stripe';
import { addMonths, addressFor, day, dueReminder, reminderText, mailAction, onExpiredList, HOLD_MONTHS as HOLD, fullness, OVERAGE_FEE, MIN_CHARGE, priceFor, money } from './mailbox';

/** Text and email one reminder. "sms"/"email" say whether the holder had a number/address to send to. */
export async function sendReminder(env: Env, b: MailboxRow, key: string): Promise<{ sms: boolean; email: boolean; to: string }> {
  const c = await getCustomer(env, b.customer_id);
  // With automatic renewal on and a card on file, the reminder says it will renew by itself.
  const st = await getMailboxSettings(env, b.customer_id);
  const amount = priceFor(b.size as any, b.term as any);
  const auto = st.autorenew && st.payment_method_id && st.card_last4 && amount != null ? { amount, last4: st.card_last4, term: b.term } : null;
  const msg = reminderText(b, key, store, env.SITE_URL ? `${env.SITE_URL}/account#mailbox` : null, auto);
  // sendSms/sendEmail return true only in mock mode, so "sent" here means "we had a number/address and it went".
  const sms = c?.phone ? (await sendSms(env, c.phone, msg.sms), true) : false;
  const email = c?.email ? (await sendEmail(env, c.email, msg.subject, msg.email + `\n\nYour mailbox address: ${addressFor(b.box_no)}`), true) : false;
  return { sms, email, to: c?.name ?? '' };
}

/** Every reminder due today, each sent once (its key is recorded on the box). Audited as one line. */
export async function sendDueReminders(env: Env, who: { id: number | null; name: string }, today = day(new Date())) {
  const out: { box_no: number; name: string; key: string; sms: boolean; email: boolean }[] = [];
  for (const x of await listActiveMailboxes(env)) {
    const reminders: string[] = JSON.parse(x.reminders);
    const key = dueReminder({ ...x, reminders }, today);
    if (!key) continue;
    try {
      const sent = await sendReminder(env, x, key);
      await updateMailbox(env, x.id, { reminders: JSON.stringify([...reminders, key].slice(-20)) });
      out.push({ box_no: x.box_no, name: sent.to, key, sms: sent.sms, email: sent.email });
    } catch (e) {
      console.error(`mailbox reminder #${x.box_no}:`, e); // one bad number doesn't stop the rest; tomorrow's run tries again
    }
  }
  await logAudit(env, who, 'mailbox.send_due', null, out.length ? out.map((o) => `#${o.box_no} (${o.key.split(':')[1]})`).join(', ') : 'none due');
  return out;
}

/** The paid-through date after adding a term: from the current date if it's still paid, from today if it lapsed. */
export const extendedDate = (b: { paid_through: string }, months: number, today = day(new Date())) =>
  addMonths(b.paid_through >= today ? b.paid_through : today, months);

/**
 * Record a paid online renewal and extend the box, once. Called by the Stripe webhook and, in demo mode, by
 * /api/mock-paid. Returns the box's new paid-through date, or null if there was nothing to do.
 */
export async function payRenewal(env: Env, code: string, sessionId: string | null): Promise<string | null> {
  const r = await getRenewal(env, code);
  if (!r || !(await claimRenewal(env, code, sessionId))) return null;
  const box = await getMailbox(env, r.mailbox_id);
  if (!box || box.status !== 'active') {
    await logAudit(env, { id: null, name: 'Customer (online)' }, 'mailbox.renew_online', code, `PAID but box ${r.mailbox_id} is closed: refund or reopen by hand ($${r.amount})`);
    return null;
  }
  const paid_through = extendedDate(box, r.term);
  await updateMailbox(env, box.id, { term: r.term, paid_through });
  await setRenewalPaidThrough(env, code, paid_through);
  await logAudit(env, { id: null, name: 'Customer (online)' }, 'mailbox.renew_online', `#${box.box_no}`, `${code} · ${r.term} months · $${r.amount} · paid through ${paid_through}`);
  const c = await getCustomer(env, box.customer_id);
  const when = new Date(paid_through + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  try {
    if (c?.email) await sendEmail(env, c.email, `Mailbox #${box.box_no} renewed`, `Thank you! Your mailbox #${box.box_no} at ${store.name} is now paid through ${when}.\n\nAmount paid: $${r.amount.toFixed(2)} (${r.term === 12 ? '1 year' : '6 months'}). Receipt number ${code}.\n\nYour mailbox address: ${addressFor(box.box_no)}\n\nQuestions? Call us at ${store.phone}.`);
  } catch (e) { console.error('renewal email:', e); }
  return paid_through;
}

/**
 * Holds that are over (Peter, Nov 16 2026): a box ended HOLD_MONTHS ago, so its mail now goes back to the sender.
 * Emails STAFF_EMAIL once per box (the key "<ended>:holdend" is recorded on the box) and audits it. Without
 * STAFF_EMAIL nothing is sent or recorded; the staff Mailboxes page shows the same list in red either way.
 */
export async function holdEndNotices(env: Env, today = day(new Date())) {
  if (!env.STAFF_EMAIL) return [];
  const due: { box: MailboxRow; ended: string; key: string }[] = [];
  for (const b of await listAllMailboxes(env)) {
    const m = mailAction(b, today);
    if (m.do !== 'rts' || !onExpiredList(b, today)) continue;
    const key = `${m.ended}:holdend`;
    if (!(JSON.parse(b.reminders) as string[]).includes(key)) due.push({ box: b, ended: m.ended, key });
  }
  if (!due.length) return [];
  const lines: string[] = [];
  for (const d of due) {
    const c = await getCustomer(env, d.box.customer_id);
    lines.push(`#${d.box.box_no}  ${c?.name ?? '?'}  (ended ${d.ended})`);
  }
  await sendEmail(env, env.STAFF_EMAIL, `Stop holding mail: ${due.length} mailbox${due.length === 1 ? '' : 'es'}`,
    `The ${HOLD}-month hold is over for these mailboxes. From today, return their mail to sender:\n\n${lines.join('\n')}\n\n${env.SITE_URL}/counter/mailboxes`);
  for (const d of due) await updateMailbox(env, d.box.id, { reminders: JSON.stringify([...(JSON.parse(d.box.reminders) as string[]), d.key].slice(-20)) });
  await logAudit(env, { id: null, name: 'Daily reminders (automatic)' }, 'mailbox.hold_end', null, due.map((d) => `#${d.box.box_no}`).join(', '));
  return due.map((d) => d.box.box_no);
}

// ---- The mail log, overages, automatic charges (Peter, Nov 16 2026) -------------------------------------
const AUTO = { id: null, name: 'Daily billing (automatic)' };
const when = (ymd: string) => new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/**
 * Staff put one piece in a box. If the box was already full, the piece costs OVERAGE_FEE (an unbilled charge).
 * The holder hears "You've got mail" once a day, on the first piece (by text and/or email, per their settings).
 */
export async function logMail(env: Env, who: { id: number | null; name: string }, box: MailboxRow, kind: 'letter' | 'package', note: string | null, today = day(new Date())) {
  const before = (await countItemsIn(env)).get(box.id);
  const f = fullness((before?.letters ?? 0) + (before?.packages ?? 0), box.size);
  const item = await addMailboxItem(env, { mailbox_id: box.id, customer_id: box.customer_id, box_no: box.box_no, kind, note, over: f.full ? 1 : 0, by_name: who.name });
  if (f.full) await addMailboxCharge(env, { customer_id: box.customer_id, mailbox_id: box.id, kind: 'overage', amount: OVERAGE_FEE, description: `Over capacity: ${kind} on ${today}, box #${box.box_no} (piece ${item.id})` });
  // "You've got mail", once a day per box (the key "<day>:mail" is kept with the box's reminder keys).
  const keys: string[] = JSON.parse(box.reminders);
  const key = `${today}:mail`;
  let notified = false;
  if (!keys.includes(key)) {
    const c = await getCustomer(env, box.customer_id);
    const st = await getMailboxSettings(env, box.customer_id);
    const full = fullness(f.pieces + 1, box.size);
    const tail = full.full ? ` Your box is full (${full.pieces} of ${full.capacity}); each extra piece is ${money(OVERAGE_FEE)}, so stop by soon.` : '';
    const link = env.SITE_URL ? ` See it: ${env.SITE_URL}/account#mailbox` : '';
    try {
      if (st.notify_sms && c?.phone) { await sendSms(env, c.phone, `${store.name}: You've got mail! New mail arrived in box #${box.box_no} today.${tail}${link}`); notified = true; }
      if (st.notify_email && c?.email) { await sendEmail(env, c.email, `You've got mail in box #${box.box_no}`, `New mail arrived in your mailbox #${box.box_no} at ${store.name} today.${tail}\n\nPick it up during store hours.${link ? `\n\nYour mailbox dashboard: ${env.SITE_URL}/account#mailbox` : ''}\n\nTo stop these messages, change your notification settings on your dashboard.`); notified = true; }
    } catch (e) { console.error('mail notice:', e); }
    await updateMailbox(env, box.id, { reminders: JSON.stringify([...keys, key].slice(-20)) });
  }
  return { item, pieces: f.pieces + 1, capacity: f.capacity, over: !!f.full, notified };
}

/** Charge a holder's unbilled (and, when asked, failed) overages to their card. Small totals wait for MIN_CHARGE. */
export async function chargeOverages(env: Env, customerId: string, opts: { retryFailed?: boolean } = {}) {
  const st = await getMailboxSettings(env, customerId);
  const rows = (await listMailboxCharges(env, { customer_id: customerId })).filter((c) => c.kind === 'overage' && (c.status === 'unbilled' || (opts.retryFailed && c.status === 'failed')));
  const total = Math.round(rows.reduce((a, c) => a + c.amount, 0) * 100) / 100;
  if (!rows.length) return { charged: 0, status: 'nothing' as const };
  if (!st.payment_method_id) return { charged: 0, status: 'no_card' as const, total };
  if (total < MIN_CHARGE) return { charged: 0, status: 'too_small' as const, total };
  const r = await chargeSavedCard(env, { stripe_customer_id: st.stripe_customer_id, payment_method_id: st.payment_method_id, amount: total, description: `${store.name} mailbox overage, ${rows.length} piece${rows.length === 1 ? '' : 's'}` });
  const ids = rows.map((c) => c.id);
  const c = await getCustomer(env, customerId);
  if (r.ok) {
    await settleMailboxCharges(env, ids, 'paid', r.ref);
    if (c?.email) await sendEmail(env, c.email, `Receipt: mailbox overage ${money(total)}`, `We charged ${money(total)} to your card ending ${st.card_last4} for ${rows.length} piece${rows.length === 1 ? '' : 's'} of mail over your box's limit (${money(OVERAGE_FEE)} each).\n\nReference ${r.ref}. Questions? Call us at ${store.phone}.`).catch(() => {});
    return { charged: total, status: 'paid' as const, ref: r.ref };
  }
  await settleMailboxCharges(env, ids, 'failed', null);
  if (env.STAFF_EMAIL) await sendEmail(env, env.STAFF_EMAIL, `Card declined: ${c?.name ?? customerId}`, `The overage charge of ${money(total)} to the card ending ${st.card_last4} was declined: ${r.error}\n\n${env.SITE_URL}/counter/mailboxes`).catch(() => {});
  return { charged: 0, status: 'failed' as const, error: r.error, total };
}

/** Every holder's unbilled overages, charged once a day (run by src/worker.ts). */
export async function billOverages(env: Env) {
  const who = new Set((await listMailboxCharges(env, { status: 'unbilled' })).filter((c) => c.kind === 'overage').map((c) => c.customer_id));
  const out: { customer_id: string; status: string; charged: number }[] = [];
  for (const id of who) out.push({ customer_id: id, ...(await chargeOverages(env, id)) });
  const paid = out.filter((o) => o.status === 'paid');
  if (out.length) await logAudit(env, AUTO, 'mailbox.bill_overages', null, out.map((o) => `${o.customer_id} ${o.status}${o.charged ? ` ${money(o.charged)}` : ''}`).join(', '));
  return { paid: paid.length, total: Math.round(paid.reduce((a, o) => a + o.charged, 0) * 100) / 100, results: out };
}

/**
 * Automatic renewal: on a box's paid-through date (or within 30 days after, if a run was missed), charge its
 * term's price to the card on file and extend it. A declined card is tried once per paid-through date; the
 * holder and staff are emailed, and the box then runs out as usual.
 */
export async function autoRenewals(env: Env, today = day(new Date())) {
  const out: { box_no: number; ok: boolean; paid_through?: string; error?: string }[] = [];
  for (const b of await listActiveMailboxes(env)) {
    if (b.paid_through > today || b.paid_through < addMonths(today, -1)) continue;
    const st = await getMailboxSettings(env, b.customer_id);
    if (!st.autorenew || !st.payment_method_id) continue;
    const keys: string[] = JSON.parse(b.reminders);
    const failKey = `${b.paid_through}:autorenew_failed`;
    if (keys.includes(failKey)) continue;
    const amount = priceFor(b.size as any, b.term as any);
    if (amount == null) continue;
    const c = await getCustomer(env, b.customer_id);
    const r = await chargeSavedCard(env, { stripe_customer_id: st.stripe_customer_id, payment_method_id: st.payment_method_id, amount, description: `${store.name} mailbox #${b.box_no}, ${b.term === 12 ? '1 year' : '6 months'}` });
    if (r.ok) {
      const paid_through = extendedDate(b, b.term, today);
      await updateMailbox(env, b.id, { paid_through });
      await addMailboxCharge(env, { customer_id: b.customer_id, mailbox_id: b.id, kind: 'renewal', amount, description: `Automatic renewal, box #${b.box_no}, ${b.term} months, paid through ${paid_through}`, status: 'paid', payment_ref: r.ref, paid_at: new Date().toISOString() });
      await logAudit(env, AUTO, 'mailbox.autorenew', `#${b.box_no}`, `${money(amount)} · paid through ${paid_through} · ${r.ref}`);
      if (c?.email) await sendEmail(env, c.email, `Mailbox #${b.box_no} renewed`, `Your mailbox #${b.box_no} renewed automatically. We charged ${money(amount)} to your card ending ${st.card_last4}. It's now paid through ${when(paid_through)}.\n\nQuestions? Call us at ${store.phone}.`).catch(() => {});
      out.push({ box_no: b.box_no, ok: true, paid_through });
    } else {
      await updateMailbox(env, b.id, { reminders: JSON.stringify([...keys, failKey].slice(-20)) });
      await addMailboxCharge(env, { customer_id: b.customer_id, mailbox_id: b.id, kind: 'renewal', amount, description: `Automatic renewal declined, box #${b.box_no}: ${r.error}`, status: 'failed' });
      await logAudit(env, AUTO, 'mailbox.autorenew_failed', `#${b.box_no}`, r.error);
      if (c?.email) await sendEmail(env, c.email, `We couldn't renew mailbox #${b.box_no}`, `We tried to renew your mailbox #${b.box_no} with your card ending ${st.card_last4}, but it was declined. Please update your card on your mailbox dashboard (${env.SITE_URL}/account#mailbox) or renew at the counter.\n\nQuestions? Call us at ${store.phone}.`).catch(() => {});
      if (env.STAFF_EMAIL) await sendEmail(env, env.STAFF_EMAIL, `Automatic renewal declined: box #${b.box_no}`, `${c?.name ?? ''}: ${r.error}\n\n${env.SITE_URL}/counter/mailboxes`).catch(() => {});
      out.push({ box_no: b.box_no, ok: false, error: r.error });
    }
  }
  return out;
}

/** A holder's money summary: what's unbilled or declined, for the dashboard and the staff Edit window. */
export async function balanceFor(env: Env, customerId: string) {
  const all = await listMailboxCharges(env, { customer_id: customerId });
  const due = all.filter((c) => c.status === 'unbilled' || c.status === 'failed');
  return { due: Math.round(due.reduce((a, c) => a + c.amount, 0) * 100) / 100, pieces: due.filter((c) => c.kind === 'overage').length, declined: due.some((c) => c.status === 'failed'), charges: all as MailboxCharge[] };
}

/** A card saved on Stripe's page (or the demo card): keep what to show, and retry anything that was declined. */
export async function saveCard(env: Env, customerId: string, card: { payment_method_id: string; brand: string; last4: string; exp: string }, addedBy: string, stripeCustomerId: string | null) {
  // Saving a card turns automatic renewal on (the customer agreed to it on the card page); they can turn it off.
  await saveMailboxSettings(env, customerId, { autorenew: 1, payment_method_id: card.payment_method_id, card_brand: card.brand, card_last4: card.last4, card_exp: card.exp, ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}), card_added_by: addedBy, card_added_at: new Date().toISOString() });
  await logAudit(env, { id: null, name: addedBy }, 'mailbox.card_saved', customerId, `${card.brand} ending ${card.last4}, exp ${card.exp}`);
  await chargeOverages(env, customerId, { retryFailed: true }).catch(() => {});
}
