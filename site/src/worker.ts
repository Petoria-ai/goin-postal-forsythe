// The site's Cloudflare Worker entry (Peter, Nov 17 2026). Pages and APIs are Astro's own handler, unchanged;
// this adds a `scheduled` handler for the daily jobs in wrangler.jsonc "triggers.crons":
//   15:00 UTC (9 am Central in winter, 10 am in summer): mailbox renewal reminders (60, 30 and 7 days before,
//   and the day after a box lapses), each sent once. Staff can still press Send due reminders on
//   /counter/mailboxes; a reminder already sent is never sent twice.
import astro from '@astrojs/cloudflare/entrypoints/server';
import { sendDueReminders } from './lib/mailboxJobs';

export default {
  fetch: astro.fetch,
  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(sendDueReminders(env, { id: null, name: 'Daily reminders (automatic)' }).then(
      (sent) => console.log(`mailbox reminders: ${sent.length} sent`),
      (e) => console.error('mailbox reminders failed:', e),
    ));
  },
};
