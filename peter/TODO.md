# Peter's to-do list

Ideas and projects Peter wants to do later. Each one has what it is, why it's waiting, and the steps when it's time. Finished items move to [EDIT-LOG.md](EDIT-LOG.md).

| # | Item | Status | Waiting on |
|---|---|---|---|
| P1 | [International shipping online](#p1-international-shipping-online) | ⏸ Later | The US-only site going live, then a talk with William and Rin |
| P2 | [Return labels on the Ship page](#p2-return-labels-on-the-ship-page) | ✅ Done Nov 14 | Pay-only-if-used is D9 in FOR-WILLIAM.md |
| P3 | [Insurance terms: do's and don'ts, limits, what can't be insured](#p3-insurance-terms-dos-and-donts-limits-what-cant-be-insured) | ⏸ Later | Research each carrier's rules first |
| P4 | [Find a texting (SMS) platform for messages and marketing](#p4-find-a-texting-sms-platform-for-messages-and-marketing) | ⏳ Next to research | Pick the platform, then register the store's texting |
| P5 | ["Sign in with Google"](#p5-sign-in-with-google) | ⏸ Later | The site's real web address, a privacy policy page, and Peter's Google setup |
| P6 | [A fresher website theme](#p6-a-fresher-website-theme) | ✅ Done Nov 14: Theme B | A larger logo file from franchise support would be sharper |
| P7 | [Print & Promo online: the e-commerce side, first](#p7-print--promo-online-the-e-commerce-side-first) | ⏳ In progress (step 1 ✅) | Step 2, the Print & Promo page |
| P8 | [Online shipping labels, later and on purpose](#p8-online-shipping-labels-later-and-on-purpose) | ⏸ On the sideline | P7 earning first; then the checks below |

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

---

## P4. Find a texting (SMS) platform for messages and marketing

**Added:** 2026-11-14 14:13 CST. **Status:** to research.

**What it is:** A service to send the store's texts: shipping updates (already built) and, with the customer's yes, deals and news. Customers now give their mobile number when they buy online, and can tick "Text me deals" (logged as proof in the `marketing_consents` table).

**What's already in place:**
- The site sends "Text me when it ships" messages through **Twilio** (set up in `site/.dev.vars`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`), but no Twilio account is connected yet, so texts are only logged.
- Email goes through **Resend**, also not connected yet.
- Marketing consent is collected and logged with the exact wording, time and source. Nothing sends marketing yet.

### Questions to answer

- [ ] **One platform or two?** Twilio can send both shipping updates and marketing, but marketing campaigns are easier on a platform built for them (lists, scheduling, opt-out handling, reports). Compare a sending service (Twilio, Telnyx, and similar) with marketing tools (SimpleTexting, EZ Texting, Textedly, and similar). Check prices on their own sites, since they change.
- [ ] Does it **import our consent list** (or connect to the site) and send **opt-outs back**, so a STOP reply also turns off "Text me deals" on the customer's account?
- [ ] **Number type:** a regular local number (needs "10DLC" registration), a toll-free number (needs toll-free verification), or a short code (costly, slow). The store's Monroe area code is a nice touch.
- [ ] Monthly cost at the store's volume, per-message cost, and registration fees.
- [ ] Whether the franchise (GP Brands) has a preferred or required platform.

### Rules any platform must follow (to check in detail before sending a single marketing text)

- [ ] **Register the business** with the carriers before texting (A2P 10DLC brand and campaign, or toll-free verification). Unregistered business texts get blocked.
- [ ] **Express written consent** for marketing texts (TCPA): an unticked box, the store named, frequency, "message and data rates may apply", STOP and HELP, not a condition of buying. The site's box already says all of that; the wording is in `site/src/lib/consent.ts`.
- [ ] **STOP, HELP and the other opt-out words** answered automatically, and honored right away.
- [ ] **Quiet hours:** no marketing texts at night (federal rule is 8 a.m. to 9 p.m. in the customer's time zone; some states are stricter).
- [ ] **Louisiana's own rules** on telephone solicitation, and any state where many customers live.
- [ ] **What may not be texted** (carriers block some content).
- [ ] Keep the consent records for as long as the law requires (the site keeps them indefinitely).
- [ ] "Up to 4 messages a month" is in the consent wording: keep to it, or change the wording before sending more.

### Then

1. Pick the platform and open the account.
2. Register the store's texting (10DLC or toll-free).
3. Connect it: shipping texts through the site; marketing lists from customers who said yes (`marketing_consents`, newest choice per customer).
4. Write the first message and a calendar (ties in with the year-round shipping calendar, agenda item 19).

---

## P5. "Sign in with Google"

**Added:** 2026-11-14 14:54 CST. **Status:** later.

**What it is:** A "Sign in with Google" button next to the email and password sign-in. One tap creates or opens the account, with an email Google has already confirmed, so there's no confirmation email and no password. It eases sign-up, especially on phones. "Sign in with Apple" can follow the same way.

**Is it hard?** The code is about a day, and it can be built ahead and stay hidden until the keys are added. Most of the work is setup that only Peter (or William) can do, because it's done in the store's own Google account.

### What Peter has to do (about an hour, once)

- [ ] **The site's real web address** has to exist first: Google only sends people back to a registered address.
- [ ] **A privacy policy page** on the site (Google requires one; texting registration in P4 needs one too). Claude can draft it; it should be checked by whoever handles the store's legal questions.
- [ ] In **Google Cloud Console** (console.cloud.google.com), with the store's Google account: create a project, then **OAuth consent screen**: app name (Goin' Postal Forsythe), support email, logo, the site's address, the privacy policy link; ask only for the basic scopes (email, name).
- [ ] **Credentials → OAuth client ID** (type "Web application"), with the redirect address Claude gives (for example `https://<site>/api/auth/google`).
- [ ] Put the **Client ID** and **Client secret** into the site's secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Never paste the secret into a chat or a file in the repo.
- [ ] Publish the consent screen (basic email-and-name sign-in usually needs no Google review).

### What Claude builds

- [ ] The button on the Account page, the Ship page's sign-in prompt and the card review page.
- [ ] The sign-in flow with Google's security checks (state and nonce), matching the Google email to an existing customer, so counter customers keep their history.
- [ ] Tests, and a note in the edit log and meeting notes.

---

## P6. A fresher website theme

**Added:** 2026-11-14 15:19 CST. **Status:** ✅ done 2026-11-14 15:28 CST: Peter picked **B. Friendly & warm** (see EDIT-LOG.md).

**What it is:** Replace the site's 2000s look (glossy blue and tan gradients, bevelled tabs, Trebuchet) with a modern, easier-on-the-eyes theme in the logo's own colors: navy **#29276E**, flag red **#CB3833** and white. The Goin' Postal logo goes at the top left.

**The three directions** (Claude made a preview file with each as a mini home page; it's kept off GitHub because it contains the franchise logo):
- **A. Clean & bright:** white header, airy, Inter font, one red button per screen. Modern and trustworthy, like UPS or FedEx.
- **B. Friendly & warm:** rounded Nunito font, warm off-white, pill buttons, round icons. Welcoming, local.
- **C. Bold & proud:** a navy hero under a red-white-navy stripe, tall Barlow Condensed headlines like the store's print ads.

**The logo:** the file the franchise supplies (341 × 71 px), used as is, never redrawn or recolored. If franchise support has a bigger PNG or an SVG, it would look sharper on phones and laptops. It sits on a white header in every direction because its navy lettering needs a light background.

### Steps

- [ ] Peter picks A, B, C or a mix.
- [ ] (Optional) Ask franchise support for a larger logo file, and whether they have website brand rules.
- [ ] Claude applies the theme site-wide in one change (the colors, fonts, corners and shadows are tokens in `site/src/styles/global.css`), with the logo in the header.
- [ ] Tidy the header: language and text size into a small top bar or menu, so the tracking box is on the first screen on phones (D13 in FOR-WILLIAM.md).
- [ ] Check every page on phone and computer, in all 14 languages, in High contrast mode and at the larger text sizes. Keep the staff counter pages readable.

---

## P7. Print & Promo online: the e-commerce side, first

**Added:** 2026-11-14 18:59 CST. **Status:** next. **Peter's decision:** start with the e-commerce side (business cards, t-shirts, banners, business pens, mailboxes), make money with it, and only later take the smaller, safer step of online shipping labels (P8).

**Why this first:** higher margins than a label; nobody price-shops a custom banner against Pirate Ship; it doesn't compete with the counter; every order is picked up in the store, which is a chance to sell more.

| Product | What exists | How it's ordered online |
|---|---|---|
| **Business cards** | ✅ Built: designer, review page, Stripe, pickup | Order and pay now |
| **Banners and yard signs** | The card designer can draw any size | Design online or upload a file, see the price, pay, pick up |
| **T-shirts** | Plan with local partner printers in `monetization/screen-printing/` (Atomic Ink, West Monroe, about 4 miles) | **Request a quote**: upload the design, colors, sizes and quantity; staff price it; the customer pays by a link |
| **Business pens and promo items** | Nothing yet | **Request a quote**: pick the item, upload a logo, quantity; ordered from a promotional-products supplier and resold at a markup |
| **Mailboxes** | The agenda mentions an online sign-up (v1.47.0), not on the site now: ask William | **Reserve online, finish at the counter** (the USPS form and two IDs have to be done in person) |

### Build order

- [x] **1. Online labels off with a switch, before the site goes live** (see P8): the Ship page becomes "Get a quote, then pay at the counter", or leaves the menu. Nothing is deleted. ✅ 2026-11-14 19:15 CST: staff **Settings** page, owner PIN only, audited, starts Off. Off = reserve online, pay at the counter.
- [ ] **2. A "Print & Promo" section** in the menu: one page with every product, photos of real work, and a button each.
- [ ] **3. Request a quote:** the customer's form (product, file upload, details, quantity), a staff page to price it and send a payment link, the order on the customer's account. One build covers t-shirts, pens and any future custom product.
- [ ] **4. Banners and yard signs** in the designer, priced by size.
- [ ] **5. Mailbox reservation** online, finished at the counter.

### To find out

- [ ] Does the store print banners in-house (wide-format printer), or send them out? Sizes and prices.
- [ ] Which promotional-products supplier for pens and promo items, and what markup.
- [ ] Which t-shirt partner, their minimums, turnaround and prices (see the screen-printing plan).
- [ ] Does the franchise have preferred print or promo vendors, or rules about them?
- [ ] Photos of real work for the product pages.

---

## P8. Online shipping labels, later and on purpose

**Added:** 2026-11-14 18:59 CST. **Status:** on the sideline. Everything is built and stays in the code; it's just not offered until the owners decide.

**Peter's thinking:** online labels could pull local, price-sensitive customers (resellers, small businesses) away from the counter. But they also reach customers **nationwide** who would never walk in, which is new money. Start with Print & Promo (P7), then take this on as a safer, smaller risk.

### When it's time, do these first

- [ ] **Keep counter prices online**, and show local (Monroe-area) customers "No online fee at the counter, and we'll pack it": the 3.5% online fee already favors the counter.
- [ ] **Remove the "at or under Pirate Ship" line** on the rates, so the site doesn't invite price comparison.
- [ ] **Lead nationwide with business accounts** and the Shopify, eBay, Etsy and Square connectors (monthly billing, account discounts), not one-off retail labels. One-off price shoppers will compare against Pirate Ship's discounted rates.
- [ ] **Fraud protection:** Stripe's fraud screening on, spending limits for brand-new accounts (labels are a favorite target for stolen cards).
- [ ] **Weight-adjustment terms:** carriers bill the store's account when a package weighs more than declared; the terms must let the store charge the customer.
- [ ] **The franchise agreement:** does it allow selling labels online to customers outside the store's area?
- [ ] **Know the numbers:** the share of counter income from labels versus packing, boxes, printing and mailboxes, and how many customers walk in with prepaid labels.
