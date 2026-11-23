export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate, atLeast } from '../../lib/auth';
import { serviceKeyInfo, saveServiceKey, removeServiceKey, serviceKey, cleanKey, keysReady } from '../../lib/serviceKeys';
import { listVirtual, getVirtual, addVirtual, updateVirtual, getCustomer, logAudit, virtualDocKey, reassignDocs, countMailboxDocs, latestPhotoIdExpiry, type VirtualInput } from '../../shipping/store';
import { idState, day } from '../../lib/mailbox';
import { testKey, listRenters, listBoxStatus, compare, findRenter, renterAction, type CallSpec } from '../../lib/anytime';
import { verdict } from '../../lib/anytime';
import { SIZES } from '../../lib/mailbox';
import cfg from '../../data/virtual.json';

export const PROVIDERS = cfg.providers as { id: string; name: string; api: boolean; api_base: string | null; renters_path?: string; mailboxes_path?: string; deactivate?: CallSpec | null; delete?: CallSpec | null }[];
/** Services we can read from (lib/anytime.ts speaks Anytime Mailbox's API). */
const canSync = (p: { id: string; api_base: string | null; renters_path?: string }) => p.id === 'anytime' && !!p.api_base && !!p.renters_path;
const providerOf = (id: unknown) => PROVIDERS.find((p) => p.id === String(id ?? '')) ?? null;

// Virtual mailboxes (Peter, Nov 19 2026), for Counter → Virtual mail: one tab per service in src/data/virtual.json
// (Anytime Mailbox first). Any staff PIN: list, add {provider, vno, name, email?, phone?, names?: string[], customer_id?, note?}, update {id, ...same}, close {id}, reopen {id}.
// Anytime Mailbox stays the record of these customers (billing, scans); this list lets staff recognize their mail.
// Owner PIN only: key_save {provider, key}, key_remove {provider}; any staff: key_test {provider}. The key is
// encrypted and never sent back (lib/serviceKeys.ts). When the API address is known (api_base), the sync goes here (P18).

const clean = (v: unknown, max: number) => { const s = String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max); return s || null; };
/** A virtual number must never look like a wall box number, or mail could go in the wrong box. */
const clashesWithWallBox = (vno: string) => /^\d+$/.test(vno) && SIZES.some((s) => Number(vno) >= s.from && Number(vno) <= s.to);

async function readInput(b: any): Promise<VirtualInput | string> {
  const vno = clean(b.vno, 20)?.replace(/^#/, '') ?? '';
  if (!vno) return 'Type their Anytime Mailbox number.';
  if (clashesWithWallBox(vno)) return `#${vno} is a wall box number here (${SIZES.map((s) => `${s.from}–${s.to}`).join(', ')}). Virtual numbers must be different.`;
  const name = clean(b.name, 80);
  if (!name) return 'Type their name.';
  const names = Array.isArray(b.names) ? b.names.map((n: unknown) => clean(n, 80)).filter(Boolean).slice(0, 10) : [];
  const customer_id = clean(b.customer_id, 40);
  if (customer_id && !(await getCustomer(env, customer_id))) return 'That website account was not found.';
  return { vno, name, email: clean(b.email, 120), phone: clean(b.phone, 30), names: JSON.stringify(names), customer_id, note: clean(b.note, 300) };
}

export const POST: APIRoute = async ({ request }) => {
  const b: any = await request.json().catch(() => ({}));
  const user = await authenticate(env, b.pin);
  if (!user) return json({ error: 'Wrong PIN' }, 401);
  const who = { id: user.id, name: user.name };
  try {
    if (b.action === 'list') {
      const rows = await listVirtual(env);
      const docs = await countMailboxDocs(env);
      const ids = await latestPhotoIdExpiry(env);
      const today = day(new Date());
      return json({
        virtual: await Promise.all(rows.map(async (v) => ({ ...v, names: JSON.parse(v.names), account: v.customer_id ? (await getCustomer(env, v.customer_id))?.name ?? null : null,
          doc_key: virtualDocKey(v), docs: docs.get(virtualDocKey(v)) ?? 0, id_state: v.status === 'active' ? idState(ids.get(virtualDocKey(v)), today) : null,
          no_id: v.status === 'active' && !ids.has(virtualDocKey(v)) }))),
        providers: await Promise.all(PROVIDERS.map(async (p) => { const key = await serviceKeyInfo(env, p.id); return { ...p, key, connected: !!key.source && canSync(p) }; })),
        can_manage_keys: atLeast(user, 'owner'), keys_ready: keysReady(env), role: user.role,
      });
    }
    if (b.action === 'add' || b.action === 'update') {
      const input = await readInput(b);
      if (typeof input === 'string') return json({ error: input }, 400);
      const existing = b.action === 'update' ? await getVirtual(env, Number(b.id)) : null;
      const prov = providerOf(existing?.provider ?? b.provider ?? PROVIDERS[0].id);
      if (!prov) return json({ error: 'Pick which virtual mailbox service.' }, 400);
      const dupe = (await listVirtual(env)).find((v) => v.status === 'active' && v.provider === prov.id && v.vno.toLowerCase() === input.vno.toLowerCase() && v.id !== Number(b.id));
      if (dupe) return json({ error: `${prov.name} #${input.vno} is already ${dupe.name}.` }, 409);
      if (b.action === 'add') {
        const v = await addVirtual(env, input, prov.id);
        await logAudit(env, who, 'virtual.add', `${prov.name} #${v.vno}`, v.name);
        return json({ ok: true, virtual: v });
      }
      const v = await updateVirtual(env, Number(b.id), input);
      if (!v) return json({ error: 'No such virtual mailbox' }, 404);
      // Linking a website account for the first time: their documents (kept under "V-<id>") move to the account.
      if (existing && !existing.customer_id && v.customer_id) await reassignDocs(env, `V-${v.id}`, v.customer_id);
      await logAudit(env, who, 'virtual.update', `V#${v.vno}`, v.name);
      return json({ ok: true, virtual: v });
    }
    if (b.action === 'key_save' || b.action === 'key_remove' || b.action === 'key_test') {
      const prov = providerOf(b.provider);
      if (!prov) return json({ error: 'Pick which virtual mailbox service.' }, 400);
      if (b.action === 'key_test') {
        const key = await serviceKey(env, prov.id);
        if (!key) return json({ ok: false, result: 'no_key' });
        if (!canSync(prov)) return json({ ok: false, result: 'no_address' });
        const r = await testKey(prov.api_base!, prov.renters_path!, key);
        await logAudit(env, who, 'virtual.key_test', prov.name, r.ok ? 'key works' : `${r.result}${r.status ? ` ${r.status}` : ''}`);
        return json(r.ok ? { ok: true, result: 'ok' } : r);
      }
      if (!atLeast(user, 'owner')) return json({ error: 'Only an owner PIN can add, change or remove the key.' }, 403);
      if (b.action === 'key_remove') {
        await removeServiceKey(env, prov.id);
        await logAudit(env, who, 'virtual.key_remove', prov.name, 'API key removed');
        return json({ ok: true, key: await serviceKeyInfo(env, prov.id) });
      }
      const key = cleanKey(b.key);
      if (!key) return json({ error: 'Paste the whole key: one piece of text with no spaces.' }, 400);
      await saveServiceKey(env, prov.id, key, user.name);
      await logAudit(env, who, 'virtual.key_save', prov.name, 'API key saved'); // never the key itself
      return json({ ok: true, key: await serviceKeyInfo(env, prov.id) });
    }
    if (b.action === 'sync_preview') { // read only: compares their renters with our list; changes nothing anywhere
      const prov = providerOf(b.provider);
      if (!prov) return json({ error: 'Pick which virtual mailbox service.' }, 400);
      const key = await serviceKey(env, prov.id);
      if (!key) return json({ ok: false, result: 'no_key' });
      if (!canSync(prov)) return json({ ok: false, result: 'no_address' });
      const r = await listRenters(prov.api_base!, prov.renters_path!, key);
      if (!r.ok) return json(r);
      const locals = (await listVirtual(env)).filter((v) => v.provider === prov.id).map((v) => ({ id: v.id, vno: v.vno, name: v.name, email: v.email, phone: v.phone, names: JSON.parse(v.names), status: v.status }));
      // Box statuses (assigned vs pending-assignment) say who is really verified; if they can't be read, the assigned dates do.
      const boxes = prov.mailboxes_path ? await listBoxStatus(prov.api_base!, prov.mailboxes_path, key) : null;
      const c = compare(r.renters, locals, boxes?.ok ? boxes.status : null);
      const box_check = boxes?.ok ? 'status' : 'assigned_date';
      await logAudit(env, who, 'virtual.sync_preview', prov.name, `${r.renters.length} renters · ${c.matched} match · ${c.rows.length} to look at · verified by ${box_check}`);
      return json({ ok: true, renters: r.renters.length, ...c, box_check });
    }
    // Deactivate or delete a renter AT the service (Peter, Nov 23 2026: "a little harder to close their account ... it'll
    // delete on the anytime mailbox side"). Deactivate: manager or owner. Delete: owner only. renter_lookup shows who it is
    // first; the change needs confirm = their mailbox number, typed. Then they're closed on our list too (nothing erased here).
    // Check at Anytime Mailbox (Peter, Nov 23 2026: "mailbox number 104 isnt a active renter"): exactly what their API says
    // about this box: every renter who has it, their status, the box's status and assigned date, and what Sync decides.
    if (b.action === 'renter_check') {
      const cur = await getVirtual(env, Number(b.id));
      if (!cur) return json({ error: 'No such virtual mailbox' }, 404);
      const prov = providerOf(cur.provider);
      if (!prov) return json({ error: 'Unknown service' }, 400);
      const key = await serviceKey(env, prov.id);
      if (!key) return json({ ok: false, result: 'no_key' });
      if (!canSync(prov)) return json({ ok: false, result: 'no_address' });
      const r = await listRenters(prov.api_base!, prov.renters_path!, key, fetch, 'active,inactive,deleted');
      if (!r.ok) return json(r);
      const boxes = prov.mailboxes_path ? await listBoxStatus(prov.api_base!, prov.mailboxes_path, key) : null;
      const k = cur.vno.toLowerCase();
      const holders = r.renters.filter((x) => x.mailboxes.some((m) => m.toLowerCase() === k))
        .map((x) => ({ id: x.id, name: x.name, status: x.status, assigned: x.boxes.find((m) => m.name.toLowerCase() === k)?.assigned ?? null }));
      const box_status = boxes?.ok ? boxes.status.get(k) ?? null : null;
      // For finding out why a box doesn't match: how many boxes their list gave, by status, and any whose name or renter is close.
      const digits = cur.vno.replace(/\D/g, '');
      const ids = new Set(holders.map((h) => h.id));
      const box_list = boxes?.ok ? {
        count: boxes.raw.length,
        by_status: boxes.raw.reduce((a: Record<string, number>, m) => { a[m.status || '(blank)'] = (a[m.status || '(blank)'] ?? 0) + 1; return a; }, {}),
        near: boxes.raw.filter((m) => (digits && m.name.replace(/\D/g, '') === digits) || ids.has(Number(m.renter_id))).slice(0, 5),
        sample: boxes.raw.slice(0, 3).map((m) => m.name),
      } : null;
      return json({ ok: true, vno: cur.vno, holders, box_status, box_check: boxes?.ok ? 'status' : `could not read box statuses (${boxes ? `${boxes.result}${boxes.status ? ` ${boxes.status}` : ''}` : 'no path'})`,
        sync_says: verdict(holders, box_status), box_list });
    }
    if (b.action === 'renter_lookup' || b.action === 'renter_deactivate' || b.action === 'renter_delete') {
      const cur = await getVirtual(env, Number(b.id));
      if (!cur) return json({ error: 'No such virtual mailbox' }, 404);
      const prov = providerOf(cur.provider);
      if (!prov) return json({ error: 'Unknown service' }, 400);
      const del = b.action === 'renter_delete';
      if (!atLeast(user, del ? 'owner' : 'manager')) return json({ error: del ? 'Only an owner PIN can delete an account at the service.' : 'Only a manager or owner PIN can deactivate an account at the service.' }, 403);
      const key = await serviceKey(env, prov.id);
      if (!key) return json({ ok: false, result: 'no_key' });
      if (!canSync(prov)) return json({ ok: false, result: 'no_address' });
      const spec = del ? prov.delete : prov.deactivate;
      if (b.action !== 'renter_lookup' && !spec) return json({ ok: false, result: 'no_path' });
      const found = await findRenter(prov.api_base!, prov.renters_path!, key, cur.vno);
      if (!found.ok) return json(found);
      if (!found.renter) return json({ ok: false, result: 'no_renter' });
      if (b.action === 'renter_lookup') return json({ ok: true, renter: found.renter, can_deactivate: !!prov.deactivate, can_delete: !!prov.delete });
      if (String(b.confirm ?? '').trim().replace(/^#/, '').toLowerCase() !== cur.vno.toLowerCase()) return json({ error: `Type the mailbox number (${cur.vno}) to confirm.` }, 400);
      if (Number(b.renter_id) !== found.renter.id) return json({ error: 'Their account changed since you looked. Close this and try again.' }, 409);
      const r = await renterAction(prov.api_base!, spec!, key, found.renter.id);
      const what = del ? 'delete' : 'deactivate';
      await logAudit(env, who, `virtual.renter_${what}`, `${prov.name} #${cur.vno}`, `${prov.name} renter ${found.renter.id} (${found.renter.name}) · ${r.ok ? 'done' : `failed: ${r.result}${r.status ? ` ${r.status}` : ''}`}`);
      if (!r.ok) return json(r);
      const stamp = `${del ? 'Deleted' : 'Deactivated'} at ${prov.name} ${new Date().toISOString().slice(0, 10)} by ${user.name}`;
      const v = await updateVirtual(env, cur.id, { status: 'closed', closed_at: new Date().toISOString(), note: [cur.note, stamp].filter(Boolean).join(' · ').slice(0, 300) });
      return json({ ok: true, virtual: v });
    }
    if (b.action === 'close' || b.action === 'reopen') {
      const cur = await getVirtual(env, Number(b.id));
      if (!cur) return json({ error: 'No such virtual mailbox' }, 404);
      const v = await updateVirtual(env, cur.id, b.action === 'close' ? { status: 'closed', closed_at: new Date().toISOString() } : { status: 'active', closed_at: null });
      await logAudit(env, who, `virtual.${b.action}`, `V#${cur.vno}`, cur.name);
      return json({ ok: true, virtual: v });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? 'Try again' }, 500);
  }
};
