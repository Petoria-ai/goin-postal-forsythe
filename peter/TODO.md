# Peter's to-do list

Ideas and projects Peter wants to do later. Each one has what it is, why it's waiting, and the steps when it's time. Finished items move to [EDIT-LOG.md](EDIT-LOG.md).

| # | Item | Status | Waiting on |
|---|---|---|---|
| P1 | [International shipping online](#p1-international-shipping-online) | ⏸ Later | The US-only site going live, then a talk with William and Rin |
| P2 | [Return labels on the Ship page](#p2-return-labels-on-the-ship-page) | ⏳ Next | Nothing: next edit |

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

**Added:** November 14, 2026. **Status:** next.

**What it is:** A "Return label" checkbox on the Ship page, like Pirate Ship's, so a seller can buy the outgoing label and a prepaid label back to themselves in one checkout.

**Why it waited:** It's the biggest of the extra services (a second label, its own price, how and when it's charged), so it gets its own edit right after the other checkboxes.

**Already in the project to build on:** the counter can make return labels today (the "This is a return" box on /counter/queue), there's a returns drop-off page, and the add-on list has "Print a return label from a phone or email" and "Box for a return".

**Questions to settle when building it:**
1. Charge the return label up front, or only if it's used? (Up front is simpler; only-if-used depends on the carrier.)
2. Same service as the outgoing label, or the cheapest?
3. Email it to the sender, or to the receiver to keep in the box?
