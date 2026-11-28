// IndexNow (indexnow.org): tells Bing, Yandex, Seznam, Naver and other participating engines the
// moment a public URL is added, changed or removed. Google does not use IndexNow; it reads the sitemap.
//
// Setup: set INDEXNOW_KEY (8 to 128 letters, digits or dashes) with `npx wrangler secret put
// INDEXNOW_KEY`. The key is served at /indexnow.txt, which proves the site owns it. Submissions go
// out from /counter/seo ("Notify search engines") and from the daily GitHub workflow
// (.github/workflows/indexnow.yml), and only send what changed since the last submission.
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const validIndexNowKey = (k: string | undefined): k is string => !!k && /^[A-Za-z0-9-]{8,128}$/.test(k);

export interface LoggedUrl { url: string; lastmod: string | null; removed: number }
/** What to send: URLs that are new or whose lastmod changed, plus URLs we sent before that are gone now. */
export function indexNowDiff(current: { url: string; lastmod?: string }[], log: LoggedUrl[]): { changed: { url: string; lastmod: string | null }[]; removed: string[] } {
  const prev = new Map(log.map((l) => [l.url, l]));
  const now = new Set(current.map((c) => c.url));
  const changed = current.filter((c) => { const p = prev.get(c.url); return !p || p.removed === 1 || (p.lastmod ?? '') !== (c.lastmod ?? ''); }).map((c) => ({ url: c.url, lastmod: c.lastmod ?? null }));
  const removed = log.filter((l) => l.removed !== 1 && !now.has(l.url)).map((l) => l.url);
  return { changed, removed };
}

export function indexNowBody(site: string, key: string, urls: string[]) {
  return { host: new URL(site).host, key, keyLocation: `${site}/indexnow.txt`, urlList: urls.slice(0, 10000) };
}

/** POST the list. 200 and 202 both mean accepted. */
export async function submitIndexNow(site: string, key: string, urls: string[], fetcher: typeof fetch = fetch): Promise<{ ok: boolean; status: number; sent: number }> {
  if (!urls.length) return { ok: true, status: 204, sent: 0 };
  const res = await fetcher(INDEXNOW_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(indexNowBody(site, key, urls)) });
  return { ok: res.status === 200 || res.status === 202, status: res.status, sent: Math.min(urls.length, 10000) };
}
