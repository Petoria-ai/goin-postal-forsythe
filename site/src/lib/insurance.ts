// The insurance fee formula, on its own so the ship page can show the fee as the customer types the
// declared value, and the server charges the same number. No imports: safe in the browser.
export interface InsuranceTerms { included_usd: number; per_100_usd: number; minimum_usd: number; max_declared_usd: number }

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Insurance fee for a declared value. Zero while the carrier's included cover is enough. */
export function insuranceFee(ins: InsuranceTerms, declared: number): { declared_usd: number; fee: number; covered: boolean } {
  const d = Math.min(Math.max(0, declared || 0), ins.max_declared_usd);
  if (d <= ins.included_usd) return { declared_usd: d, fee: 0, covered: true };
  const hundreds = Math.ceil((d - ins.included_usd) / 100);
  return { declared_usd: d, fee: round2(Math.max(ins.minimum_usd, hundreds * ins.per_100_usd)), covered: false };
}
