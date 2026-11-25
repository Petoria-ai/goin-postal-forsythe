export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { getPrintOrder, updatePrintOrder } from '../../lib/printOrders';
import { gelatoStatus } from '../../lib/gelato';

// Gelato tells the website when an order changes (status, tracking). Set this address in Gelato's dashboard
// (Developer → Webhooks): https://<site>/api/gelato-webhook. The message itself isn't trusted: the website only
// uses its order number and asks Gelato's API for the real status and tracking with the saved key.
export const POST: APIRoute = async ({ request }) => {
  const j: any = await request.json().catch(() => null);
  const ref = String(j?.orderReferenceId ?? j?.data?.orderReferenceId ?? '');
  if (!/^PO-[A-Z2-9]{6}$/.test(ref)) return new Response('ok');
  const o = await getPrintOrder(env, ref);
  if (!o?.gelato || o.gelato.mode === 'pretend') return new Response('ok');
  const s = await gelatoStatus(env, o.gelato.order_id);
  if (!s.ok) return new Response('ok');
  await updatePrintOrder(env, o.id, { status: s.ours ?? o.status, tracking: s.tracking.code || s.tracking.url ? s.tracking : o.tracking, gelato: { ...o.gelato, status: s.status ?? o.gelato.status } }, `Gelato: ${s.status ?? 'update'}`, 'Gelato');
  return new Response('ok');
};
