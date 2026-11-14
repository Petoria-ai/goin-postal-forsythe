import { describe, it, expect } from 'vitest';
import { applyOptions, hazmatAllowed, optionsKey, parseOptions } from '../src/lib/options';
import type { Address, Rate } from '../src/shipping/types';

const rate = (id: string, carrier: Rate['carrier'], service: string): Rate => ({ id, carrier, service, cost: 5, total_charge: 6, currency: 'USD', min_days: 2, max_days: 5, billable_weight_lb: 1 });
const RATES = [
  rate('usps:USPS_GROUND_ADVANTAGE', 'USPS', 'USPS Ground Advantage'),
  rate('usps:PRIORITY_MAIL', 'USPS', 'USPS Priority Mail'),
  rate('usps:MEDIA_MAIL', 'USPS', 'USPS Media Mail'),
  rate('ups:03', 'UPS', 'UPS Ground'),
  rate('easyship:mock-usps-media', 'USPS', 'USPS Media Mail'),
];
const at = (state: string): Address => ({ contact_name: 'A', line_1: '1 Main St', city: 'X', state, postal_code: '00000', country_alpha2: 'US' });

describe('parseOptions', () => {
  it('keeps only ticked, known options', () => {
    expect(parseOptions({ signature: true, hazmat: 'on', media_mail: false, junk: true })).toEqual({ signature: true, hazmat: true });
    expect(parseOptions(undefined)).toEqual({});
  });
});

describe('applyOptions', () => {
  const ids = (o: any) => applyOptions(RATES, o).map((r) => r.id);
  it('hides Media Mail unless it is ticked', () => {
    expect(ids({})).toEqual(['usps:USPS_GROUND_ADVANTAGE', 'usps:PRIORITY_MAIL', 'ups:03']);
    expect(ids({ media_mail: true })).toContain('usps:MEDIA_MAIL');
  });
  it('offers only USPS Ground Advantage for hazardous materials, even with Media Mail ticked', () => {
    expect(ids({ hazmat: true })).toEqual(['usps:USPS_GROUND_ADVANTAGE']);
    expect(ids({ hazmat: true, media_mail: true })).toEqual(['usps:USPS_GROUND_ADVANTAGE']);
  });
});

describe('optionsKey', () => {
  it('differs when options differ, and is empty with none', () => {
    expect(optionsKey({})).toBe('');
    expect(optionsKey({ hazmat: true })).not.toBe(optionsKey({ signature: true }));
  });
});

describe('hazmatAllowed', () => {
  it('allows the lower 48 and DC', () => {
    expect(hazmatAllowed(at('LA'), at('TX'))).toBe(true);
    expect(hazmatAllowed(at('LA'), at('DC'))).toBe(true);
  });
  it('refuses Alaska, Hawaii, territories and military addresses at either end', () => {
    for (const st of ['AK', 'HI', 'PR', 'GU', 'AE']) expect(hazmatAllowed(at('LA'), at(st))).toBe(false);
    expect(hazmatAllowed(at('ak'), at('LA'))).toBe(false);
  });
});
