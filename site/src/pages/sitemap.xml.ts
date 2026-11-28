// /sitemap.xml: the sitemap index. Children are /sitemap-pages.xml, -services, -guides and -products,
// each listing only published, indexable, canonical URLs from the route registry.
import type { APIRoute } from 'astro';
import { sitemapIndex } from '../lib/feeds';
import { indexableRoutes } from '../lib/routes';
import { SITE_URL } from '../lib/seo';
export const GET: APIRoute = () => new Response(sitemapIndex(indexableRoutes(), SITE_URL), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
