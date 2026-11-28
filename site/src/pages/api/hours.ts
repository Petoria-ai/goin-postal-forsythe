export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { listSpecialHours } from '../../shipping/store';
import { store } from '../../data/store';
import { zoned } from '../../lib/hours';

// Public, read-only: the holiday hours and closures staff have added at /counter/seo from today on.
// The open-now badge on every page reads this, so a closure shows without a rebuild. Nothing private
// is in it: dates, times and a label like "Christmas Day".
export const GET: APIRoute = async () => {
  const today = zoned(new Date(), store.timezone).ymd;
  let special: { date: string; closed: boolean; opens?: string; closes?: string; label?: string }[] = [];
  try {
    special = (await listSpecialHours(env, today)).slice(0, 60).map((r) => ({ date: r.date, closed: r.closed === 1, ...(r.opens ? { opens: r.opens } : {}), ...(r.closes ? { closes: r.closes } : {}), ...(r.label ? { label: r.label } : {}) }));
  } catch { /* no database: the weekly hours stand */ }
  return new Response(JSON.stringify({ timezone: store.timezone, weekly: store.weeklyHours, special }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' },
  });
};
