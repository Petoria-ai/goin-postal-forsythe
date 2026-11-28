// /feeds/google-merchant.xml: the Google Merchant Center product feed (RSS 2.0, g: namespace). Add it
// in Merchant Center > Products > Feeds as a scheduled fetch. Only published products are in it.
import type { APIRoute } from 'astro';
import { merchantFeed } from '../../lib/feeds';
import { SITE_URL } from '../../lib/seo';
import { store } from '../../data/store';
import { PRODUCTS, lowPrice } from '../../data/catalog';
import { storeTokens, plainText } from '../../lib/richtext';
const tk = storeTokens(store);
export const GET: APIRoute = () => new Response(merchantFeed(store, PRODUCTS, SITE_URL, (t, p) => plainText(t, { ...tk, low: `$${lowPrice(p).toFixed(2)}` })), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
