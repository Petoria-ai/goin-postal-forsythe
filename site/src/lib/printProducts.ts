// Printed products made to order by Gelato (Peter, Nov 25 2026): the presets customers choose from and their prices.
// Everything comes from src/data/printProducts.json, which the owners edit. Pure functions; tested in
// tests/print.test.ts. Plan: monetization/print-suppliers/.
import cfg from '../data/printProducts.json';

export type Spot = { id: string; name: string; file: string; w_in: number; h_in: number; box: number[] };
export type Size = { id: string; name: string; big?: boolean; w_in?: number; h_in?: number; prices?: Record<string, number>; cost?: number };
export type Product = {
  id: string; name: string; kind: 'apparel' | 'flat'; active: boolean; provider: string; gelato_uid: string;
  price?: number; big_size_extra?: number; extra_spot?: number; cost?: number;
  colors?: { id: string; name: string; hex: string }[]; sizes: Size[]; spots?: Spot[];
};
export const PRINT = cfg as unknown as { shipping: { price: number }; min_dpi: number; good_dpi: number; max_quantity_online: number; products: Product[] };
export const activeProducts = () => PRINT.products.filter((p) => p.active);
export const productById = (id: unknown) => PRINT.products.find((p) => p.id === String(id ?? '') && p.active) ?? null;
const money = (n: number) => Math.round(n * 100) / 100;

/**
 * What the customer picked. Apparel: a color, one or more print spots, and how many of each size ({ m: 2, l: 1 }).
 * Flat (posters, flyers): a size and one of that size's quantities.
 */
export type Picks = { color?: string; spots?: string[]; sizes?: Record<string, number>; size?: string; quantity?: number };
export type Line = { name: string; qty: number; unit: number; amount: number };
export type Priced = { product: Product; lines: Line[]; subtotal: number; shipping: number; quantity: number; cost: number; picks: Required<Pick<Picks, 'spots'>> & Picks };

/** Checks the picks against the presets and prices them; throws a plain-English message for anything not allowed. */
export function priceItem(product: Product, picks: Picks): Priced {
  if (product.kind === 'apparel') {
    const color = product.colors?.find((c) => c.id === picks.color);
    if (!color) throw new Error('Pick a shirt color.');
    const spots = [...new Set((picks.spots ?? []).map(String))].filter((s) => product.spots?.some((x) => x.id === s));
    if (!spots.length) throw new Error('Pick where the design goes.');
    if (spots.includes('front') && spots.includes('chest')) throw new Error('Pick front center or left chest, not both (they print on the same side).');
    const sizes: Record<string, number> = {};
    for (const [id, n] of Object.entries(picks.sizes ?? {})) {
      const q = Math.floor(Number(n));
      if (q > 0 && product.sizes.some((s) => s.id === id)) sizes[id] = q;
    }
    const quantity = Object.values(sizes).reduce((a, b) => a + b, 0);
    if (!quantity) throw new Error('Pick at least one size and how many.');
    if (quantity > PRINT.max_quantity_online) throw new Error(`For more than ${PRINT.max_quantity_online} shirts, ask us for a quote: bulk orders are printed locally for less.`);
    const unit = money((product.price ?? 0) + (spots.length - 1) * (product.extra_spot ?? 0));
    const lines: Line[] = Object.entries(sizes).map(([id, qty]) => {
      const sz = product.sizes.find((s) => s.id === id)!;
      const u = money(unit + (sz.big ? product.big_size_extra ?? 0 : 0));
      return { name: `${product.name}, ${color.name}, ${sz.name}`, qty, unit: u, amount: money(u * qty) };
    });
    const subtotal = money(lines.reduce((a, l) => a + l.amount, 0));
    return { product, lines, subtotal, shipping: PRINT.shipping.price, quantity, cost: money((product.cost ?? 0) * quantity), picks: { color: color.id, spots, sizes } };
  }
  const size = product.sizes.find((s) => s.id === picks.size);
  if (!size) throw new Error('Pick a size.');
  const quantity = Math.floor(Number(picks.quantity));
  const total = size.prices?.[String(quantity)];
  if (!total) throw new Error('Pick one of the quantities shown.');
  const lines = [{ name: `${product.name}, ${size.name}`, qty: quantity, unit: money(total / quantity), amount: total }];
  return { product, lines, subtotal: total, shipping: PRINT.shipping.price, quantity, cost: money((size.cost ?? 0) * quantity), picks: { size: size.id, quantity, spots: ['front'] } };
}

/** Gelato's product code for one item (one size and color of a shirt, or the flat product). */
export function gelatoUid(product: Product, sizeId: string, colorId?: string): string {
  return product.gelato_uid.replace('{size}', sizeId).replace('{color}', colorId ?? '');
}

/** The print areas that need artwork: one file per printed side (front center and left chest share the front). */
export function filesNeeded(product: Product, spots: string[]): { file: string; w_in: number; h_in: number }[] {
  if (product.kind === 'flat') return [];
  const out = new Map<string, { file: string; w_in: number; h_in: number }>();
  for (const s of product.spots ?? []) if (spots.includes(s.id)) out.set(s.file, { file: s.file, w_in: s.w_in, h_in: s.h_in });
  return [...out.values()];
}

/** How sharp artwork will print: pixels per inch on its limiting side, and whether that's fine, a warning or too low. */
export function sharpness(px: { w: number; h: number }, inches: { w: number; h: number }): { dpi: number; level: 'good' | 'ok' | 'low' } {
  const dpi = Math.floor(Math.min(px.w / inches.w, px.h / inches.h));
  return { dpi, level: dpi >= PRINT.good_dpi ? 'good' : dpi >= PRINT.min_dpi ? 'ok' : 'low' };
}
