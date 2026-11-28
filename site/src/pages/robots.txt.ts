// /robots.txt, built from src/data/crawlers.ts. Static: rebuilt with every deploy.
import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/feeds';
import { SITE_URL } from '../lib/seo';
export const GET: APIRoute = () => new Response(robotsTxt(SITE_URL), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
