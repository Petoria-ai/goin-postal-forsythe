export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate } from '../../lib/auth';
import { listVirtual, getVirtual, addVirtual, updateVirtual, getCustomer, logAudit, type VirtualInput } from '../../shipping/store';
import { SIZES } from '../../lib/mailbox';
import cfg from '../../data/virtual.json';

export const PROVIDERS = cfg.providers as { id: string; name: string; api: boolean }[];
const providerOf = (id: unknown) => PROVIDERS.find((p) => p.id === String(id ?? '')) ?? null;

// Virtual mailboxes (Peter, Nov 19 2026), for Counter → Virtual mail: one tab per service in src/data/virtual.json
// (Anytime Mailbox first). Any staff PIN: list, add {provider, vno, name, email?, phone?, names?: string[], customer_id?, note?}, update {id, ...same}, close {id}, reopen {id}.
// Anytime Mailbox stays the record of these customers (billing, scans); this list lets staff recognize their mail.
// When Anytime Mailbox gives us API access (ANYTIME_API_KEY), this is where the sync goes (to-do P18).

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
      return json({
        virtual: await Promise.all(rows.map(async (v) => ({ ...v, names: JSON.parse(v.names), account: v.customer_id ? (await getCustomer(env, v.customer_id))?.name ?? null : null }))),
        providers: PROVIDERS.map((p) => ({ ...p, connected: p.id === 'anytime' ? !!env.ANYTIME_API_KEY : false })),
        connected: !!env.ANYTIME_API_KEY,
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
      await logAudit(env, who, 'virtual.update', `V#${v.vno}`, v.name);
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
