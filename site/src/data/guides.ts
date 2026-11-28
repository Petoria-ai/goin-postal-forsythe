// Educational guides at /guides/<slug>. Written to be quoted: a short direct answer first
// (`summary`), then headed sections, tables and steps. Only facts we can stand behind: the store's
// own operations, carriers' published limits and USPS rules. Each guide has a published and an
// updated date, shown on the page and in the Article structured data.
//
// A topic we want but have not written properly stays `status: 'draft'`: it is not built, not in the
// sitemap and not linked. Never publish a thin or generic article just to have one.
import type { GuideEntry } from './content-types';

const D = '2026-11-28';

export const GUIDES: GuideEntry[] = [
  {
    slug: 'physical-vs-virtual-mailbox', category: 'mailboxes', status: 'published', published: D, updated: D,
    title: 'Physical vs. virtual mailbox: which one do you need?',
    seoTitle: 'Physical vs. Virtual Mailbox: Which Is Right for You?',
    description: 'Physical mailboxes mean picking up mail in person; virtual ones let you manage mail online. Which suits small businesses, remote workers and travelers.',
    summary: 'A **physical mailbox** is a box at a store that you visit to collect your mail and packages. A **virtual mailbox** is the same kind of street address, but the store shows you each envelope online and you decide whether it is scanned, forwarded, held or shredded. Pick physical if you are nearby every week; pick virtual if you travel, work remotely or are not local.',
    sections: [
      { h: 'Side by side', table: {
        head: ['', 'Physical mailbox', 'Virtual mailbox'],
        rows: [
          ['How you get mail', 'Pick it up in person', 'See it online, then scan, forward or pick up'],
          ['Address', 'Store street address + your box number', 'Store street address + your mailbox number'],
          ['Packages', 'Held for pickup', 'Logged online; forward or pick up'],
          ['Works when you are away', 'Only if someone collects or we forward', 'Yes, from anywhere'],
          ['Paperwork', 'USPS Form 1583 and two IDs', 'USPS Form 1583 and two IDs'],
        ],
      } },
      { h: 'Best for small business owners', body: [
        'If you run the business from Monroe and pass the store often, a physical mailbox is the simplest way to get a professional address and someone to accept deliveries. If your business is online-only or you are rarely in town, a virtual mailbox lets you deal with checks, notices and bills from your phone.',
      ] },
      { h: 'Best for remote workers', body: [
        'Remote workers who move between cities, or who want their home address off company paperwork, usually prefer a virtual mailbox: mail is visible the day it arrives, wherever you are.',
      ] },
      { h: 'Best for frequent travelers', body: [
        'Travelers, RV owners and people who spend part of the year elsewhere get the most from a virtual mailbox with forwarding: you see what came in and choose what to send on.',
      ] },
      { h: 'At {name}', body: [
        'We offer both at {street}: [physical mailboxes](/mailboxes/physical) rented at the counter, and [virtual mailboxes](/mailboxes/virtual) through Anytime Mailbox.',
      ] },
    ],
    faqs: [
      { q: 'Is a virtual mailbox a real address?', a: 'Yes. A virtual mailbox uses the store\'s real street address with your mailbox number.' },
      { q: 'Can I switch between physical and virtual?', a: 'Yes, but each mailbox needs its own USPS Form 1583 with its own number.' },
    ],
    related: ['/mailboxes', '/mailboxes/physical', '/mailboxes/virtual', '/guides/private-mailbox-vs-po-box'],
  },
  {
    slug: 'private-mailbox-vs-po-box', category: 'mailboxes', status: 'published', published: D, updated: D,
    title: 'Private mailbox vs. PO Box: the differences that matter',
    seoTitle: 'Private Mailbox vs. PO Box: Key Differences Explained',
    description: 'A private mailbox at a shipping store uses a street address and accepts packages from every carrier. A USPS PO Box is at the post office. Here is how they compare.',
    summary: 'A **PO Box** is rented from the U.S. Postal Service at a post office and has a "PO Box" address. A **private mailbox** is rented from a business such as a shipping store, uses the store\'s **street address** with your box number, and can accept packages from **UPS, FedEx and DHL** as well as USPS. Private carriers generally cannot deliver to a PO Box.',
    sections: [
      { h: 'Comparison', table: {
        head: ['', 'Private mailbox', 'USPS PO Box'],
        rows: [
          ['Rented from', 'A business (a Commercial Mail Receiving Agency)', 'The U.S. Postal Service'],
          ['Address format', 'Street address + "#" or "PMB" + box number', 'PO Box + number'],
          ['UPS, FedEx and DHL packages', 'Accepted', 'Generally not deliverable'],
          ['Access', 'Store hours', 'Post office lobby hours'],
          ['Sign-up', 'USPS Form 1583 and two IDs', 'USPS application and two IDs'],
        ],
      } },
      { h: 'Why the street address matters', body: [
        'Many online stores, banks and suppliers ask for a street address, and private carriers deliver only to street addresses. A private mailbox gives you one without using your home address.',
      ] },
      { h: 'The paperwork', body: [
        'USPS requires every private mailbox holder to sign **PS Form 1583** and show two forms of ID, one with a photo. It authorizes the store to receive mail for you.',
      ] },
      { h: 'In Monroe', body: [
        '{name} rents [private mailboxes](/mailboxes/physical) at {street}, with pickup seven days a week.',
      ] },
    ],
    sources: [{ name: 'USPS', url: 'https://www.usps.com/' }],
    related: ['/mailboxes/physical', '/mailboxes', '/guides/physical-vs-virtual-mailbox', '/shipping/usps'],
  },
  {
    slug: 'how-to-get-a-business-mailing-address', category: 'mailboxes', status: 'published', published: D, updated: D,
    title: 'How to get a business mailing address',
    seoTitle: 'How to Get a Business Mailing Address (Step by Step)',
    description: 'The steps to get a professional business mailing address with a private or virtual mailbox: choose the type, bring two IDs, sign USPS Form 1583, start using it.',
    summary: 'The quickest way to get a business mailing address is to rent a **private or virtual mailbox** at a shipping store. Bring two forms of ID, sign **USPS Form 1583** naming you and your business, and you can use the address right away for mail and packages.',
    sections: [
      { h: 'Steps', list: [
        '**Decide physical or virtual.** Physical if you will pick up in person; virtual if you want to see and manage mail online. See [physical vs. virtual](/guides/physical-vs-virtual-mailbox).',
        '**Gather two IDs.** One must have your photo; one must show your address.',
        '**Sign USPS Form 1583.** List the business name and every person who will receive mail.',
        '**Start using the address.** Update your website, invoices, cards and supplier accounts.',
      ] },
      { h: 'Before you put it on a filing', body: [
        'A mailbox address is a mailing address. Some registrations, such as a registered agent or a business license that needs a physical office, have their own rules. Check what each filing requires.',
      ] },
      { h: 'In Monroe', body: [
        '{name} offers [business mailing addresses](/mailboxes/business-address) at {street}. Print your new address on [business cards](/shop/business-cards) while you are here.',
      ] },
    ],
    related: ['/mailboxes/business-address', '/mailboxes/virtual', '/mailboxes/physical', '/shop/business-cards'],
  },
  {
    slug: 'compare-ups-fedex-usps-dhl', category: 'shipping', status: 'published', published: D, updated: D,
    title: 'UPS vs. FedEx vs. USPS vs. DHL: how to choose a carrier',
    seoTitle: 'UPS vs FedEx vs USPS vs DHL: How to Choose a Carrier',
    description: 'How the four big carriers differ on size limits, speed and international reach, and how to pick the right one for each package, with published limits.',
    summary: 'There is no single best carrier. **USPS** is often cheapest for light packages and reaches every U.S. address. **UPS** and **FedEx** take bigger boxes (up to 150 lb) and are strong for heavy ground shipments and guaranteed express. **DHL Express** is built for international shipping. The surest way to choose is to compare quotes for your actual box.',
    sections: [
      { h: 'Published size and weight limits', table: {
        caption: 'Single-package maximums published by each carrier. Some services are lower.',
        head: ['Carrier', 'Max weight', 'Max size', 'Strengths'],
        rows: [
          ['USPS', '70 lb', '130 in length + girth', 'Light packages, every U.S. address including PO Boxes and APO/FPO'],
          ['UPS', '150 lb', '165 in length + girth', 'Heavy ground shipments, business deliveries, express'],
          ['FedEx', '150 lb', '165 in length + girth', 'Heavy ground shipments, express and overnight'],
          ['DHL Express', 'Varies by service', 'Varies by service', 'International express with customs handled'],
        ],
      } },
      { h: 'Which carrier is best for international shipments?', body: [
        'For speed and door-to-door tracking, express services from DHL, UPS and FedEx are the usual choice; DHL Express is built around international delivery. For light, non-urgent items, USPS international services can cost less. Duties, restricted items and the destination\'s customs rules matter as much as price. See [international shipping](/shipping/international).',
      ] },
      { h: 'Things that change the price', list: [
        '**Size**: big, light boxes are charged by dimensional weight.',
        '**Distance**: carriers price by zone.',
        '**Speed**: express costs more than ground.',
        '**Surcharges**: residential delivery, remote areas, large or heavy packages.',
      ] },
      { h: 'Compare in one place', body: [
        'At {name} we quote all four for your box at the counter, and [PeterShip](/ship) compares USPS, UPS, FedEx and DHL online for U.S. addresses.',
      ] },
    ],
    sources: [{ name: 'USPS', url: 'https://www.usps.com/' }, { name: 'UPS', url: 'https://www.ups.com/' }, { name: 'FedEx', url: 'https://www.fedex.com/' }, { name: 'DHL', url: 'https://www.dhl.com/' }],
    related: ['/shipping', '/shipping/international', '/shipping/domestic', '/ship'],
  },
  {
    slug: 'how-to-package-a-shipment', category: 'shipping', status: 'published', published: D, updated: D,
    title: 'How to properly package a shipment',
    seoTitle: 'How to Package a Shipment So It Arrives Safely',
    description: 'Step-by-step packing: the right box, two inches of cushioning, the shake test, the H-taping method and a clean label. Plus how to pack fragile and heavy items.',
    summary: 'Use a **sturdy box** a little bigger than the item, wrap the item, fill **about two inches of cushioning** on every side, make sure nothing moves when you shake it, tape every seam in an **H pattern**, and put one clear label on the largest side with old labels removed.',
    sections: [
      { h: 'Step by step', list: [
        '**Choose the box.** Strong corrugated cardboard, not too big: carriers charge for size.',
        '**Wrap the item.** Bubble wrap or foam around each piece; wrap separate items separately.',
        '**Cushion every side.** About two inches between the item and each wall of the box.',
        '**Shake test.** Close the box and shake it. If anything moves, add more filler.',
        '**Tape in an H.** Tape along the center seam and across both edge seams, top and bottom.',
        '**Label once.** Remove or cover old labels and barcodes. Put the new label flat on the top.',
      ] },
      { h: 'Fragile items', body: [
        'Double-box: pack the item in a small box, then put that box in a bigger one with cushioning between them. "Fragile" stickers do not stop machine sorting; packing does. See [fragile item shipping](/shipping/fragile).',
      ] },
      { h: 'Heavy items', body: [
        'Use a double-wall box, heavy-duty tape and dense filler that does not compress. Keep single boxes under the carrier limit: 70 lb for USPS, 150 lb for UPS and FedEx. Heavier than that is [freight](/shipping/freight).',
      ] },
      { h: 'Or let us pack it', body: [
        'Bring it in loose to [{name}](/shipping/packing) and we will pack it for you.',
      ] },
    ],
    related: ['/shipping/packing', '/shipping/fragile', '/shipping/heavy-oversized', '/shipping/freight'],
  },
  {
    slug: 'where-to-ship-packages-on-sunday-monroe', category: 'shipping', status: 'published', published: D, updated: D,
    title: 'Where to ship packages on Sunday in Monroe, LA',
    seoTitle: 'Where to Ship Packages on Sunday in Monroe, LA',
    description: '{name} at {street} is open Sundays {sundayHours} for shipping, drop-offs and returns. What to know about weekend pickups.',
    summary: 'In Monroe, **{name}** at {street} is open **Sunday {sundayHours}** and **Saturday {saturdayHours}**. You can pack and ship UPS, FedEx, USPS and DHL packages, drop off prepaid labels and send returns. Packages dropped off on the weekend leave with the next scheduled carrier pickup.',
    sections: [
      { h: 'What you can do on a Sunday', list: [
        'Ship a package with [UPS](/shipping/ups), [FedEx](/shipping/fedex), [USPS](/shipping/usps) or [DHL](/shipping/dhl)',
        '[Drop off a prepaid package](/shipping/drop-off)',
        '[Return an online order](/shipping/returns) with a label or QR code',
        'Have it [packed](/shipping/packing)',
        'Collect mail from your [mailbox](/mailboxes/physical)',
      ] },
      { h: 'When will it leave?', body: [
        'The store is open on the weekend, but carriers set their own pickup days. A package you drop off on Saturday or Sunday is scanned in and leaves with the next scheduled pickup for that carrier. If it has to arrive by a certain date, tell us and we will show you which service can do it.',
      ] },
      { h: 'Weekday evenings too', body: [
        'Can\'t make it on the weekend? We are open until {weekdayClose} Monday through Friday.',
      ] },
    ],
    related: ['/shipping/drop-off', '/shipping', '/shipping/returns', '/contact'],
  },
  {
    slug: 'where-to-print-shipping-labels', category: 'shipping', status: 'published', published: D, updated: D,
    title: 'Where to print a shipping label without a printer',
    seoTitle: 'Where to Print a Shipping Label Without a Printer',
    description: 'No printer at home? You can bring a QR code or emailed label to a shipping store and have it printed and attached. How it works in Monroe, LA.',
    summary: 'If you have a shipping label as a **QR code** or **email** but no printer, bring the package and your phone to a shipping store. At **{name}** we print the label, attach it and hand the package to the carrier.',
    sections: [
      { h: 'Your options', list: [
        '**A QR code from a retailer or carrier**: show it at the counter; we scan and print.',
        '**A PDF label in your email**: forward it or show it; we print it.',
        '**No label yet**: buy one at the counter, or online with [PeterShip](/ship) and show us the QR code.',
      ] },
      { h: 'Tips', list: ['Have the package sealed before you arrive.', 'Remove or cover any old labels on a reused box.', 'Keep the receipt or drop-off scan as proof.'] },
    ],
    related: ['/shipping/label-printing', '/shipping/drop-off', '/shipping/returns', '/ship'],
  },
  {
    slug: 'how-to-return-online-purchases', category: 'shipping', status: 'published', published: D, updated: D,
    title: 'How to return an online purchase',
    seoTitle: 'How to Return an Online Purchase (Step by Step)',
    description: 'Start the return with the retailer, get the label or QR code, pack the item, and drop it off with the right carrier. How returns work at {name}.',
    summary: 'Start the return on the retailer\'s website or app, choose the drop-off option, and you get a **label or QR code** for a carrier. Pack the item, bring it with the code to a shipping store that handles that carrier, and keep the **drop-off receipt** until your refund arrives.',
    sections: [
      { h: 'Steps', list: [
        '**Start the return** in your order history and note the deadline.',
        '**Pick drop-off** and note which carrier it uses (UPS, FedEx or USPS).',
        '**Pack it.** Original box if you have it; we can [pack it](/shipping/packing) if not.',
        '**Drop it off** with the label or QR code. We print the label from your phone if needed.',
        '**Keep proof** until the refund shows up.',
      ] },
      { h: 'Good to know', body: [
        'Some retailers accept certain return types only at specific partner stores. Check the drop-off locations listed in your return instructions.',
      ] },
    ],
    related: ['/shipping/returns', '/shipping/label-printing', '/shipping/drop-off', '/shipping/packing'],
  },
  {
    slug: 'how-to-get-fingerprinted', category: 'business', status: 'published', published: D, updated: D,
    title: 'How to get fingerprinted for a job or license',
    seoTitle: 'How to Get Fingerprinted for a Job or License',
    description: 'Find out what type of fingerprints your agency needs, bring ID and any card they gave you, and prepare your hands for clear prints. Fingerprinting in Monroe, LA.',
    summary: 'Start with the **instructions from whoever asked for your fingerprints**: they say which card or electronic system to use and where results go. Then book a fingerprinting location that can do that type, bring a **government photo ID** and any **card** you were given, and arrive with clean, dry hands.',
    sections: [
      { h: 'Steps', list: [
        '**Read your agency\'s instructions.** Note the type of fingerprinting and any codes or forms.',
        '**Confirm the location can do it.** Call ahead with the instructions.',
        '**Bring ID and paperwork.** Photo ID, the card if one was provided, and any forms.',
        '**Prepare your hands.** Wash and dry them; skip lotion that day.',
        '**Send or submit** the prints the way the instructions say.',
      ] },
      { h: 'In Monroe', body: [
        '{name} offers [fingerprinting](/business-services/fingerprinting). Call [{phone}](tel) first so we can confirm we can do the type you need.',
      ] },
    ],
    related: ['/business-services/fingerprinting', '/business-services/notary', '/business-services/scanning', '/business-services'],
  },
  {
    slug: 'how-to-send-a-fax', category: 'business', status: 'published', published: D, updated: D,
    title: 'How to send a fax without a fax machine',
    seoTitle: 'How to Send a Fax Without a Fax Machine',
    description: 'Get the fax number, prepare the pages and a cover sheet, and send from a shipping store. Keep the confirmation page as proof. Faxing in Monroe, LA.',
    summary: 'Get the full **fax number** (with area code), have the **pages** ready on paper or on your phone, add a **cover sheet** if the receiver wants one, and send from a store that offers faxing. Keep the **confirmation page** as proof it went through.',
    sections: [
      { h: 'Steps', list: [
        'Confirm the fax number and whether a cover sheet is required.',
        'Put the pages in order. Files on a phone can be printed first.',
        'Write a cover sheet: to, from, your phone number, number of pages.',
        'Send, and ask for the confirmation page.',
      ] },
      { h: 'In Monroe', body: [
        '{name} sends [faxes](/business-services/fax) at {street}, weekdays until {weekdayClose} and on weekends.',
      ] },
    ],
    related: ['/business-services/fax', '/business-services/printing', '/business-services/scanning', '/business-services'],
  },

  // ---- drafts: wanted, not yet written well enough to publish ----------------------------------
  { slug: 'how-to-ship-internationally-from-monroe', category: 'shipping', status: 'draft', published: D, updated: D, title: 'How to ship a package internationally from Monroe, Louisiana', description: 'TODO', summary: 'TODO: write from the counter\'s real international process once it is confirmed.', sections: [], related: ['/shipping/international'] },
  { slug: 'how-to-ship-to-vietnam-from-louisiana', category: 'shipping', status: 'draft', published: D, updated: D, title: 'How to ship packages to Vietnam from Louisiana', description: 'TODO', summary: 'TODO: needs the store\'s actual Vietnam services, rates and restricted-item list.', sections: [], related: ['/shipping/vietnam'] },
  { slug: 'how-to-ship-fragile-items', category: 'shipping', status: 'draft', published: D, updated: D, title: 'How to ship fragile items', description: 'TODO', summary: 'TODO', sections: [], related: ['/shipping/fragile'] },
  { slug: 'how-to-ship-heavy-items', category: 'shipping', status: 'draft', published: D, updated: D, title: 'How to ship heavy items', description: 'TODO', summary: 'TODO', sections: [], related: ['/shipping/heavy-oversized'] },
  { slug: 'how-to-ship-freight-and-pallets', category: 'shipping', status: 'draft', published: D, updated: D, title: 'How to ship freight and pallets', description: 'TODO', summary: 'TODO: needs the store\'s freight partners and process.', sections: [], related: ['/shipping/freight'] },
  { slug: 'how-to-rent-a-private-mailbox', category: 'mailboxes', status: 'draft', published: D, updated: D, title: 'How to rent a private mailbox', description: 'TODO', summary: 'TODO: publish once mailbox prices are confirmed.', sections: [], related: ['/mailboxes/physical'] },
  { slug: 'how-to-design-business-cards', category: 'printing', status: 'draft', published: D, updated: D, title: 'How to design professional business cards', description: 'TODO', summary: 'TODO', sections: [], related: ['/shop/business-cards'] },
  { slug: 'how-to-order-custom-business-merchandise', category: 'printing', status: 'draft', published: D, updated: D, title: 'How to order custom business merchandise', description: 'TODO', summary: 'TODO: after apparel and promotional products launch.', sections: [], related: ['/shop'] },
];

export const publishedGuides = (all = GUIDES) => all.filter((g) => g.status === 'published');
export const GUIDE_CATEGORY_NAMES: Record<GuideEntry['category'], string> = { shipping: 'Shipping', mailboxes: 'Mailboxes', business: 'Business services', printing: 'Printing' };
