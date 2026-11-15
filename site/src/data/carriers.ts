// The carriers the store ships with, shown across the site (Peter, Nov 15 2026): beside the logo, under the
// tracking box, on the Ship page and in the footer.
//
// Logos: the UPS, FedEx, USPS and DHL logos are trademarks. Only the official files may be used, as supplied and
// under each carrier's brand rules (usually for authorized retail locations; Goin' Postal corporate or the carrier's
// retail program provides them). Never redraw or recolor them. Until a file is here the carrier's name shows as a
// plain text badge. To switch one on: put the official file in site/public/brand/carriers/ and set `logo` below,
// for example logo: '/brand/carriers/ups.svg'.
export interface Carrier { id: 'usps' | 'ups' | 'fedex' | 'dhl'; name: string; logo: string | null }
export const CARRIERS: Carrier[] = [
  { id: 'usps', name: 'USPS', logo: null },
  { id: 'ups', name: 'UPS', logo: null },
  { id: 'fedex', name: 'FedEx', logo: null },
  { id: 'dhl', name: 'DHL', logo: null },
];
