// /llms.txt: an experimental summary for AI assistants (llmstxt.org). Supplementary only; the HTML
// pages are what search engines and assistants actually rank and cite.
import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/feeds';
import { indexableRoutes } from '../lib/routes';
import { SITE_URL } from '../lib/seo';
import { store } from '../data/store';
import { SERVICES } from '../data/services';
import { storeTokens, plainText } from '../lib/richtext';
const tk = storeTokens(store);
const hubs = ['shipping', 'mailboxes', 'business-services'].map((c) => SERVICES.find((s) => s.category === c && !s.slug && s.status === 'published')).filter((s) => !!s);
const faqs = hubs.flatMap((s) => s.faqs).map((f) => ({ q: plainText(f.q, tk), a: plainText(f.a, tk) }));
export const GET: APIRoute = () => new Response(llmsTxt(store, indexableRoutes(), SITE_URL, faqs), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
