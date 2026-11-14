# For the next meeting: Peter and William

Everything Peter's work turned up that William should know about: problems found in the project, what was done, and what still needs a decision. Newest topics are added at the bottom of each section. Each item links to the full entry in [EDIT-LOG.md](EDIT-LOG.md).

**Last updated:** November 14, 2026, 15:28 CST.

## How Peter is working

- Peter works on his own fork, [Petoria-ai/goin-postal-forsythe](https://github.com/Petoria-ai/goin-postal-forsythe), on a branch named `peter`. Nothing in William's repo has been touched.
- To see everything Peter changed: [compare main...peter on Peter's fork](https://github.com/Petoria-ai/goin-postal-forsythe/compare/main...peter). On November 14 it was 8 commits and 25 site files.
- When the two of you agree, Peter's branch can be sent to William's repo as a pull request for William to review and merge.
- Peter's notes live in `peter/`: [README](README.md), [EDIT-LOG](EDIT-LOG.md) (every edit, dated and timed), [TODO](TODO.md), and this file.

## 1. Problems found in the project

| # | Found | What was wrong | What was done | Status |
|---|---|---|---|---|
| H1 | Nov 14, setup on Peter's Windows PC | The root README's "Run the website" steps skip `npm run db:local`. Without it, Get rates fails with `D1_ERROR: no such table: retail_rules`. (`site/README.md` mentions it; the root README doesn't.) | Peter ran it by hand | ⏳ **William:** add it to the root README |
| H2 | Nov 14, setup on Peter's Windows PC | On Windows, `npm` is blocked until `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` is run once. The README doesn't say so. | Peter ran it by hand | ⏳ **William:** add it to the root README's Windows steps |
| H3 | Nov 14, [insurance fix](EDIT-LOG.md) | **The website charged the insurance fee but never bought insurance.** No declared value or insurance was sent to USPS, UPS or FedEx with the label, so only the carrier's free cover (usually $100) applied. A lost $450 package would have cost the store the difference. | Fixed on `peter`: `lib/labelExtras.ts` adds each carrier's insurance to the label; `lib/fulfil.ts` passes the insured amount. Applies to the website, counter queue and business accounts. | ✅ Fixed on `peter`. ⏳ Check on the first real insured label per carrier |
| H4 | Nov 14, [extra services](EDIT-LOG.md) | Bug in Peter's own new work, caught in testing: the page total left out the $3.50 signature fee while the order still charged it. | Fixed before upload | ✅ Fixed |
| H9 | Nov 14, [accounts to buy](EDIT-LOG.md) | **Online orders renamed the customer after the recipient.** `upsertQuote` names the customer from `order.name`, and online orders had none, so it fell back to `destination.contact_name`; every online order overwrote the customer's name with whoever the package went to. | Fixed on `peter`: online orders carry the signed-in customer's name | ✅ Fixed |
| H8 | Nov 14, [accounts to buy](EDIT-LOG.md) | `customers.consent_email` is set to 1 for every customer with an email, and `consent_sms` when they tick shipping texts. They mean receipts and tracking messages, **not marketing**; a marketing list built from them would include people who never agreed. | Not changed. Marketing consent is a separate log, `marketing_consents` | ⚠️ Don't use those flags for marketing |
| H7 | Nov 14, [tracking box](EDIT-LOG.md) | The tracking page showed an empty red error box all the time, even with no error. | Fixed on `peter`: `.err:empty` is hidden site-wide | ✅ Fixed |
| H6 | Nov 14, [packaging picker](EDIT-LOG.md) | The Ship page's size boxes only accepted whole inches, so a size like 12.5 in quietly blocked Get rates. | Fixed on `peter`: sizes accept decimals | ✅ Fixed |
| H5 | Nov 14, [address dropdown](EDIT-LOG.md) | The street typeahead (Census lookup) shows nothing until a city is typed too, so it looked broken. The return-address box had no typeahead at all. | Fixed on `peter`: typeahead on both boxes; a bare street is also tried in the store's city | ✅ Fixed. Full letter-by-letter suggestions still need the Google Places key (issue 18) |

## 2. Changes Peter made that touch William's code

All on the `peter` branch, all with tests passing and the site building. Details in [EDIT-LOG.md](EDIT-LOG.md).

| Change | Main files | Worth William's review because |
|---|---|---|
| Address dropdown on both street boxes | `pages/ship/index.astro`, `api/address-suggest.ts`, `lib/address.ts` | Changes the Census lookup to try the store's city |
| Item value and "What's inside" only asked when insurance is ticked; insurance box moved above Extra services | `pages/ship/index.astro`, new `lib/insurance.ts`, `lib/addons.ts` | The fee formula moved to its own file (re-exported from `addons.ts`, so other callers are unchanged) |
| Extra services: signature, Media Mail, irregular, hazardous materials, saved packages | new `lib/options.ts`, `shipping/engine.ts`, all carrier adapters, `api/orders.ts`, `lib/validate.ts`, `shipping/types.ts`, i18n files | `Parcel` gained `options`; the rate cache key includes them; `applyOptions` filters rates in `getQuotes` |
| Insurance bought from the carrier with the label | new `lib/labelExtras.ts`, `lib/fulfil.ts`, all carrier adapters, `lib/easyship.ts` | `Parcel` gained `insured_usd`, set only at label time |
| Packaging picker: own packaging or a carrier's (USPS flat rate, UPS Express, FedEx Express), with pictures | new `lib/packaging.ts`, `lib/validate.ts`, `shipping/engine.ts`, all carrier adapters, `lib/easyship.ts` (3 new demo rates), `public/packaging/` | `Parcel` gained `packaging`; carrier packaging overrides the typed size; `forPackaging` in `getQuotes` filters rates and explains when nothing fits |
| **Theme B** across the whole site: the glossy "Fireworks" look and the bevelled tabs replaced | `styles/global.css` (a Theme B section at the end overrides the older blocks; High contrast rules still win), `layouts/Base.astro` (logo, utility bar for language, text size and contrast; `#lang` and `.size` moved out of `nav`), `public/brand/goin-postal-logo.png`, new dependency `@fontsource-variable/nunito` | The two older look blocks (v1.70.0, v1.70.1) are now dead weight and could be deleted in a cleanup; `-webkit-box-reflect: none` gets dropped by the build, so a transparent reflection is used |
| **Passwords** for customer accounts (the email link stays as "forgot password") | new `lib/password.ts` (PBKDF2-SHA256, 100k rounds), `lib/session.ts` (`createSignupToken`, `consumeLoginTokenFull`, fail counters in KV), `api/account.ts` (`password_login`, `signup`, `set_password`), `pages/account/index.astro`, `shipping/store.ts` (`customer_logins`: `getLogin`, `setPasswordHash`, `markEmailVerified`; hashes blanked in the export), `db/schema.sql` | A sign-up link carries the pending hash and applies it only when opened, so a password can never be attached to an unproven email; opening any link records `email_verified_at` |
| Log in button in the header; **business cards: review page, account to order**, then Stripe Checkout | `layouts/Base.astro` (button, fetches `GET /api/account`), `api/account.ts` (new GET: signed-in first name only), `pages/cards/index.astro` (Review order; the order waits in localStorage `gp-card-order`), new `pages/cards/review.astro`, `api/cards.ts` (`action: preview` prices without saving; ordering returns 401 without a session; needs `proofed`) | The customer's name, email and phone come from the account; Stripe Checkout and the confirmation page are unchanged |
| Tracking menu; recently tracked; **buying online needs an account**; phone on first purchase; marketing consent | `layouts/Base.astro`, `pages/track/index.astro`, `api/track.ts`, `pages/ship/index.astro`, `api/orders.ts`, `pages/account/index.astro`, `api/account.ts`, `lib/session.ts` (`safeNext`), new `lib/consent.ts`, `shipping/store.ts`, `db/schema.sql` (2 new tables) | `/api/orders` now returns 401 without a session (counter, API and batch paths unchanged); new tables `customer_tracked` and `marketing_consents`, in `EXPORT_TABLES` with memory branches; the sign-in link carries `next` |
| Home page "Track a package" box; carrier links on /track for numbers the store didn't ship | `pages/index.astro`, `pages/track/index.astro`, new `lib/carrierTrack.ts`, `styles/global.css` | The box is a plain GET form to `/track?q=`; carrier detection is by number shape only, client side |
| Return labels: "only" (addresses swapped, `kind: 'return'`) and "included" (a second label) | `lib/options.ts`, `api/rates.ts`, `api/orders.ts`, `lib/orders.ts`, `lib/stripe.ts`, `lib/fulfil.ts`, done and counter pages | `Order` gained `return_rate` and `return_label`; `fulfil` buys the second label and records it as shipment `<code>-R`; a failed return purchase doesn't undo the paid outgoing label |

## 3. To check once the carrier accounts are connected

The site runs on demo rates, so these follow each carrier's published format but haven't been proven on a real label:

- [ ] **Insurance** on a real label from USPS, UPS, FedEx and Easyship: the carrier's receipt shows the insured amount.
- [ ] **Signature confirmation** reaches USPS, UPS and FedEx.
- [ ] **Hazardous materials** flag reaches USPS, and only Ground Advantage is offered.
- [ ] **USPS Media Mail** appears in USPS's live rates when ticked.
- [ ] **Irregular package** changes the USPS price.
- [ ] Easyship doesn't receive signature or hazmat yet (only insurance). Decide whether that matters while Easyship is the bridge.
- [ ] **Stripe keys connected and a test-card order run through** for both labels and business cards (demo mode skips Stripe's page).
- [ ] **Email (Resend) connected before going live.** Buying online now needs the sign-in email, so without email nobody can buy online.
- [ ] **Re-run the database setup** for the new tables (`customer_tracked`, `marketing_consents`, `customer_logins`): `npm run db:local` on each computer, `npm run db:remote` on the live site.
- [ ] **Packaging codes** on real accounts: USPS rate indicators (FS, FB, PL, FE, FA, FP, E4, E6, PA), UPS packaging codes (01, 2a, 2b, 2c, 03, 04), FedEx packaging types; flat rate prices come back as flat rate. The sizes in `lib/packaging.ts` are approximate.
- [ ] **Return labels** on a real account: the "included" return label is bought from the receiver's address back to the sender, and shows in the carrier's records.

## 4. Decisions waiting

| # | Question | Who | Notes |
|---|---|---|---|
| D1 | Does the $1.25 per $100 insurance fee (above $100, $2.75 minimum) cover what the carriers charge the store? | Rin | Change at /counter/rules |
| D2 | Does the $3.50 signature fee cover what the carriers charge? | Rin | Same place |
| D3 | International shipping online: William removed it Nov 7 for risk. Peter wants to revisit later, the Pirate Ship way (sender certifies the customs form, screening, $2,500 cap, USPS first). | Peter, William, Rin | Full plan: [TODO P1](TODO.md#p1-international-shipping-online) |
| D4 | Hazardous materials online only within the lower 48 and DC; Alaska, Hawaii, territories and military go to the counter. Is that the rule you want? | Peter, William | Conservative on purpose, to avoid USPS fines |
| D5 | ✅ **Decided Nov 14:** return labels are charged up front for now; the same service back where offered, else the cheapest; both labels go to the customer who bought them. | Peter | Built, see [TODO P2](TODO.md#p2-return-labels-on-the-ship-page). Pay-on-use is D9 |
| D6 | Google Places key for letter-by-letter address suggestions (costs money past a free allowance) | Peter, Rin | Already issue 18 in William's repo |
| D7 | **Idea:** "We handle your claim" as a selling point for insurance, on the site and at the counter. The site already has a claims tracker (/counter/claims). Free with insurance, or a fee? | Peter, William | Only promise what's delivered; check with Goin' Postal, which has its own insurance arrangement |
| D8 | Which insurance does the counter (Rate Pro) use today, carrier or a third-party insurer? Could the website use the same one? | William, Goin' Postal | Peter's understanding: the franchise has customers file claims with each carrier themselves |
| D10 | **Packaging pictures:** the general, USPS and UPS ones are cropped from Pirate Ship's site (Peter's call, for now). Replace them before going live: official carrier photos through the store's carrier or Goin' Postal accounts, or store-drawn ones like the FedEx set. | Peter, William | Files in `site/public/packaging/`; swapping is replacing files |
| D12 | **Insurance terms on the website:** a disclaimer with do's and don'ts, each carrier's limits, and what can't be insured. Needs each carrier's rules researched first. | Peter, William | [TODO P3](TODO.md#p3-insurance-terms-dos-and-donts-limits-what-cant-be-insured). Ties in with D1, D7, D8 |
| D13 | ✅ **Phone header, settled by Theme B:** the controls moved to a one-line top bar and the menu scrolls on one line, so the tracking box starts on the first screen of a phone. | Peter | Done Nov 14 |
| D14 | **Accounts to buy online:** Peter's call, for email and text marketing. Fewer quick one-off buyers may finish checkout; rates stay open to everyone so they see prices first. Revisit if online sales drop. | Peter, William | Counter walk-ups don't need an account |
| D15 | **Texting platform:** Twilio (already in the code for shipping texts) or a marketing platform, number type and registration, the consent wording's "up to 4 a month". | Peter, William, Rin | [TODO P4](TODO.md#p4-find-a-texting-sms-platform-for-messages-and-marketing) |
| D16 | The header now has both a **Log in** button and an **Account** tab. Keep both, or drop the Account tab? | Peter, William | Kept both for now |
| D17 | **"Sign in with Google"** (and maybe Apple): needs the real web address, a privacy policy page, and Peter's Google Cloud setup. | Peter | [TODO P5](TODO.md#p5-sign-in-with-google) |
| D18 | ✅ **Decided Nov 14: Theme B, Friendly & warm**, in the logo's navy (#29276E) and red (#CB3833), Nunito, the franchise logo top left, a slim utility bar for language and text size. | Peter | Built; a larger logo file from franchise support would be sharper |
| D11 | The packaging list says "Ask for one at our counter". Does the store keep USPS, UPS and FedEx packaging on hand to give out? | Peter | Change the wording if not |
| D9 | Return labels "charged only if used", like Pirate Ship? Needs the postal service's pay-on-use returns on the store's account, and a way to bill the customer later. Business accounts could be billed on their monthly statement; walk-in website customers would need a saved card. | Peter, William, Rin | For the prices meeting. Today: charged up front, and the page says so |

## 5. Not changed on purpose

- The staff counter's walk-up quote still has its own value box. Only the customer Ship page changed.
- Customs and international: left out (see D3).
- New text was added in all 14 languages. Like the rest of the site's translations, it was written by Claude and should be checked by native speakers (William's issue 10).
