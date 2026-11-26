import { describe, it, expect } from 'vitest';
import { PRINT_CATALOG, mmColumns } from '../src/data/printCatalog';
import { STRINGS } from '../src/i18n/strings';

describe('print catalog', () => {
  it('has unique section ids within each category', () => {
    for (const c of PRINT_CATALOG) expect(new Set(c.sections.map((s) => s.id)).size).toBe(c.sections.length);
  });
  it('has every category, section and heading name in the wording file', () => {
    for (const c of PRINT_CATALOG) {
      expect(STRINGS[c.key], c.key).toBeTruthy();
      for (const s of c.sections) {
        expect(STRINGS[s.key], s.key).toBeTruthy();
        if (s.group) expect(STRINGS[s.group.key], s.group.key).toBeTruthy();
      }
    }
  });
  it('splits the dropdown into a column per heading', () => {
    const home = PRINT_CATALOG.find((c) => c.id === 'home-living')!;
    expect(mmColumns(home.sections).map((c) => c.head?.label)).toEqual(['Kitchen and table', 'Home and decor']);
    const drink = PRINT_CATALOG.find((c) => c.id === 'drinkware')!;
    const cols = mmColumns(drink.sections);
    expect(cols.map((c) => c.items.length)).toEqual([5, 5]);
    expect(cols.map((c) => c.more)).toEqual([false, true]);
  });
});
