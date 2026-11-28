// The online shop's catalog: categories and products for /shop. Built for the custom-printing
// platform to grow into (apparel, drinkware, signs, stickers, marketing materials, promotional
// products) while publishing only what customers can actually order today.
//
// Rules:
// - A product is built, indexed, put in the sitemap and the Merchant Center feed only when
//   `status: 'published'`. Drafts are not built at all.
// - A category page is built only when it has at least one published product, and is indexed only
//   when it has MIN_PRODUCTS_TO_INDEX or more (so a one-product category is not a thin duplicate of
//   its product). Empty categories never appear.
// - Variants and options are attributes of one product page, never separate URLs. Sorting and
//   filtering (when they come) use query parameters that are canonicalized to the clean URL.
// - Prices come from the same tables checkout charges (src/lib/cards.ts), so markup always matches.
// - Reviews: none are marked up until genuine customer reviews are collected and shown on the page.
import { PRICES, QUANTITIES, CARD_OPTIONS } from '../lib/cards';
import type { Status, SeoOverrides, ImageRef, FaqItem } from './content-types';

export const MIN_PRODUCTS_TO_INDEX = 2;

export interface Category { slug: string; name: string; h1: string; title: string; description: string; intro: string; status: Status; seo?: SeoOverrides }
export interface Variant { sku: string; name: string; price: number; availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'MadeToOrder' }
export interface Product {
  slug: string; category: string; name: string; h1: string; title: string; description: string; intro: string;
  sku: string; images: ImageRef[]; variants: Variant[];
  options: { group: string; choices: { name: string; price: number }[] }[];
  specs: { name: string; value: string }[];
  fulfillment: 'pickup' | 'ship' | 'pickup-or-ship';
  designUrl?: string;        // the customization editor (noindexed; the product page is the indexable one)
  returnPolicy?: { path: string; days: number | null } | null; // only once the owners publish a policy page
  faqs: FaqItem[];
  related: string[];
  status: Status; updated: string; seo?: SeoOverrides;
  googleProductCategory?: string; // Merchant Center taxonomy
}

export const CATEGORIES: Category[] = [
  { slug: 'business-cards', name: 'Business cards', h1: 'Custom business cards', title: 'Custom Business Cards', description: 'Design custom business cards online and pick them up in Monroe, LA.', intro: 'Design your cards in the browser, pay online and pick them up at the store.', status: 'published' },
  // Planned. They appear only after their first product is published.
  { slug: 'apparel', name: 'Custom apparel', h1: 'Custom T-shirts, polos and hoodies', title: 'Custom Apparel: T-Shirts, Polos & Hoodies', description: 'Custom printed T-shirts, polo shirts and hoodies for your business or team.', intro: '', status: 'draft' },
  { slug: 'drinkware', name: 'Mugs and drinkware', h1: 'Custom mugs and drinkware', title: 'Custom Mugs & Drinkware', description: 'Custom printed mugs, tumblers and drinkware.', intro: '', status: 'draft' },
  { slug: 'signs-banners', name: 'Signs and banners', h1: 'Banners and yard signs', title: 'Custom Banners & Yard Signs', description: 'Custom vinyl banners and yard signs.', intro: '', status: 'draft' },
  { slug: 'stickers-decals', name: 'Stickers and decals', h1: 'Custom stickers and decals', title: 'Custom Stickers & Decals', description: 'Custom printed stickers and decals.', intro: '', status: 'draft' },
  { slug: 'marketing-materials', name: 'Marketing materials', h1: 'Flyers, brochures and postcards', title: 'Flyers, Brochures & Postcards', description: 'Custom flyers, brochures and postcards.', intro: '', status: 'draft' },
  { slug: 'promotional-products', name: 'Promotional products', h1: 'Promotional products', title: 'Custom Promotional Products', description: 'Custom promotional products for your business.', intro: '', status: 'draft' },
];

const cardOptionGroups = (['stock', 'finish', 'corners', 'speed'] as const).map((g) => ({
  group: { stock: 'Paper', finish: 'Finish', corners: 'Corners', speed: 'Turnaround' }[g],
  choices: CARD_OPTIONS.filter((o) => o.group === g).map((o) => ({ name: o.name, price: o.price })),
}));

export const PRODUCTS: Product[] = [
  {
    slug: 'business-cards', category: 'business-cards', name: 'Standard business cards',
    h1: 'Custom business cards, designed online',
    title: 'Custom Business Cards: Design Online, Pick Up in Monroe, LA',
    description: 'Design custom business cards in your browser from {low}. Choose paper, finish and corners, pay online and pick them up at {street}, Monroe.',
    intro: 'Pick a layout, type your details, add your logo, and order. Standard 3.5 × 2 inch cards in packs of {quantities}, printed for you and ready to pick up at {name}.',
    sku: 'BC-STD',
    images: [{ src: '/images/products/business-cards.png', alt: 'Two sample business cards, front and back, designed with the online card designer', width: 1200, height: 900 }],
    variants: QUANTITIES.map((q) => ({ sku: `BC-STD-${q}`, name: `${q} cards`, price: PRICES[q], availability: 'MadeToOrder' as const })),
    options: cardOptionGroups,
    specs: [
      { name: 'Size', value: '3.5 × 2 in (standard U.S. business card)' },
      { name: 'Sides', value: 'Front and back' },
      { name: 'Quantities', value: QUANTITIES.join(', ') },
      { name: 'Paper', value: CARD_OPTIONS.filter((o) => o.group === 'stock').map((o) => o.name).join(', ') },
      { name: 'Finish', value: CARD_OPTIONS.filter((o) => o.group === 'finish').map((o) => o.name).join(', ') },
      { name: 'Turnaround', value: CARD_OPTIONS.filter((o) => o.group === 'speed').map((o) => o.name).join('; ') },
      { name: 'Delivery', value: 'Pick up at the store' },
    ],
    fulfillment: 'pickup',
    designUrl: '/cards',
    returnPolicy: null, // TODO owners: publish a returns/reprint policy for custom printing, then link it here
    faqs: [
      { q: 'How long do business cards take?', a: 'Standard orders are ready in 3 business days. Rush orders are ready the next business day for an extra charge.' },
      { q: 'Can I upload my own logo?', a: 'Yes. Add a PNG, JPG or SVG logo or photo in the designer and place it anywhere on the card.' },
      { q: 'Do you ship business cards?', a: 'Cards are picked up at the store in Monroe. We contact you when they are ready.' },
      { q: 'What size are the cards?', a: 'Standard U.S. business card size, 3.5 by 2 inches, printed front and back.' },
    ],
    related: ['/business-services/printing', '/mailboxes/business-address', '/guides/how-to-get-a-business-mailing-address'],
    status: 'published', updated: '2026-11-28',
    googleProductCategory: '', // TODO: pick the Merchant Center category when the feed is set up; left blank rather than guessed
  },
];

export const productPath = (p: Pick<Product, 'slug'>) => `/shop/${p.slug}`;
export const categoryPath = (c: Pick<Category, 'slug'>) => `/shop/category/${c.slug}`;
export const publishedProducts = (all = PRODUCTS) => all.filter((p) => p.status === 'published');
export const productsIn = (cat: string, all = PRODUCTS) => publishedProducts(all).filter((p) => p.category === cat);
/** Categories that get a page: published, with at least one published product. */
export const liveCategories = (cats = CATEGORIES, prods = PRODUCTS) => cats.filter((c) => c.status === 'published' && productsIn(c.slug, prods).length > 0);
export const categoryIndexable = (c: Category, prods = PRODUCTS) => productsIn(c.slug, prods).length >= MIN_PRODUCTS_TO_INDEX && !c.seo?.noindex;
export const lowPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
