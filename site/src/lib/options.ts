// Extra services a customer ticks on the ship page (Peter, Nov 14 2026, modelled on Pirate Ship):
// signature confirmation, Media Mail, irregular package and hazardous materials. They travel on the
// parcel as `options`, change which rates are offered, and reach the carrier on the label.
// Pure functions, no imports beyond types: tested directly in tests/options.test.ts.
import type { Address, Rate } from '../shipping/types';

export interface ShipOptions {
  /** Someone signs on delivery. Priced from the add-on catalog (code "signature"); sent to the carrier on the label. */
  signature?: boolean;
  /** USPS Media Mail is offered (books, printed music, recordings, films only). Hidden unless ticked. */
  media_mail?: boolean;
  /** Not a regular box (tubes, rolls, odd shapes): USPS prices it as nonstandard. */
  irregular?: boolean;
  /** Limited-quantity hazardous materials: USPS Ground Advantage only, declared on the label. */
  hazmat?: boolean;
}

export const MEDIA_MAIL_ID = 'usps:MEDIA_MAIL';

/** Reads the options from a request body; anything not exactly true is off. */
export function parseOptions(v: any): ShipOptions {
  const on = (k: keyof ShipOptions) => v?.[k] === true || v?.[k] === 'on';
  const o: ShipOptions = {};
  for (const k of ['signature', 'media_mail', 'irregular', 'hazmat'] as const) if (on(k)) o[k] = true;
  return o;
}

/** A short code for the rate cache key, so a quote with options never reuses one without. */
export function optionsKey(o: ShipOptions | undefined): string {
  return o ? ['signature', 'media_mail', 'irregular', 'hazmat'].filter((k) => o[k as keyof ShipOptions]).map((k) => k[0]).join('') : '';
}

const isMediaMail = (r: Rate) => r.id === MEDIA_MAIL_ID || (r.carrier === 'USPS' && /media mail/i.test(r.service));
const isGroundAdvantage = (r: Rate) => r.carrier === 'USPS' && /ground advantage/i.test(r.service);

/** The rates a customer may pick with these options. Media Mail only when ticked; hazardous materials
 *  only by USPS Ground Advantage (they cannot fly, and Media Mail may not carry them). */
export function applyOptions(rates: Rate[], o: ShipOptions | undefined): Rate[] {
  let out = rates.filter((r) => !isMediaMail(r) || !!o?.media_mail);
  if (o?.hazmat) out = out.filter(isGroundAdvantage);
  return out;
}

/** States where hazardous packages may be bought online: the lower 48 and DC, which USPS reaches by
 *  ground. Alaska, Hawaii, the territories and military addresses go through the counter instead. */
const NOT_BY_GROUND = new Set(['AK', 'HI', 'PR', 'VI', 'GU', 'AS', 'MP', 'AA', 'AE', 'AP']);
export const HAZMAT_AREA = 'Hazardous materials can be bought online only between addresses in the lower 48 states and DC. For Alaska, Hawaii, the US territories and military addresses, bring the package to the counter.';

export function hazmatAllowed(origin: Address, destination: Address): boolean {
  return !NOT_BY_GROUND.has(origin.state.toUpperCase()) && !NOT_BY_GROUND.has(destination.state.toUpperCase());
}
