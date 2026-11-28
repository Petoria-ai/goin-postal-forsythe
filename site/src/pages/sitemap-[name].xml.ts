// /sitemap-pages.xml, /sitemap-services.xml, /sitemap-guides.xml, /sitemap-products.xml. A child with
// no URLs is not built (and not listed in the index).
import type { APIRoute, GetStaticPaths } from 'astro';
import { urlset, sitemapOf, type SitemapName } from '../lib/feeds';
import { indexableRoutes } from '../lib/routes';
import { SITE_URL } from '../lib/seo';
export const getStaticPaths: GetStaticPaths = () => {
  const names: SitemapName[] = ['pages', 'services', 'guides', 'products'];
  return names.filter((n) => indexableRoutes().some((r) => sitemapOf(r) === n)).map((name) => ({ params: { name } }));
};
export const GET: APIRoute = ({ params }) => new Response(urlset(indexableRoutes().filter((r) => sitemapOf(r) === params.name), SITE_URL), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
