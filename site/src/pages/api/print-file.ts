export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { loadArt, artSignatureOk } from '../../lib/printOrders';

// The artwork of a print order, for Gelato to download (and staff to look at). Only with the signed link the
// website makes (lib/printOrders.ts artUrl); a guessed address gets nothing.
export const GET: APIRoute = async ({ url }) => {
  const a = url.searchParams.get('a') ?? '';
  const s = url.searchParams.get('s') ?? '';
  if (!(await artSignatureOk(env, a, s))) return new Response('Not found', { status: 404 });
  const art = await loadArt(env, a);
  if (!art) return new Response('Not found', { status: 404 });
  return new Response(art.bytes, { headers: { 'Content-Type': art.type, 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
};
