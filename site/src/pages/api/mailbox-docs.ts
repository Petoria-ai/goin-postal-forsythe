export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '../../lib/env';
import { json } from '../../lib/validate';
import { authenticate, atLeast } from '../../lib/auth';
import { docOwner, listMailboxDocs, listAllMailboxes, logAudit, setDocExpiry, listDocDates, getMailboxDoc, latestPhotoIdExpiry } from '../../shipping/store';
import { saveDoc, openDoc, removeDoc, KINDS, docsReady, type DocKind } from '../../lib/mailboxDocs';
import { addMonths, day, endedOn, KEEP_MONTHS, isDay, idState } from '../../lib/mailbox';
import { addMailboxDoc } from '../../shipping/store';
import vcfg from '../../data/virtual.json';

// Mailbox holders' documents (Peter, Nov 16 2026): photo IDs and the PS Form 1583, by customer.
// Any staff PIN: list {customer_id}, add {customer_id, kind, name, data (data URL), note}.
// Any staff PIN: add_date {customer_id, expires_on, in_person?}: a photo ID's date with no file, for virtual customers whose
// ID is kept by their virtual mailbox service (Peter, Nov 19 2026: "i gotta reupload their documents"). Same reinstatement rule.
// Manager or owner PIN only: open {id} (returns the decrypted file; audited every time), delete {id}.
// The file is never served by URL: the page asks with the PIN and shows it from memory.

const b64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

export const POST: APIRoute = async ({ request }) => {
  const b: any = await request.json().catch(() => ({}));
  const user = await authenticate(env, b.pin);
  if (!user) return json({ error: 'Wrong PIN' }, 401);
  const canOpen = atLeast(user, 'manager');
  try {
    if (b.action === 'list') {
      const customer = await docOwner(env, String(b.customer_id ?? ''));
      if (!customer) return json({ error: 'No such customer' }, 404);
      const today = day(new Date());
      const boxes = (await listAllMailboxes(env)).filter((x) => x.customer_id === customer.id);
      // When none of their boxes is still paid: the day the last one ended, and when to delete the files (a year on).
      const ends = boxes.map((x) => endedOn(x, today));
      const lastEnded = boxes.length && ends.every(Boolean) ? (ends as string[]).sort().at(-1)! : null;
      return json({
        customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
        docs: await (async () => { const dates = new Map((await listDocDates(env)).map((d) => [d.doc_id, d.expires_on])); return (await listMailboxDocs(env, customer.id)).map((d) => ({ ...d, expires_on: dates.get(d.id) ?? null })); })(),
        can_open: canOpen, ready: docsReady(env), kinds: KINDS,
        boxes: [...boxes.map((x) => x.box_no), ...customer.virtual.map((v) => `V${v.vno}`)],
        last_ended: lastEnded, delete_after: lastEnded ? addMonths(lastEnded, KEEP_MONTHS) : null,
        id_state: idState((await latestPhotoIdExpiry(env)).get(customer.id), today),
      });
    }
    if (b.action === 'add_date') {
      const customer = await docOwner(env, String(b.customer_id ?? ''));
      if (!customer) return json({ error: 'No such customer' }, 404);
      if (!isDay(b.expires_on)) return json({ error: 'Pick the expiration date from the calendar.' }, 400);
      const today = day(new Date());
      const before = idState((await latestPhotoIdExpiry(env)).get(customer.id), today);
      const reinstating = !!before && (before.state === 'hold' || before.state === 'suspended');
      if (reinstating && b.in_person !== true) return json({ error: 'Their ID is expired: check the new one in person (the customer is here), tick the box, then save.', code: 'in_person' }, 400);
      if (reinstating && b.expires_on <= today) return json({ error: 'Enter the new ID\'s expiration date (it must be in the future) to reinstate them.' }, 400);
      const v = customer.virtual.find((x) => x.status === 'active') ?? customer.virtual[0];
      const where = (vcfg.providers as { id: string; name: string }[]).find((p) => p.id === v?.provider)?.name ?? 'the virtual mailbox service';
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) => x.toString(16).padStart(2, '0')).join('');
      const row = await addMailboxDoc(env, { id, customer_id: customer.id, kind: 'photo_id', name: `On file at ${where}`, content_type: 'none', bytes: 0, note: b.in_person === true ? 'checked in person' : null, by_name: user.name });
      await setDocExpiry(env, row.id, b.expires_on);
      if (reinstating) await logAudit(env, user, 'mailbox.id_reinstated', customer.id, `${customer.name}: new photo ID checked in person, expires ${b.expires_on}`);
      await logAudit(env, user, 'mailbox.doc_add', customer.id, `${customer.name} · photo_id date only (on file at ${where}) · expires ${b.expires_on}${b.in_person === true ? ' · checked in person' : ''}`);
      return json({ ok: true, doc: row, reinstated: reinstating });
    }
    if (b.action === 'add') {
      const customer = await docOwner(env, String(b.customer_id ?? ''));
      if (!customer) return json({ error: 'No such customer' }, 404);
      const kind = String(b.kind ?? '') as DocKind;
      if (!(KINDS as readonly string[]).includes(kind)) return json({ error: 'Pick what kind of document it is.' }, 400);
      if (b.expires_on && !isDay(b.expires_on)) return json({ error: 'Pick the expiration date from the calendar.' }, 400);
      // Someone on ID hold or suspended is reinstated only by a current photo ID that staff checked in person.
      const before = idState((await latestPhotoIdExpiry(env)).get(customer.id), day(new Date()));
      const reinstating = kind === 'photo_id' && !!before && (before.state === 'hold' || before.state === 'suspended');
      if (reinstating && b.in_person !== true) return json({ error: 'Their ID is expired: check the new one in person (the customer is here), tick the box, then upload.', code: 'in_person' }, 400);
      if (reinstating && (!isDay(b.expires_on) || b.expires_on <= day(new Date()))) return json({ error: 'Enter the new ID\'s expiration date (it must be in the future) to reinstate them.' }, 400);
      const row = await saveDoc(env, { customer_id: customer.id, kind, name: String(b.name ?? ''), dataUrl: String(b.data ?? ''), note: String(b.note ?? '').trim(), by_name: user.name });
      if (b.expires_on) await setDocExpiry(env, row.id, b.expires_on);
      if (reinstating) await logAudit(env, user, 'mailbox.id_reinstated', customer.id, `${customer.name}: new photo ID checked in person, expires ${b.expires_on}`);
      await logAudit(env, user, 'mailbox.doc_add', customer.id, `${customer.name} · ${kind} · ${row.name} · ${row.bytes} bytes${b.expires_on ? ` · expires ${b.expires_on}` : ''}${b.in_person === true ? ' · checked in person' : ''}`);
      return json({ ok: true, doc: row, reinstated: reinstating });
    }
    if (b.action === 'set_expiry') { // any staff: type or fix the date printed on the ID
      const doc = await getMailboxDoc(env, String(b.id ?? ''));
      if (!doc) return json({ error: 'No such document' }, 404);
      if (b.expires_on && !isDay(b.expires_on)) return json({ error: 'Pick the expiration date from the calendar.' }, 400);
      await setDocExpiry(env, doc.id, b.expires_on || null);
      await logAudit(env, user, 'mailbox.doc_expiry', doc.customer_id, `${doc.kind} · ${doc.name} · ${b.expires_on || 'no date'}`);
      return json({ ok: true });
    }
    if (b.action === 'open' || b.action === 'delete') {
      if (!canOpen) return json({ error: 'Only a manager or owner can open or delete documents.' }, 403);
      if (b.action === 'delete') {
        const row = await removeDoc(env, String(b.id ?? ''));
        if (!row) return json({ error: 'No such document' }, 404);
        await setDocExpiry(env, row.id, null);
        await logAudit(env, user, 'mailbox.doc_delete', row.customer_id, `${row.kind} · ${row.name}`);
        return json({ ok: true });
      }
      const f = await openDoc(env, String(b.id ?? ''));
      if (!f) return json({ error: 'No such document' }, 404);
      await logAudit(env, user, 'mailbox.doc_open', f.row.customer_id, `${f.row.kind} · ${f.row.name}`);
      return json({ ok: true, name: f.row.name, content_type: f.row.content_type, data: b64(f.bytes) });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? 'Try again' }, /must be|too big|not set up/.test(e?.message ?? '') ? 400 : 500);
  }
};
