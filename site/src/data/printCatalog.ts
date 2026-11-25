// The print catalog bar across the top of every page (Peter, Nov 25 2026: "i like how vistaprint or 4over has their
// catalog all over the top"). One entry per category, each with its own short menu. Only what the store really
// sells: designed online (/print, /cards) or quoted in the store (the /printing pages). To add a product, add a line.
export type CatItem = { href: string; key: string; label: string };
export type CatGroup = { href: string; key: string; label: string; items: CatItem[] };

export const PRINT_CATALOG: CatGroup[] = [
  { href: '/cards', key: 'cat.cards', label: 'Business Cards', items: [
    { href: '/cards/design', key: 'cat.cards.design', label: 'Design your business cards' },
    { href: '/cards', key: 'cat.cards.shop', label: 'Papers, finishes and prices' },
  ] },
  { href: '/print?product=tshirt', key: 'cat.shirts', label: 'T-Shirts & Apparel', items: [
    { href: '/print?product=tshirt', key: 'cat.shirts.design', label: 'Design a custom t-shirt' },
    { href: '/printing/t-shirts', key: 'cat.shirts.bulk', label: 'Team, church & business orders (12+)' },
    { href: '/printing/t-shirts', key: 'cat.shirts.embroidery', label: 'Embroidered shirts & hats' },
  ] },
  { href: '/printing/banners', key: 'cat.signs', label: 'Signs, Banners & Posters', items: [
    { href: '/printing/banners', key: 'cat.signs.banners', label: 'Banners & yard signs' },
    { href: '/print?product=poster', key: 'cat.signs.posters', label: 'Design a poster' },
  ] },
  { href: '/print?product=flyer', key: 'cat.flyers', label: 'Flyers & Marketing', items: [
    { href: '/print?product=flyer', key: 'cat.flyers.design', label: 'Design flyers' },
    { href: '/cards', key: 'cat.flyers.cards', label: 'Business cards' },
  ] },
  { href: '/printing/promo', key: 'cat.promo', label: 'Promo Products', items: [
    { href: '/printing/promo', key: 'cat.promo.items', label: 'Pens, mugs & giveaways' },
  ] },
  { href: '/printing', key: 'cat.all', label: 'All Printing', items: [] },
];
