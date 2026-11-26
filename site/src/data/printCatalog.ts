// The print catalog (Peter, Nov 25 2026): the bar across the top of every page ("i like how vistaprint or 4over has
// their catalog all over the top"), its big dropdown per category ("lets add a drop down menu like how this works",
// like Gelato's), the picture cards on the print shop and home pages, and the shop pages /shop/<category> and
// /shop/<category>/<section> with a strip of the category's other sections at the top ("just incase they want to browse
// for other stuff"). Home & Living and Pets added Nov 26 2026 (Peter, from Gelato's bar).
// Each category has sections (T-shirts, Hoodies, ...). A section lists the products that are online (ids from
// src/data/printProducts.json, or a link such as business cards); a section with none yet shows "ask for a price".
// Pictures are drawings (components/PrintArt.astro) until real photos arrive. To add a section or a product, edit here.
import print from './printProducts.json';
import { PRICES } from '../lib/cards';

export type Section = { id: string; key: string; label: string; art: string; products: string[]; link?: { href: string; key: string; label: string; from: number }; group?: { key: string; label: string } };
export type CatGroup = { id: string; key: string; label: string; art: string; href: string; from: number | null; sections: Section[]; bulk?: boolean };

const product = (id: string) => (print.products as any[]).find((p) => p.id === id && p.active);
/** The lowest price of a product that's online (one shirt, or the cheapest poster or flyer bundle). */
export function lowest(id: string): number | null {
  const p = product(id); if (!p) return null;
  if (p.kind === 'apparel') return p.price;
  return Math.min(...p.sizes.flatMap((s: any) => Object.values(s.prices) as number[]));
}
export const onlineProduct = product;
const cardsFrom = Math.min(...Object.values(PRICES));
const S = (id: string, key: string, label: string, art: string, products: string[] = [], link?: Section['link']): Section => ({ id, key, label, art, products, link });

/** A column heading in the big dropdown (like Gelato's "Kitchen and table"); sections without one go under "Shop by product". */
const G = (key: string, label: string, sections: Section[]) => sections.map((s) => ({ ...s, group: { key, label } }));

const RAW: Omit<CatGroup, 'href' | 'from'>[] = [
  { id: 'womens', key: 'cat.womens', label: "Women's", art: 'womens', bulk: true, sections: [
    S('t-shirts', 'sec.tshirts', 'T-shirts', 'womens', ['tshirt']), S('hoodies', 'sec.hoodies', 'Hoodies', 'hoodie'),
    S('long-sleeve', 'sec.longsleeve', 'Long sleeve', 'longsleeve'), S('tank-tops', 'sec.tanks', 'Tank tops', 'tank'), S('crop-tops', 'sec.crop', 'Crop tops', 'crop'),
  ] },
  { id: 'mens', key: 'cat.mens', label: "Men's", art: 'mens', bulk: true, sections: [
    S('t-shirts', 'sec.tshirts', 'T-shirts', 'tee', ['tshirt']), S('hoodies', 'sec.hoodies', 'Hoodies', 'mens'),
    S('long-sleeve', 'sec.longsleeve', 'Long sleeve', 'longsleeve'), S('polos', 'sec.polos', 'Polo shirts', 'polo'), S('tank-tops', 'sec.tanks', 'Tank tops', 'tank'),
  ] },
  // Kids & Baby, Home & Living and Drinkware follow Gelato's own dropdowns (Peter's screenshots, Nov 25 2026).
  { id: 'kids', key: 'cat.kids', label: 'Kids & Baby', art: 'kids', bulk: true, sections: [
    ...G('grp.kids', 'Kids, 2 to 14', [S('kids-tees', 'sec.kidstees', "Kids' t-shirts", 'kidstee'), S('kids-hoodies', 'sec.kidshoodies', "Kids' hoodies", 'hoodie'),
      S('kids-long-sleeve', 'sec.longsleeve', 'Long sleeve', 'longsleeve'), S('kids-caps', 'sec.caps', 'Caps', 'hats')]),
    ...G('grp.baby', 'Baby, 0 to 24 months', [S('bodysuits', 'sec.bodysuits', 'Bodysuits', 'kids'), S('rompers', 'sec.rompers', 'Rompers', 'romper')]),
    ...G('grp.alsokids', 'Also for kids', [S('kids-aprons', 'sec.aprons', 'Aprons', 'apron'), S('kids-lunch-boxes', 'sec.lunchboxes', 'Lunch boxes', 'lunchbox')]),
  ] },
  { id: 'accessories', key: 'cat.hats', label: 'Accessories', art: 'hats', bulk: true, sections: [
    S('caps', 'sec.caps', 'Caps', 'hats'), S('beanies', 'sec.beanies', 'Beanies', 'beanie'), S('totes', 'sec.totes', 'Tote bags', 'tote'),
    S('phone-cases', 'sec.phonecases', 'Phone cases', 'phonecase'),
  ] },
  { id: 'home-living', key: 'cat.home', label: 'Home & Living', art: 'home', sections: [
    ...G('grp.kitchen', 'Kitchen and table', [S('aprons', 'sec.aprons', 'Aprons', 'apron'), S('coasters', 'sec.coasters', 'Coasters', 'coaster'), S('lunch-boxes', 'sec.lunchboxes', 'Lunch boxes', 'lunchbox')]),
    ...G('grp.decor', 'Home and decor', [S('ornaments', 'sec.ornaments', 'Ornaments', 'ornament'), S('candles', 'sec.candles', 'Candles', 'candle'), S('golf-balls', 'sec.golfballs', 'Golf balls', 'golfball')]),
  ] },
  { id: 'pets', key: 'cat.pets', label: 'Pets', art: 'pets', sections: [
    S('bandanas', 'sec.bandanas', 'Pet bandanas', 'bandana'), S('pet-beds', 'sec.petbeds', 'Pet beds', 'petbed'), S('pet-bowls', 'sec.petbowls', 'Pet bowls', 'petbowl'),
  ] },
  { id: 'drinkware', key: 'cat.drink', label: 'Drinkware', art: 'drinkware', sections: [
    S('ceramic-mugs', 'sec.ceramicmugs', 'Ceramic mugs', 'mug'), S('enamel-mugs', 'sec.enamelmugs', 'Enamel mugs', 'enamelmug'), S('travel-mugs', 'sec.travelmugs', 'Travel mugs', 'travelmug'),
    S('bottles', 'sec.bottles', 'Water bottles', 'bottle'), S('latte-mugs', 'sec.lattemugs', 'Latte mugs', 'lattemug'), S('slim-mugs', 'sec.slimmugs', 'Slim mugs', 'slimmug'),
    S('glassware', 'sec.glassware', 'Glassware & cups', 'glass'), S('tumblers', 'sec.tumblers', 'Tumblers', 'drinkware'), S('can-coolers', 'sec.cancoolers', 'Can coolers', 'cancooler'),
    S('food-jars', 'sec.foodjars', 'Food jars', 'foodjar'),
  ] },
  { id: 'wall-art', key: 'cat.wallart', label: 'Wall Art', art: 'wallart', sections: [
    S('posters', 'sec.posters', 'Posters', 'poster', ['poster']), S('framed', 'sec.framed', 'Framed prints', 'wallart'), S('canvas', 'sec.canvas', 'Canvas', 'canvas'),
  ] },
  { id: 'signs', key: 'cat.signsonly', label: 'Signs & Banners', art: 'signs', sections: [
    S('banners', 'sec.banners', 'Banners', 'signs'), S('yard-signs', 'sec.yardsigns', 'Yard signs', 'yardsign'),
  ] },
  { id: 'stationery', key: 'cat.stationery', label: 'Cards & Stationery', art: 'stationery', sections: [
    S('business-cards', 'sec.cards', 'Business cards', 'card', [], { href: '/cards', key: 'cat.cards.design', label: 'Design your business cards', from: cardsFrom }),
    S('flyers', 'sec.flyers', 'Flyers', 'stationery', ['flyer']), S('postcards', 'sec.postcards', 'Postcards', 'postcard'),
  ] },
];

const sectionFrom = (s: Section) => {
  const prices = [...s.products.map(lowest), s.link?.from ?? null].filter((n): n is number => n != null);
  return prices.length ? Math.min(...prices) : null;
};
export const PRINT_CATALOG: CatGroup[] = RAW.map((c) => {
  const prices = c.sections.map(sectionFrom).filter((n): n is number => n != null);
  return { ...c, href: `/shop/${c.id}`, from: prices.length ? Math.min(...prices) : null };
});
export { sectionFrom };
export const catById = (id: string) => PRINT_CATALOG.find((c) => c.id === id) ?? null;
/** The bar also ends with a link to every printing product. */
export const ALL_PRINTING = { href: '/printing', key: 'cat.all', label: 'All Printing' };

/** The big dropdown's columns: one per heading (Section.group), in order; sections without a heading go under "Shop by
 *  product", five to a column (the later ones have no heading of their own, `more`). */
export function mmColumns(sections: Section[], perCol = 5): { head: Section['group'] | null; more: boolean; items: Section[] }[] {
  const cols: { head: Section['group'] | null; more: boolean; items: Section[] }[] = [];
  const plain = sections.filter((s) => !s.group);
  for (let i = 0; i < plain.length; i += perCol) cols.push({ head: null, more: i > 0, items: plain.slice(i, i + perCol) });
  for (const s of sections) {
    if (!s.group) continue;
    const c = cols.find((x) => x.head?.key === s.group!.key);
    if (c) c.items.push(s); else cols.push({ head: s.group, more: false, items: [s] });
  }
  return cols;
}
