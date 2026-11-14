export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json, parseAddress } from '../../lib/validate';
import { createLoginToken, readSession, clearCookie, safeNext } from '../../lib/session';
import { sendEmail } from '../../shipping/notify';
import { store } from '../../data/store';
import { upsertCustomer, getCustomer, findCustomer, saveCustomerAddress, deleteCustomerAddress, setCustomerName, normalizePhone, logAudit } from '../../shipping/store';
import { getOrder, saveOrder } from '../../lib/orders';
import { recordConsent } from '../../shipping/store';
import { isChannel, loggedWording } from '../../lib/consent';

// Customer accounts (T20). login { email } emails a magic link; the rest need the session cookie:
// name { name }, save_address { label, address }, delete_address { id }, logout.
// Who is signed in, for the header's Log in button (Peter, Nov 14 2026). First name only; nothing else leaves.
export const GET: APIRoute = async ({ request }) => {
  const id = await readSession(env, request.headers.get('cookie')).catch(() => null);
  const c = id ? await getCustomer(env, id) : null;
  const first = c ? (c.name && c.name !== 'Customer' ? c.name.split(/\s+/)[0] : '') : '';
  return new Response(JSON.stringify(c ? { signed_in: true, name: first } : { signed_in: false }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });
};

export const POST: APIRoute = async ({ request }) => {
  const b: any = await request.json().catch(() => ({}));
  try {
    if (b.action === 'login') {
      const email = String(b.email ?? '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'A valid email is needed' }, 400);
      // The record is made on first login so the link has somewhere to land; the name comes from the first order or the account page.
      const existing = await findCustomer(env, email, null);
      if (!existing) await upsertCustomer(env, { name: String(b.name ?? '').trim().slice(0, 60) || 'Customer', email });
      const token = await createLoginToken(env, email);
      // next: the page to come back to after the link is clicked (the ship page keeps the customer's form meanwhile).
      const next = safeNext(b.next);
      const link = `${env.SITE_URL}/account?token=${token}${next !== '/account' ? `&next=${encodeURIComponent(next)}` : ''}`;
      const mock = await sendEmail(env, email, `Sign in to ${store.name}`, `Click to sign in to your ${store.name} account (the link works once, for fifteen minutes):\n\n${link}\n\nIf you did not ask for this, ignore it.`);
      return json({ ok: true, sent: true, ...(mock ? { mock_link: link } : {}) });
    }
    if (b.action === 'logout') return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() } });
    const id = await readSession(env, request.headers.get('cookie'));
    const c = id ? await getCustomer(env, id) : null;
    if (!c) return json({ error: 'Sign in first' }, 401);
    if (b.action === 'name') {
      const name = String(b.name ?? '').trim().slice(0, 60);
      if (!name) return json({ error: 'A name is needed' }, 400);
      const phone = String(b.phone ?? '').trim().slice(0, 20);
      await setCustomerName(env, c.id, name, phone ? normalizePhone(phone) : null);
      return json({ ok: true });
    }
    // Marketing choices on the account page (Peter, Nov 14 2026): a yes or a no, each logged with the wording shown.
    if (b.action === 'consent') {
      if (!isChannel(b.channel)) return json({ error: 'Unknown choice' }, 400);
      const granted = b.granted === true;
      const contact = b.channel === 'email' ? c.email : c.phone;
      if (granted && !contact) return json({ error: b.channel === 'sms' ? 'Add your mobile number first' : 'Add your email first' }, 400);
      await recordConsent(env, { customer_id: c.id, channel: b.channel, granted, contact, wording: loggedWording(b.channel, b.lang), source: 'account_page' });
      return json({ ok: true });
    }
    if (b.action === 'save_address') {
      const address = parseAddress({ ...b.address, country_alpha2: b.address?.country_alpha2 || 'US' });
      const row = await saveCustomerAddress(env, { customer_id: c.id, label: String(b.label ?? '').trim().slice(0, 40) || address.contact_name, address_json: JSON.stringify(address) });
      return json({ ok: true, address: row });
    }
    if (b.action === 'resend_label') {
      // The customer's own labeled order, emailed again to the account's address. Same text the counter sends.
      const o = await getOrder(env, String(b.order ?? '').toUpperCase());
      if (!o || (o.email ?? '').toLowerCase() !== (c.email ?? '').toLowerCase()) return json({ error: 'No such order on this account' }, 404);
      if (!o.label || (o.status !== 'labeled' && o.status !== 'printed')) return json({ error: 'That order has no label to send' }, 400);
      const l = o.label;
      const abs = (u: string | null | undefined) => (u ? (u.startsWith('/') ? `${env.SITE_URL}${u}` : u) : null);
      const isReturn = o.kind === 'return';
      const lines = [
        isReturn ? `Here is your prepaid return label from ${store.name}.` : `Here is your shipping label from ${store.name}.`, '',
        (o.rate.service.toLowerCase().startsWith(o.rate.carrier.toLowerCase()) ? o.rate.service : `${o.rate.carrier} ${o.rate.service}`) + (l.tracking_number ? `, tracking number ${l.tracking_number}.` : '.'),
        abs(l.label_url) ? `Label (print on plain paper and tape it flat to the box): ${abs(l.label_url)}` : null,
        abs(l.qr_url) ? `No printer? Show this code at any ${o.rate.carrier} location and they print it: ${abs(l.qr_url)}` : null, '',
        `Track it any time: ${env.SITE_URL}/track?q=${o.id}`, '', `${store.name}, ${store.address}, ${store.phone}. Pickup code ${o.id}.`,
      ].filter((x) => x !== null);
      const mock = await sendEmail(env, c.email!, `${isReturn ? 'Your return label' : 'Your shipping label'} ${o.id}`, lines.join('\n'));
      await saveOrder(env, { ...o, emailed_at: new Date().toISOString() });
      await logAudit(env, { id: null, name: `Customer ${c.name}` }, 'label.email', o.id, `${c.email} (from the account page)`);
      return json({ ok: true, mock });
    }
    if (b.action === 'delete_address') {
      const ok = await deleteCustomerAddress(env, c.id, Number(b.id));
      return ok ? json({ ok: true }) : json({ error: 'No such address' }, 404);
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message }, /Missing|must be|needed/.test(e.message ?? '') ? 400 : 500);
  }
};
