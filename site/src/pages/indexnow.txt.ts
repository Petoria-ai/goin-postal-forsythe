export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../lib/env';
import { validIndexNowKey } from '../lib/indexnow';

// The IndexNow key file. Search engines fetch it to confirm the site owns the key it submits with.
// 404 until INDEXNOW_KEY is set.
export const GET: APIRoute = () => {
  const key = env.INDEXNOW_KEY;
  if (!validIndexNowKey(key)) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
};
