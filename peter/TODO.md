# Peter's to-do list

Ideas and projects Peter wants to do later. Each one has what it is, why it's waiting, and the steps when it's time. Finished items move to [EDIT-LOG.md](EDIT-LOG.md).

| # | Item | Status | Waiting on |
|---|---|---|---|
| P1 | [International shipping online](#p1-international-shipping-online) | ⏸ Later | The US-only site going live, then a talk with William and Rin |
| P2 | [Return labels on the Ship page](#p2-return-labels-on-the-ship-page) | ✅ Done Nov 14 | Pay-only-if-used is D9 in FOR-WILLIAM.md |
| P3 | [Insurance terms: do's and don'ts, limits, what can't be insured](#p3-insurance-terms-dos-and-donts-limits-what-cant-be-insured) | ⏸ Later | Research each carrier's rules first |

---

## P1. International shipping online

**Added:** November 14, 2026. **Status:** later, not started.

**What it is:** Let customers buy international labels on the website, the way Pirate Ship does. Today the website is US-only (William took international out on November 7, 2026, v1.92.0, for risk). International still works at the counter, where staff can see the item.

**Why it's waiting:**
1. The US-only site isn't live yet (carrier and payment keys are still pending).
2. The business paperwork takes longer than the code, so it comes first.
3. William removed it on purpose, so it's a joint decision with William and Rin.

### How Pirate Ship does it (the model to copy)

- The **customer fills in the customs form** online: each item, quantity, value, country it was made in.
- The **customer certifies it's true**, and the terms of service make the sender responsible for what's in the box.
- The customs data goes to the carrier **electronically** with the label.
- Banned countries and banned people are **screened out**; shipments needing extra government filings are refused.
- Pirate Ship **never handles the box**.

### Where the store has more risk than Pirate Ship

- Labels are bought on the **store's own carrier account**, so a bad package can get the store's account fined or suspended.
- Customers may bring the box to the **counter**, where staff accept it.

### Steps: business first

- [ ] Talk it over with William and Rin: why it was removed, and whether the plan below answers it.
- [ ] Terms of service that make the sender responsible for the contents and the customs form (lawyer writes or reviews).
- [ ] Confirm with USPS (and later UPS, FedEx) and with GP Brands that the store's accounts may sell international labels online.
- [ ] A counter rule: staff ask what's inside and may refuse a box.

### Steps: the build (a few days of work once the business steps are done)

- [ ] Customs form in checkout: items, quantity, value, weight, country of origin, contents type (gift, merchandise, documents, return), and a "this is true" checkbox.
- [ ] Start with **USPS only**, to a short list of countries.
- [ ] Block sanctioned countries, and check sender and receiver names against the US government's Consolidated Screening List.
- [ ] Online orders capped at **$2,500**; anything above goes to the counter (it needs an extra government export filing).
- [ ] A clear warning that the receiver may owe duties and taxes on delivery.
- [ ] Bring back what's useful from the old international code in the project history (before v1.92.0).

### Questions for William and Rin

1. What risk made you remove it, and does the sender-certifies model above cover it?
2. Which countries would customers actually ship to? (Start with those.)
3. Is the counter enough for now, or is online international worth the setup?

---

## P2. Return labels on the Ship page

**Added:** November 14, 2026. **Status:** ✅ done November 14, 2026, 12:37 CST (see EDIT-LOG.md). Answers used: charged up front for now; the same service back where offered, else the cheapest; both labels on the done page and in the receipt, for the customer to pass on.

**What it is:** A "Return label" checkbox on the Ship page, like Pirate Ship's, so a seller can buy the outgoing label and a prepaid label back to themselves in one checkout.

**Why it waited:** It's the biggest of the extra services (a second label, its own price, how and when it's charged), so it gets its own edit right after the other checkboxes.

**Already in the project to build on:** the counter can make return labels today (the "This is a return" box on /counter/queue), there's a returns drop-off page, and the add-on list has "Print a return label from a phone or email" and "Box for a return".

**Questions to settle when building it:**
1. Charge the return label up front, or only if it's used? (Up front is simpler; only-if-used depends on the carrier.)
2. Same service as the outgoing label, or the cheapest?
3. Email it to the sender, or to the receiver to keep in the box?

---

## P3. Insurance terms: do's and don'ts, limits, what can't be insured

**Added:** 2026-11-14 13:08 CST. **Status:** later, not started. Nothing goes on the website until each carrier's rules have been read and checked.

**What it is:** A short, plain-English insurance disclaimer on the Ship page, next to the insurance box, with a "Read the insurance terms" link that opens a window (like the hazardous materials guide). It tells customers before they pay:
- **Do's:** pack it properly, keep the receipt or proof of value, keep the box and packing if it arrives damaged, report problems quickly.
- **Don'ts:** don't over-declare the value, don't ship items the carrier won't cover, don't throw away the damaged box before the claim is decided.
- **How much can be insured**, with which carrier and service.
- **What can't be insured** at all, and what's only covered up to a lower amount.
- **How a claim works** and how long the customer has to file.

**Why it's waiting:** each carrier (USPS, UPS, FedEx) has its own rules, limits and exclusions, and they change. They have to be read from each carrier's own published terms, not guessed. A wrong promise here could cost the store money on a denied claim.

**What the site does today, for reference:**
- Insurance is offered up to **$5,000** declared value; the first **$100** is the carrier's built-in cover at no charge (both set at /counter/rules, stored in `site/src/data/addons.json`).
- Since Nov 14, the insured amount is added to the label as the carrier's own insurance or declared value (see EDIT-LOG.md).
- "What's inside" and the value are asked only when insurance is ticked.

### Research checklist, per carrier (USPS, UPS, FedEx)

- [ ] The **maximum** that can be insured or declared, by service. Does it differ for envelopes, flat rate packaging, or Ground versus Express?
- [ ] What the carrier **covers for free** (built-in cover), by service.
- [ ] Items that are **never covered** (for example cash, and other things the carrier lists).
- [ ] Items covered only **up to a lower limit** (for example jewelry, art, collectibles, or other "unusual value" items, if the carrier has such a rule).
- [ ] **Packing rules** a claim depends on (what counts as "properly packed").
- [ ] **Proof** the carrier asks for in a claim: receipts, photos, the box.
- [ ] **Deadlines** to report damage or loss and to file a claim.
- [ ] Who files: the customer or the store (the store's account bought the label).
- [ ] Whether the store's **$5,000** maximum should be lower for some carriers or services.

### Then decide

1. The wording of the disclaimer and the do's and don'ts.
2. Whether the website should **block** insurance that a carrier won't honor (over a carrier's limit, or an excluded item), not just warn.
3. Whether the customer ticks **"I've read the insurance terms"** before paying.
4. How it fits with the open insurance questions in [FOR-WILLIAM.md](FOR-WILLIAM.md): D1 (the fee covers the carrier's cost?), D7 ("we handle your claim" as a selling point), D8 (which insurance the counter uses today).
5. A lawyer or the franchise reviews the final wording.
