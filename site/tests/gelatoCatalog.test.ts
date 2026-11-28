import { describe, it, expect } from 'vitest';
import { gelatoCatalogs, gelatoCatalog } from '../src/lib/gelato';

// A pretend Gelato Product API: two catalogs; "mugs" has 230 products over three pages.
function fakeGelato(seen: string[]) {
  return (async (url: string, init?: RequestInit) => {
    seen.push(`${init?.method ?? 'GET'} ${url} ${(init?.headers as any)?.['X-API-KEY']}`);
    const ok = (j: unknown) => new Response(JSON.stringify(j), { status: 200 });
    if (url.endsWith('/v3/catalogs')) return ok({ data: [{ catalogUid: 'mugs', title: 'Mugs' }, { catalogUid: 'enterprise', title: 'enterprise' }, { catalogUid: 't-shirts', title: 'T-shirts' }] });
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
  it("keeps Gelato's reason when it refuses, instead of failing the whole file", async () => {
    const c = await gelatoCatalog('bad', 'nope', fakeGelato([]));
    expect(c.products).toEqual([]);
    expect(c.errors[0]).toMatch(/^catalog: Gelato answered 401 \(check the key\): no$/);
  });
  it('asks for smaller pages when Gelato refuses 100 at a time', async () => {
    const seen: string[] = [];
    const f = (async (url: string, init?: RequestInit) => {
      seen.push(String(init?.body ?? ''));
      if (url.endsWith('/catalogs/mugs')) return new Response(JSON.stringify({ title: 'Mugs', productAttributes: [] }));
      const { limit, offset } = JSON.parse(String(init?.body));
      if (limit > 50) return new Response('{"message":"limit too big"}', { status: 400 });
      return new Response(JSON.stringify({ products: offset === 0 ? Array.from({ length: 30 }, (_, i) => ({ productUid: `m${i}` })) : [] }));
    }) as typeof fetch;
    const c = await gelatoCatalog('k', 'mugs', f);
    expect(c.products).toHaveLength(30);
    expect(c.errors).toEqual([]);
    expect(seen.some((b) => b.includes('"limit":50'))).toBe(true);
  });
  it("reads choices sent as an object keyed by id (Gelato's real shape)", async () => {
    const f = (async (url: string) => url.endsWith('/catalogs/t-shirts')
      ? new Response(JSON.stringify({ title: 'T-shirts', productAttributes: [{ productAttributeUid: 'GarmentColor', title: 'Color', values: { white: { title: 'White' }, black: 'Black' } }] }))
      : new Response(JSON.stringify({ products: [] }))) as typeof fetch;
    const c = await gelatoCatalog('k', 't-shirts', f);
    expect(c.errors).toEqual([]);
    expect(c.attributes[0].values).toEqual([{ uid: 'white', title: 'White' }, { uid: 'black', title: 'Black' }]);
  });
  it('sends filters as attributeFilters, and warns if Gelato ignored them', async () => {
    const bodies: any[] = [];
    const f = (async (url: string, init?: RequestInit) => {
      if (url.endsWith('/catalogs/t-shirts')) return new Response('{"title":"T-shirts","productAttributes":[]}');
      bodies.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ products: [{ productUid: 'a', attributes: { GarmentColor: 'white' } }, { productUid: 'b', attributes: { GarmentColor: 'red' } }] }));
    }) as typeof fetch;
    const c = await gelatoCatalog('k', 't-shirts', f, 2000, { GarmentColor: ['white'] });
    expect(bodies[0]).toEqual({ attributeFilters: { GarmentColor: ['white'] }, limit: 100, offset: 0 });
    expect(c.errors[0]).toMatch(/1 of 2 products don't match/);
  });
  it('sends no Content-Type on a plain read', async () => {
    const heads: any[] = [];
    await gelatoCatalogs('k', (async (_u: string, init?: RequestInit) => { heads.push(init?.headers); return new Response('{"data":[]}'); }) as typeof fetch);
    expect(heads[0]['Content-Type']).toBeUndefined();
  });
});
