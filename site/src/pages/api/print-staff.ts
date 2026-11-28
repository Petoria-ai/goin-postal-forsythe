export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate, atLeast } from '../../lib/auth';
import { logAudit } from '../../shipping/store';
import { listPrintOrders, getPrintOrder, updatePrintOrder, artUrl } from '../../lib/printOrders';
import { sendToGelato, gelatoStatus, gelatoMode, setGelatoLive, gelatoCatalogs, gelatoCatalog, OUR_SEARCHES } from '../../lib/gelato';
import { serviceKeyInfo, saveServiceKey, removeServiceKey, cleanKey, keysReady, serviceKey } from '../../lib/serviceKeys';

// Counter → Print orders (Peter, Nov 25 2026): the staff side of Gelato orders. Any staff PIN: list, art {id} (links
// to look at the artwork), approve {id} (sends it to Gelato), refresh {id} (asks Gelato for status and tracking).
// Manager or owner: cancel {id} (before it's sent; refund it in Stripe). Owner: key_save {key}, key_remove,
// set_live {on} (real orders on or off; off sends drafts Gelato doesn't print). Manager or owner: catalog_list and
// catalog_one {uid} read Gelato's product catalog (read only) for the "Gelato's product list" file;
// catalog_ours {n} runs search n of OUR_SEARCHES (only the variants we sell) for "Find our products' codes".
export const POST: APIRoute = async ({ request }) => {
  const b: any = await request.json().catch(() => ({}));
  const user = await authenticate(env, b.pin);
  if (!user) return json({ error: 'Wrong PIN' }, 401);
  const who = { id: user.id, name: user.name };
  try {
    if (b.action === 'list') {
      return json({
        orders: await listPrintOrders(env, undefined, 300),
        mode: await gelatoMode(env), key: await serviceKeyInfo(env, 'gelato'),
        can_owner: atLeast(user, 'owner'), can_manager: atLeast(user, 'manager'), keys_ready: keysReady(env),
      });
    }
    if (b.action === 'art') {
      const o = await getPrintOrder(env, String(b.id ?? ''));
      if (!o) return json({ error: 'No such order' }, 404);
      return json({ art: await Promise.all(o.art.map(async (a) => ({ file: a.file, w: a.w, h: a.h, url: await artUrl(env, a.id) }))) });
    }
    if (b.action === 'approve') {
      const o = await getPrintOrder(env, String(b.id ?? ''));
      if (!o) return json({ error: 'No such order' }, 404);
      if (o.status !== 'paid') return json({ error: o.status === 'awaiting_payment' ? 'Not paid yet.' : 'Already sent or closed.' }, 409);
      const r = await sendToGelato(env, o);
      if (!r.ok) {
        await logAudit(env, who, 'print.send_failed', o.id, r.error);
        return json({ error: `Gelato didn't take it: ${r.error}` }, 502);
      }
      const now = new Date().toISOString();
      const next = await updatePrintOrder(env, o.id, { status: 'sent', approved_by: user.name, approved_at: now, gelato: { order_id: r.order_id, mode: r.mode, sent_at: now } }, `approved and sent to Gelato (${r.mode})`, user.name);
      await logAudit(env, who, 'print.approve', o.id, `${o.product_name} · ${o.quantity} · Gelato ${r.order_id} (${r.mode})`);
      return json({ ok: true, order: next });
    }
    if (b.action === 'refresh') {
      const o = await getPrintOrder(env, String(b.id ?? ''));
      if (!o?.gelato) return json({ error: 'Not sent to Gelato yet.' }, 409);
      const s = await gelatoStatus(env, o.gelato.order_id);
      if (!s.ok) return json({ error: s.error }, 502);
      const next = await updatePrintOrder(env, o.id, { status: s.ours ?? o.status, tracking: s.tracking.code || s.tracking.url ? s.tracking : o.tracking, gelato: { ...o.gelato, status: s.status ?? o.gelato.status } }, `Gelato: ${s.status ?? 'no change'}`, user.name);
      return json({ ok: true, order: next });
    }
    if (b.action === 'cancel') {
      if (!atLeast(user, 'manager')) return json({ error: 'Only a manager or owner can cancel an order.' }, 403);
      const o = await getPrintOrder(env, String(b.id ?? ''));
      if (!o) return json({ error: 'No such order' }, 404);
      if (!['awaiting_payment', 'paid'].includes(o.status)) return json({ error: 'It was already sent to Gelato; cancel it in Gelato\'s dashboard.' }, 409);
      const next = await updatePrintOrder(env, o.id, { status: 'cancelled' }, `cancelled${b.reason ? `: ${String(b.reason).slice(0, 200)}` : ''}`, user.name);
      await logAudit(env, who, 'print.cancel', o.id, String(b.reason ?? '').slice(0, 200) || null);
      return json({ ok: true, order: next, refund: o.status === 'paid' });
    }
    if (b.action === 'catalog_list' || b.action === 'catalog_one' || b.action === 'catalog_ours') {
      if (!atLeast(user, 'manager')) return json({ error: 'Only a manager or owner can read Gelato\'s catalog.' }, 403);
      const key = await serviceKey(env, 'gelato');
      if (!key) return json({ error: 'Save the Gelato key first.' }, 400);
      if (b.action === 'catalog_list') return json({ catalogs: await gelatoCatalogs(key) });
      if (b.action === 'catalog_ours') {
        const n = Number(b.n);
        if (!Number.isInteger(n) || n < 0 || n >= OUR_SEARCHES.length) return json({ count: OUR_SEARCHES.length });
        const s = OUR_SEARCHES[n];
        return json({ count: OUR_SEARCHES.length, search: { name: s.name, filters: s.filters, ...(await gelatoCatalog(key, s.catalog, undefined, 2000, s.filters)) } });
      }
      const uid = String(b.uid ?? '');
      if (!/^[\w.-]{1,120}$/.test(uid)) return json({ error: 'Bad catalog id' }, 400);
      return json({ catalog: await gelatoCatalog(key, uid) });
    }
    if (['key_save', 'key_remove', 'set_live'].includes(b.action)) {
      if (!atLeast(user, 'owner')) return json({ error: 'Only an owner PIN can change the Gelato connection.' }, 403);
      if (b.action === 'set_live') {
        if (b.on && (await gelatoMode(env)) === 'pretend') return json({ error: 'Save the Gelato key first.' }, 400);
        await setGelatoLive(env, !!b.on);
        await logAudit(env, who, 'print.live', 'gelato', b.on ? 'real orders ON' : 'real orders off (drafts)');
        return json({ ok: true, mode: await gelatoMode(env) });
      }
      if (b.action === 'key_remove') {
        await removeServiceKey(env, 'gelato'); await setGelatoLive(env, false);
        await logAudit(env, who, 'print.key_remove', 'gelato', 'API key removed');
        return json({ ok: true, key: await serviceKeyInfo(env, 'gelato'), mode: await gelatoMode(env) });
      }
      const key = cleanKey(b.key);
      if (!key) return json({ error: 'Paste the whole key: one piece of text with no spaces.' }, 400);
      await saveServiceKey(env, 'gelato', key, user.name);
      await logAudit(env, who, 'print.key_save', 'gelato', 'API key saved');
      return json({ ok: true, key: await serviceKeyInfo(env, 'gelato'), mode: await gelatoMode(env) });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? 'Try again' }, 500);
  }
};
