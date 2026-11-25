// The print catalog (Peter, Nov 25 2026): the bar across the top of every page ("i like how vistaprint or 4over has
// their catalog all over the top") and the picture cards on the print shop and home pages ("gelato has pictures of the
// types of things they sell ... having the categories would enable shoppers/customers separated in genders").
// One entry per category: where it leads, its short menu, its picture (an illustration in PrintCategories.astro until
// real photos come from Gelato's Mockup Studio or samples), and its starting price. A category without products online
// yet leads to the page where customers ask for a price. To add a category or a product, edit this file.
import print from './printProducts.json';
import { PRICES } from '../lib/cards';

export type CatItem = { href: string; key: string; label: string };
export type CatGroup = { id: string; href: string; key: string; label: string; art: string; from: number | null; items: CatItem[] };

const product = (id: string) => (print.products as any[]).find((p) => p.id === id && p.active);
const lowest = (id: string): number | null => {
  const p = product(id); if (!p) return null;
  if (p.kind === 'apparel') return p.price;
  return Math.min(...p.sizes.flatMap((s: any) => Object.values(s.prices) as number[]));
};
const shirt = lowest('tshirt'), poster = lowest('poster'), flyer = lowest('flyer');
const cards = Math.min(...Object.values(PRICES));

export const PRINT_CATALOG: CatGroup[] = [
  { id: 'womens', href: '/print?product=tshirt', key: 'cat.womens', label: "Women's", art: 'womens', from: shirt, items: [
    { href: '/print?product=tshirt', key: 'cat.shirts.design', label: 'Design a custom t-shirt' },
    { href: '/printing/t-shirts', key: 'cat.shirts.bulk', label: 'Team, church & business orders (12+)' },
  ] },
  { id: 'mens', href: '/print?product=tshirt', key: 'cat.mens', label: "Men's", art: 'mens', from: shirt, items: [
    { href: '/print?product=tshirt', key: 'cat.shirts.design', label: 'Design a custom t-shirt' },
    { href: '/printing/t-shirts', key: 'cat.shirts.bulk', label: 'Team, church & business orders (12+)' },
  ] },
  { id: 'kids', href: '/printing/t-shirts', key: 'cat.kids', label: 'Kids & Baby', art: 'kids', from: null, items: [
    { href: '/printing/t-shirts', key: 'cat.kids.ask', label: "Kids' shirts & baby onesies (ask us)" },
  ] },
  { id: 'hats', href: '/printing/t-shirts', key: 'cat.hats', label: 'Hats & Accessories', art: 'hats', from: null, items: [
    { href: '/printing/t-shirts', key: 'cat.shirts.embroidery', label: 'Embroidered shirts & hats' },
  ] },
  { id: 'drinkware', href: '/printing/promo', key: 'cat.drink', label: 'Drinkware', art: 'drinkware', from: null, items: [
    { href: '/printing/promo', key: 'cat.drink.ask', label: 'Mugs & bottles (ask us)' },
  ] },
  { id: 'wallart', href: '/print?product=poster', key: 'cat.wallart', label: 'Wall Art & Posters', art: 'wallart', from: poster, items: [
    { href: '/print?product=poster', key: 'cat.signs.posters', label: 'Design a poster' },
  ] },
  { id: 'signs', href: '/printing/banners', key: 'cat.signsonly', label: 'Signs & Banners', art: 'signs', from: null, items: [
    { href: '/printing/banners', key: 'cat.signs.banners', label: 'Banners & yard signs' },
  ] },
  { id: 'stationery', href: '/cards', key: 'cat.stationery', label: 'Business Cards & Stationery', art: 'stationery', from: Math.min(cards, flyer ?? cards), items: [
    { href: '/cards/design', key: 'cat.cards.design', label: 'Design your business cards' },
    { href: '/print?product=flyer', key: 'cat.flyers.design', label: 'Design flyers' },
    { href: '/printing/promo', key: 'cat.promo.items', label: 'Pens, mugs & giveaways' },
  ] },
];
/** The bar also ends with a link to every printing product. */
export const ALL_PRINTING = { href: '/printing', key: 'cat.all', label: 'All Printing' };
