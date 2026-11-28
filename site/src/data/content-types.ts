// Shapes shared by every content file (services, guides, catalog). Each entry carries its own SEO
// fields; anything left out is generated (title from the H1, description from the intro, canonical
// from the path). `seo` holds the manual overrides.
import type { FaqItem } from '../lib/seo';
export type { FaqItem };

/** Manual SEO overrides. Leave a field out to use the generated value. */
export interface SeoOverrides {
  title?: string;          // replaces the generated <title> (the brand is still appended unless it is already in it)
  description?: string;    // replaces the meta description
  canonical?: string;      // point at another URL when this page duplicates it
  noindex?: boolean;       // keep the page live but out of search engines and the sitemap
  ogImage?: string;        // social sharing image, site path or https URL, 1200x630
  ogImageAlt?: string;
}

/** published: live and indexed. draft: not built at all in production (SEO_PREVIEW_DRAFTS=1 builds it, noindexed). */
export type Status = 'published' | 'draft';

export interface Section { h: string; body?: string[]; list?: string[]; table?: { head: string[]; rows: string[][]; caption?: string } }

export interface ImageRef { src: string; alt: string; width?: number; height?: number }

export interface ServiceEntry {
  category: 'shipping' | 'mailboxes' | 'business-services';
  slug: string;              // '' for the category hub
  name: string;              // short name for links and breadcrumbs
  h1: string;
  title: string;             // SEO title, brand appended automatically
  description: string;       // meta description, ~150 characters
  intro: string;             // the lead paragraph: the direct answer
  sections: Section[];
  pricing?: string;          // how pricing works; only published numbers
  restrictions?: string[];
  providers?: string[];      // carriers or partners involved, for copy and schema brand
  faqs: FaqItem[];
  related: string[];         // site paths of related pages
  cta?: { label: string; href: string; track?: string }[];
  status: Status;
  updated: string;           // YYYY-MM-DD of the last real content change
  keywords?: string[];       // internal: the searches the page is written for (never output as a meta tag)
  seo?: SeoOverrides;
  image?: ImageRef;
  /** Other-language versions of this page. Built only when status is published (a complete, reviewed translation). */
  translations?: Partial<Record<'vi', TranslatedPage>>;
}

export interface TranslatedPage {
  path: string; status: Status; reviewedBy?: string;
  name: string; h1: string; title: string; description: string; intro: string; sections: Section[]; faqs: FaqItem[];
  updated: string;
}

export interface GuideEntry {
  slug: string;
  title: string;             // H1 and headline
  seoTitle?: string;
  description: string;
  summary: string;           // the short direct answer at the top (what AI assistants quote)
  sections: Section[];
  faqs?: FaqItem[];
  related: string[];
  sources?: { name: string; url: string }[];
  category: 'shipping' | 'mailboxes' | 'business' | 'printing';
  status: Status;
  published: string;         // YYYY-MM-DD
  updated: string;
  seo?: SeoOverrides;
  image?: ImageRef;
}

export const pathOf = (s: Pick<ServiceEntry, 'category' | 'slug'>) => `/${s.category}${s.slug ? '/' + s.slug : ''}`;
export const guidePath = (g: Pick<GuideEntry, 'slug'>) => `/guides/${g.slug}`;
