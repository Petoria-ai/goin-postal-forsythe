// /robots.txt, built from src/data/crawlers.ts. Static: rebuilt with every deploy.
import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/feeds';
import { SITE_URL, SITE_LIVE } from '../lib/seo';
import { crawlerPolicy } from '../data/crawlers';
export const GET: APIRoute = () => new Response(robotsTxt(SITE_URL, crawlerPolicy, SITE_LIVE), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
