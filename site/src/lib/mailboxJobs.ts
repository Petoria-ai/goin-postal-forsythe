// Mailbox work that changes data or sends messages (Peter, Nov 17 2026): reminders, extending a box, and
// recording an online renewal once Stripe says it's paid. Shared by /api/mailbox (staff buttons and the
// customer's Renew online), /api/mock-paid and the Stripe webhook, and the daily scheduled run in src/worker.ts.
// Everything takes env as an argument (no cloudflare:workers import) so the scheduled run can call it too.
import { store } from '../data/store';
import { sendEmail, sendSms } from '../shipping/notify';
import { getCustomer, listActiveMailboxes, updateMailbox, getMailbox, logAudit, claimRenewal, getRenewal, setRenewalPaidThrough, type MailboxRow } from '../shipping/store';
import { addMonths, addressFor, day, dueReminder, reminderText } from './mailbox';

/** Text and email one reminder. "sms"/"email" say whether the holder had a number/address to send to. */
export async function sendReminder(env: Env, b: MailboxRow, key: string): Promise<{ sms: boolean; email: boolean; to: string }> {
  const c = await getCustomer(env, b.customer_id);
  const msg = reminderText(b, key, store, env.SITE_URL ? `${env.SITE_URL}/account#mailbox` : null);
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
