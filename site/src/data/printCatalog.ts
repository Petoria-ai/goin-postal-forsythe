// The print catalog (Peter, Nov 25 2026): the bar across the top of every page ("i like how vistaprint or 4over has
// their catalog all over the top"), its big dropdown per category ("lets add a drop down menu like how this works",
// like Gelato's), the picture cards on the print shop and home pages, and the shop pages /shop/<category> and
// /shop/<category>/<section> with a strip of the category's other sections at the top ("just incase they want to browse
// for other stuff").
// Each category has sections (T-shirts, Hoodies, ...). A section lists the products that are online (ids from
// src/data/printProducts.json, or a link such as business cards); a section with none yet shows "ask for a price".
// Pictures are drawings (components/PrintArt.astro) until real photos arrive. To add a section or a product, edit here.
import print from './printProducts.json';
import { PRICES } from '../lib/cards';

export type Section = { id: string; key: string; label: string; art: string; products: string[]; link?: { href: string; key: string; label: string; from: number } };
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

const RAW: Omit<CatGroup, 'href' | 'from'>[] = [
  { id: 'womens', key: 'cat.womens', label: "Women's", art: 'womens', bulk: true, sections: [
    S('t-shirts', 'sec.tshirts', 'T-shirts', 'womens', ['tshirt']), S('hoodies', 'sec.hoodies', 'Hoodies', 'hoodie'),
    S('long-sleeve', 'sec.longsleeve', 'Long sleeve', 'longsleeve'), S('tank-tops', 'sec.tanks', 'Tank tops', 'tank'), S('crop-tops', 'sec.crop', 'Crop tops', 'crop'),
  ] },
  { id: 'mens', key: 'cat.mens', label: "Men's", art: 'mens', bulk: true, sections: [
    S('t-shirts', 'sec.tshirts', 'T-shirts', 'tee', ['tshirt']), S('hoodies', 'sec.hoodies', 'Hoodies', 'mens'),
    S('long-sleeve', 'sec.longsleeve', 'Long sleeve', 'longsleeve'), S('polos', 'sec.polos', 'Polo shirts', 'polo'), S('tank-tops', 'sec.tanks', 'Tank tops', 'tank'),
  ] },
  { id: 'kids', key: 'cat.kids', label: 'Kids & Baby', art: 'kids', bulk: true, sections: [
    S('kids-tees', 'sec.kidstees', "Kids' t-shirts", 'kidstee'), S('onesies', 'sec.onesies', 'Baby onesies', 'kids'), S('kids-hoodies', 'sec.kidshoodies', "Kids' hoodies", 'hoodie'),
  ] },
  { id: 'hats', key: 'cat.hats', label: 'Hats & Accessories', art: 'hats', bulk: true, sections: [
    S('caps', 'sec.caps', 'Caps', 'hats'), S('beanies', 'sec.beanies', 'Beanies', 'beanie'), S('totes', 'sec.totes', 'Tote bags', 'tote'),
  ] },
  { id: 'drinkware', key: 'cat.drink', label: 'Drinkware', art: 'drinkware', sections: [
    S('mugs', 'sec.mugs', 'Mugs', 'mug'), S('bottles', 'sec.bottles', 'Water bottles', 'bottle'), S('tumblers', 'sec.tumblers', 'Tumblers', 'drinkware'),
  ] },
  { id: 'wall-art', key: 'cat.wallart', label: 'Wall Art & Posters', art: 'wallart', sections: [
    S('posters', 'sec.posters', 'Posters', 'poster', ['poster']), S('framed', 'sec.framed', 'Framed prints', 'wallart'), S('canvas', 'sec.canvas', 'Canvas', 'canvas'),
  ] },
  { id: 'signs', key: 'cat.signsonly', label: 'Signs & Banners', art: 'signs', sections: [
    S('banners', 'sec.banners', 'Banners', 'signs'), S('yard-signs', 'sec.yardsigns', 'Yard signs', 'yardsign'),
  ] },
  { id: 'stationery', key: 'cat.stationery', label: 'Business Cards & Stationery', art: 'stationery', sections: [
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
