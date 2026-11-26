import { describe, it, expect } from 'vitest';
import { gelatoCatalogs, gelatoCatalog } from '../src/lib/gelato';

// A pretend Gelato Product API: two catalogs; "mugs" has 230 products over three pages.
function fakeGelato(seen: string[]) {
  return (async (url: string, init?: RequestInit) => {
    seen.push(`${init?.method ?? 'GET'} ${url} ${(init?.headers as any)?.['X-API-KEY']}`);
    const ok = (j: unknown) => new Response(JSON.stringify(j), { status: 200 });
    if (url.endsWith('/v3/catalogs')) return ok({ data: [{ catalogUid: 'mugs', title: 'Mugs' }, { catalogUid: 't-shirts', title: 'T-shirts' }] });
    if (url.endsWith('/catalogs/mugs')) return ok({ catalogUid: 'mugs', title: 'Mugs', productAttributes: [{ productAttributeUid: 'MugSize', title: 'Size', values: [{ productAttributeValueUid: '11-oz', title: '11 oz' }] }] });
    if (url.endsWith('/catalogs/mugs/products:search')) {
      const { offset } = JSON.parse(String(init?.body));
      const n = Math.max(0, Math.min(100, 230 - offset));
      return ok({ products: Array.from({ length: n }, (_, i) => ({ productUid: `mug_${offset + i}`, attributes: { MugSize: '11-oz' }, weight: { value: 1 } })), hits: { attributeHits: {} } });
    }
    return new Response('no', { status: 401 });
  }) as typeof fetch;
}

describe("Gelato's product list (read only)", () => {
  it('lists the catalogs with the key in X-API-KEY', async () => {
    const seen: string[] = [];
    expect(await gelatoCatalogs('k123', fakeGelato(seen))).toEqual([{ uid: 'mugs', title: 'Mugs' }, { uid: 't-shirts', title: 'T-shirts' }]);
    expect(seen[0]).toBe('GET https://product.gelatoapis.com/v3/catalogs k123');
  });
  it('reads one catalog: its choices and every product page, keeping only codes and choices', async () => {
    const c = await gelatoCatalog('k', 'mugs', fakeGelato([]));
    expect(c.attributes).toEqual([{ uid: 'MugSize', title: 'Size', values: [{ uid: '11-oz', title: '11 oz' }] }]);
    expect(c.products).toHaveLength(230);
    expect(c.products[229]).toEqual({ uid: 'mug_229', attributes: { MugSize: '11-oz' } });
    expect(c.more).toBe(false);
  });
  it('says to check the key when Gelato refuses it', async () => {
    await expect(gelatoCatalog('bad', 'nope', fakeGelato([]))).rejects.toThrow(/check the key/);
  });
});
