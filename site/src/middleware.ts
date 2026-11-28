// Runs in front of every request the Worker handles (server-rendered pages, the API and any URL
// that is not a static file). Static pages are served straight from Cloudflare's assets and get
// their headers from public/_headers instead.
//
// 1. HTTP to HTTPS, permanently (Cloudflare's "Always Use HTTPS" should be on too).
// 2. Private routes (staff, accounts, orders, the API) get `X-Robots-Tag: noindex` on top of their
//    PIN, session or order-code protection.
// 3. A URL that would 404 is checked against the legacy redirect list in src/lib/routes.ts and the
//    redirects staff add at /counter/seo, and sent on with a 301 when one matches.
import { defineMiddleware } from 'astro:middleware';
import { isPrivatePath, canonicalPath } from './lib/seo';
import { LEGACY_REDIRECTS } from './lib/routes';

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;

export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next(); // build time: nothing to redirect, no bindings

  const url = new URL(ctx.request.url);
  if (url.protocol === 'http:' && !LOCAL.test(url.hostname)) {
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  const res = await next();

  if (isPrivatePath(url.pathname)) {
    try { res.headers.set('X-Robots-Tag', 'noindex, nofollow'); } catch { /* immutable response */ }
    return res;
  }

  if (res.status === 404) {
    const path = canonicalPath(url.pathname);
    const legacy = LEGACY_REDIRECTS[path] ?? LEGACY_REDIRECTS[url.pathname];
    if (legacy) return new Response(null, { status: 301, headers: { Location: legacy + url.search, 'Cache-Control': 'public, max-age=86400' } });
    try {
      const { env } = await import('./lib/env');
      if (env.DB) {
        const { findSeoRedirect, countSeoRedirectHit } = await import('./shipping/store');
        const r = await findSeoRedirect(env, path);
        if (r) {
          await countSeoRedirectHit(env, r.id).catch(() => {});
          return new Response(null, { status: r.status === 302 ? 302 : 301, headers: { Location: r.to_path + (r.to_path.includes('?') ? '' : url.search) } });
        }
      }
    } catch { /* no database: fall through to the 404 */ }
  }
  return res;
});
