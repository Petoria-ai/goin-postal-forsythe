// Business hours, worked out from the one weekly table in src/data/store.ts. Pure functions, no
// bindings, so the footer, the contact page, the open-now badge, the JSON-LD and llms.txt all read
// the same numbers and a change to the table reaches every one of them.
//
// Times are 24-hour "HH:MM" strings in the store's own time zone (America/Chicago). A day with no
// entry is closed. Special hours (holidays, a closure for weather) replace the weekly row for one date.

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type Weekday = typeof WEEKDAYS[number];

export interface DayHours { day: Weekday; opens: string; closes: string }
/** One date that differs from the weekly table. `closed: true`, or its own opens/closes. `label` is shown to customers ("Christmas Day"). */
export interface SpecialHours { date: string; closed?: boolean; opens?: string; closes?: string; label?: string }

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const validTime = (t: string) => HHMM.test(t);
export const validDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'));
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/** "18:30" -> "6:30 PM"; "09:00" -> "9:00 AM". `style: 'lower'` gives "6:30 pm" for running text. */
export function fmt12(t: string, style: 'upper' | 'lower' = 'upper'): string {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const s = `${h12}:${m} ${suffix}`;
  return style === 'lower' ? s.toLowerCase() : s;
}

export function hoursFor(weekly: DayHours[], day: Weekday): DayHours | undefined {
  return weekly.find((d) => d.day === day);
}

/** Consecutive days with the same hours, folded: Monday to Friday, Saturday, Sunday. */
export interface HoursGroup { from: Weekday; to: Weekday; label: string; opens?: string; closes?: string; text: string; key?: string }
const GROUP_KEYS: Record<string, string> = { 'Monday-Friday': 'days.monfri', 'Saturday-Saturday': 'days.sat', 'Sunday-Sunday': 'days.sun' };
export function groupHours(weekly: DayHours[]): HoursGroup[] {
  const out: HoursGroup[] = [];
  for (const day of WEEKDAYS) {
    const h = hoursFor(weekly, day);
    const sig = h ? `${h.opens}-${h.closes}` : 'closed';
    const last = out[out.length - 1];
    const lastSig = last ? (last.opens ? `${last.opens}-${last.closes}` : 'closed') : null;
    if (last && lastSig === sig) { last.to = day; continue; }
    out.push({ from: day, to: day, label: day, opens: h?.opens, closes: h?.closes, text: h ? `${fmt12(h.opens)} – ${fmt12(h.closes)}` : 'Closed' });
  }
  for (const g of out) {
    g.label = g.from === g.to ? g.from : `${g.from} to ${g.to}`;
    g.key = GROUP_KEYS[`${g.from}-${g.to}`];
  }
  return out;
}

/** The older display rows the site already used ({ days, key, open }), so existing pages keep working. */
export function displayRows(weekly: DayHours[]): { days: string; key: string; open: string; openKey?: string }[] {
  return groupHours(weekly).map((g) => ({
    days: g.label,
    key: g.key ?? '',
    open: g.opens ? `${fmt12(g.opens, 'lower')} to ${fmt12(g.closes!, 'lower')}` : 'Closed',
    ...(g.opens ? {} : { openKey: 'hours.closed' }),
  }));
}

/** Days open per week, and whether the store is open both weekend days: the selling points the copy uses. */
export function daysOpen(weekly: DayHours[]): number { return WEEKDAYS.filter((d) => hoursFor(weekly, d)).length; }
export function latestWeekdayClose(weekly: DayHours[]): string | undefined {
  const closes = (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Weekday[]).map((d) => hoursFor(weekly, d)?.closes).filter(Boolean) as string[];
  return closes.sort().pop();
}

/** The date, weekday and minute of the day in a time zone, without any date library. */
export function zoned(date: Date, timeZone: string): { ymd: string; day: Weekday; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { ymd: `${get('year')}-${get('month')}-${get('day')}`, day: get('weekday') as Weekday, minute: Number(get('hour')) * 60 + Number(get('minute')) };
}

const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const weekdayOf = (ymd: string): Weekday => WEEKDAYS[(new Date(ymd + 'T12:00:00Z').getUTCDay() + 6) % 7];

/** The hours that apply on one calendar date: the special row if there is one, else the weekly row. */
export function hoursOn(ymd: string, weekly: DayHours[], special: SpecialHours[] = []): { opens: string; closes: string; label?: string } | { closed: true; label?: string } {
  const sp = special.find((s) => s.date === ymd);
  if (sp) {
    if (sp.closed || !sp.opens || !sp.closes) return { closed: true, label: sp.label };
    return { opens: sp.opens, closes: sp.closes, label: sp.label };
  }
  const h = hoursFor(weekly, weekdayOf(ymd));
  return h ? { opens: h.opens, closes: h.closes } : { closed: true };
}

export interface OpenStatus { open: boolean; text: string; closesAt?: string; opensAt?: string; opensDay?: string; special?: string }
/** "Open now until 6:30 PM" or "Closed, opens Sunday at 10:00 AM", for any moment. */
export function statusAt(date: Date, weekly: DayHours[], special: SpecialHours[], timeZone: string): OpenStatus {
  const z = zoned(date, timeZone);
  const today = hoursOn(z.ymd, weekly, special);
  if ('opens' in today && z.minute >= minutes(today.opens) && z.minute < minutes(today.closes)) {
    return { open: true, closesAt: today.closes, special: today.label, text: `Open now until ${fmt12(today.closes)}${today.label ? ` (${today.label})` : ''}` };
  }
  // Closed: find the next opening, today later or one of the next 14 days.
  for (let i = 0; i < 15; i++) {
    const ymd = addDays(z.ymd, i);
    const h = hoursOn(ymd, weekly, special);
    if (!('opens' in h)) continue;
    if (i === 0 && z.minute >= minutes(h.opens)) continue;
    const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : weekdayOf(ymd);
    const todaySpecial = special.find((s) => s.date === z.ymd);
    return { open: false, opensAt: h.opens, opensDay: when, special: todaySpecial?.label, text: `Closed${todaySpecial?.label ? ` for ${todaySpecial.label}` : ''} · opens ${when} at ${fmt12(h.opens)}` };
  }
  return { open: false, text: 'Closed' };
}

/** schema.org OpeningHoursSpecification for the weekly table (days with the same hours share one entry). */
export function openingHoursSpecification(weekly: DayHours[]) {
  const byHours = new Map<string, Weekday[]>();
  for (const d of WEEKDAYS) {
    const h = hoursFor(weekly, d);
    if (!h) continue;
    const k = `${h.opens}|${h.closes}`;
    byHours.set(k, [...(byHours.get(k) ?? []), d]);
  }
  return [...byHours.entries()].map(([k, days]) => {
    const [opens, closes] = k.split('|');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days.map((d) => `https://schema.org/${d}`), opens, closes };
  });
}

/** schema.org specialOpeningHoursSpecification for upcoming special dates. A closed day is opens = closes = 00:00, as Google documents. */
export function specialOpeningHoursSpecification(special: SpecialHours[], fromYmd?: string) {
  return special
    .filter((s) => validDate(s.date) && (!fromYmd || s.date >= fromYmd))
    .map((s) => ({
      '@type': 'OpeningHoursSpecification',
      validFrom: s.date,
      validThrough: s.date,
      opens: s.closed || !s.opens ? '00:00' : s.opens,
      closes: s.closed || !s.closes ? '00:00' : s.closes,
    }));
}

/** Check a weekly table and a special list; returns plain-English problems (empty when fine). */
export function checkHours(weekly: DayHours[], special: SpecialHours[] = []): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const h of weekly) {
    if (!WEEKDAYS.includes(h.day)) errs.push(`Unknown day "${h.day}"`);
    if (seen.has(h.day)) errs.push(`${h.day} is listed twice`);
    seen.add(h.day);
    if (!validTime(h.opens) || !validTime(h.closes)) errs.push(`${h.day}: times must be HH:MM, 24-hour`);
    else if (minutes(h.closes) <= minutes(h.opens)) errs.push(`${h.day}: closes before it opens`);
  }
  for (const s of special) {
    if (!validDate(s.date)) errs.push(`Special hours: "${s.date}" is not a YYYY-MM-DD date`);
    if (!s.closed) {
      if (!s.opens || !s.closes || !validTime(s.opens) || !validTime(s.closes)) errs.push(`Special hours ${s.date}: give opens and closes (HH:MM) or mark it closed`);
      else if (minutes(s.closes) <= minutes(s.opens)) errs.push(`Special hours ${s.date}: closes before it opens`);
    }
  }
  return errs;
}
