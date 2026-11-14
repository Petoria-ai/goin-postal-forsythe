# Peter's edit log

Every edit made for Peter, newest first. Times are Central (the store's time zone). Each entry matches one commit on the `peter` branch. The layout is set in [CLAUDE.md](CLAUDE.md).

---

## 2026-11-14 12:23 CST · Insurance is now bought from the carrier with the label

- **Asked for:** "Yes, let's make that fix." (Insurance should be added with each carrier when we buy the label.)
- **The problem found:** the website charged customers the insurance fee, but when it bought the label it never told USPS, UPS or FedEx about the declared value. The label only had the carrier's free built-in cover (usually $100). A lost $450 package would have left the store owing the difference. Nothing went wrong in practice: the site isn't live yet.
- **What changed:** when an insured order's label is bought, the carrier's own insurance is added to that label for the amount the customer insured:
  - **USPS:** USPS insurance (up to $500, or over $500) for the insured amount.
  - **UPS:** declared value for the insured amount.
  - **FedEx:** declared value for the insured amount.
  - **Easyship** (the stand-in until the carrier accounts are connected): its insurance option.
  - Orders without insurance send nothing extra, even if a value was typed.
  - This covers every way a label is bought: the website, the counter queue and business accounts all go through the same step.
- **Why:** So insurance the customer pays for is real, and a claim goes through the carrier on an insured label, the same way it works at the counter.
- **To check when carriers are connected:** the field names follow each carrier's published format, but the site still runs on demo rates. On the first real insured label from each carrier, check the carrier's receipt shows the insurance.
- **For Rin:** the carrier charges the store its own fee for this insurance. The store charges customers $1.25 per $100 above $100 ($2.75 minimum). Confirm that covers the carrier's cost; change it at /counter/rules.
- **Files:** [carrier label extras (new)](../site/src/lib/labelExtras.ts), [label step](../site/src/lib/fulfil.ts), [USPS](../site/src/shipping/providers/usps.ts), [UPS](../site/src/shipping/providers/ups.ts), [FedEx](../site/src/shipping/providers/fedex.ts), [Easyship](../site/src/lib/easyship.ts), [shipment types](../site/src/shipping/types.ts), [tests (new)](../site/tests/label-extras.test.ts), [tests (new)](../site/tests/fulfil-insurance.test.ts)
- **Checks run:** 132 automated tests pass (8 new: each carrier's insurance fields, insurance plus signature together, and the label step passing the amount only when insurance was bought), the type check is clean, the site builds.

## 2026-11-14 12:13 CST · Insurance offer moved above Extra services

- **Asked for:** "Let's add an insurance tick box above extra services because I want to try to sell them the service."
- **What changed:**
  - The **Insure it for the full value** checkbox moved from the payment section (after rates) up into "What is it?", **right above Extra services**, in a box with a dark border so it stands out.
  - Ticking it still opens **Value in USD** below it, and the fee now shows **as soon as the value is typed**, before Get rates ("+ $5.00 to cover $450"). At $100 or less it says the carrier covers it for free.
  - If insurance is ticked but no value is typed, Get rates asks for the value first.
  - The insurance fee is still added to the total after a rate is picked, and the order is charged the same amount. It no longer appears a second time in the payment section.
- **Why:** Every customer sees the insurance offer early, before they've picked a rate, which should sell more of it.
- **Files:** [ship page](../site/src/pages/ship/index.astro), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321/ship. The insurance box sits above "Extra services". Tick it, type 450: the fee shows at once. Get rates and pick one: the total includes the $5.00.
- **Checks run:** 124 tests pass, the site builds. In a real browser: the box is above Extra services, Get rates is blocked until a value is typed, the fee shows before rates, the total includes it, and the order was sent with the $450 value.

## 2026-11-14 11:35 CST · Extra services checkboxes on the Ship page, with a hazardous materials guide

- **Asked for:** "I want tickbox features to populate whatever the customer may want" (from the Pirate Ship screenshot), "let's disregard the international/customs box for now", and a pop-up guide like Pirate Ship's "Learn how to ship Hazardous Materials" link.
- **What changed** (all in the "What is it?" section, before Get rates, because they change which rates show):
  - **Extra services** (a fold-out section):
    - **Signature confirmation (+$3.50):** adds the store's signature add-on to the order and tells USPS, UPS or FedEx to require a signature on the label. The price comes from the add-on list at /counter/rules.
    - **Qualifies for Media Mail:** adds the cheap, slow USPS Media Mail rate to the list. Media Mail never shows unless this is ticked.
    - **Irregular package:** tells USPS it's not a standard box, so it's priced right.
  - **Hazardous materials:** only USPS Ground Advantage is offered, the label tells USPS it contains hazardous materials, and a reminder about the Limited Quantity mark shows. Online it is allowed only within the lower 48 states and DC; Alaska, Hawaii, territories and military addresses get a message to come to the counter.
  - **"Learn how to ship hazardous materials":** opens a guide window over the page (common items, packing, service and label, electronics, where it can go, a link to USPS Publication 52). "Got it, back to my shipment", Escape, or a click outside closes it. Written for the store in its own words from the USPS rules, not copied from Pirate Ship.
  - **Save this package for next time:** keeps the size, weight, contents and ticked boxes on that computer or phone (up to 5). Next visit, a "Saved packages" list fills them in with one pick; "Forget saved packages" clears it.
  - The **done page** repeats the Limited Quantity reminder, and the **staff counter page** shows a red warning to check the mark before accepting a hazardous package.
  - All new text is in all 14 of the site's languages.
- **Why:** Match what customers see on Pirate Ship, and keep hazardous packages legal: USPS fines the sender when hazardous items aren't declared on the label.
- **Bug caught while testing:** the page total first left out the $3.50 signature fee while the order still charged it. Fixed: the page now shows exactly what is charged.
- **Limits to know:**
  - The carrier-side settings (signature, hazmat, irregular, Media Mail) are written to each carrier's published format but can only be fully proven once the real carrier accounts are connected; today the site runs on demo rates.
  - While labels go through Easyship (the stand-in until the direct carrier accounts are live), signature and hazmat are not passed to Easyship yet.
  - Irregular package changes USPS pricing only.
  - Customs (international) is left out on purpose. Return labels are next, as P2 on the to-do list.
- **Files:** [ship page](../site/src/pages/ship/index.astro), [extra services rules (new)](../site/src/lib/options.ts), [tests (new)](../site/tests/options.test.ts), [rate engine](../site/src/shipping/engine.ts), [USPS](../site/src/shipping/providers/usps.ts), [UPS](../site/src/shipping/providers/ups.ts), [FedEx](../site/src/shipping/providers/fedex.ts), [orders](../site/src/pages/api/orders.ts), [done page](../site/src/pages/ship/done.astro), [counter page](../site/src/pages/counter/[code].astro), [parcel checks](../site/src/lib/validate.ts), [demo rates](../site/src/lib/easyship.ts), [shipment types](../site/src/shipping/types.ts), [text, 14 languages](../site/src/i18n/strings.ts), [staff text](../site/src/i18n/staff3.ts), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321/ship, fill in the form. Open **Extra services** and tick **Media Mail**, press Get rates: "USPS Media Mail" appears. Untick it, tick **Hazardous materials**, Get rates: only USPS Ground Advantage. Click **Learn how to ship hazardous materials** to see the guide. Tick **Signature confirmation**, pick a rate: the total goes up by $3.50 plus the online fee. Tick **Save this package**, get rates, then reload the page: "Saved packages" appears at the top of "What is it?".
- **Checks run:** 124 automated tests pass (6 new), the type check is clean, the site builds. Every checkbox was tried in a real browser, including buying an order with signature and hazmat and opening it on the counter page.

## 2026-11-14 11:03 CST · To-do list started, with international shipping as the first item

- **Asked for:** "Let's do that" (put international shipping on the to-do list instead of building it now).
- **What changed:** Added Peter's own to-do list. Its first item, P1, is international shipping online: how Pirate Ship does it, where the store's risk is higher, the business steps, the build steps, and questions for William and Rin.
- **Why:** The US-only site isn't live yet, the paperwork has to come before the code, and William removed international on November 7, so it's a decision for all three.
- **Files:** [TODO.md (new)](TODO.md), [README.md](README.md) (lists the new file)
- **How to check it:** On GitHub, open the `peter` folder on the `peter` branch and click TODO.md.

## 2026-11-14 10:58 CST · Item value only asked when insurance is ticked

- **Asked for:** "I don't like it has an item value. I don't see the point of having it unless the customer is adding insurance. So let's make it like Pirate Ship where if they click insurance it will pop up a fill in the blank for declared value in dollars."
- **What changed:**
  - The **Value in USD** box is gone from the "What is it?" section of the Ship page.
  - The **Insure it for the full value** checkbox now always shows under the rates. When the customer ticks it, a **Value in USD** box opens right below it.
  - As they type the value, the insurance fee and the total update on the spot: "+ $5.00 to cover $450". At $100 or less it says the carrier covers it at no charge.
  - Without insurance, no value is sent with the order at all.
- **Why:** Fewer boxes for customers who don't want insurance, and the value is asked at the moment it matters, the way Pirate Ship does it.
- **Behind the scenes:** The fee formula moved to its own small file, so the page and the server use the exact same math and the price shown is the price charged. The fee terms themselves (first $100 free, $1.25 per $100 after, $2.75 minimum, $5,000 maximum) are unchanged and still edited at /counter/rules.
- **Files:** [ship page](../site/src/pages/ship/index.astro), [insurance math (new)](../site/src/lib/insurance.ts), [add-ons](../site/src/lib/addons.ts)
- **How to check it:** `git pull`, open http://localhost:4321/ship, fill in the form and press Get rates. Pick a rate, tick **Insure it for the full value**, type 450: the fee shows $5.00 and the total goes up. Type 80: it says the carrier covers it. Untick it and the box goes away.
- **Checks run:** all 118 tests pass, the type check is clean, the site builds. Tried in a real browser: insured order sent with value $450 and the done page shows the insurance; uninsured order sent with no value.
- **Not changed:** the staff counter's own quote screen still has its value box.

## 2026-11-14 10:51 CST · Address dropdown on both street boxes of the Ship page

- **Asked for:** "In the fill in the blanks for customer information I want to start to have a dropdown menu ... once I type in an address I want the system to give them possible addresses ... so it can populate the rest of the blanks like city, state, zip code."
- **What changed:**
  - The **Return address** (sender) street box now shows a dropdown of matching addresses as you type, the same as the recipient box already did. Picking one fills in the street, city, state and ZIP.
  - Both boxes now give suggestions from **just the street** (for example "1800 Forsythe Ave"). Before, the free address lookup only answered once a city was typed too ("1800 Forsythe Ave, Monroe"). Now, when no city or ZIP is typed, it also looks in the store's own city (Monroe, LA).
  - Typing a city after a comma ("..., Dallas") or a ZIP still searches anywhere in the US.
- **Why:** Faster checkout and fewer typos in addresses, which means fewer returned or misdelivered packages.
- **Limits to know:** The free lookup (US Census Bureau) needs the full street name, so "1800 Forsy" shows nothing until "Forsythe Ave" is finished. True letter-by-letter suggestions, like Google Maps, need a Google Places key, which costs money past a free monthly allowance (already listed as issue 18 in William's repo). That is a decision for Peter and Rin.
- **Files:** [ship page](../site/src/pages/ship/index.astro), [address lookup](../site/src/pages/api/address-suggest.ts), [address helpers](../site/src/lib/address.ts), [new test](../site/tests/address-typeahead.test.ts)
- **How to check it:** `git pull`, then open http://localhost:4321/ship. In the Return address section, type a full street with no city, like your home street, and wait a second. A list appears; click one and the city, state and ZIP fill in. Try the same in "Where is it going?"
- **Checks run:** all 118 automated tests pass, the type check is clean, and the site builds. Both dropdowns were tried in a real browser.

## 2026-11-14 10:37 CST · Set up Peter's section

- **Asked for:** "a tabbed section for Pete's edits ... so our work wouldn't affect each other. I'd have my own section and my own readme section ... a date and time stamp per edit."
- **What changed:** Made Peter's own branch (`peter`) and folder (`peter/`), with a README explaining how it stays separate from William's work, this edit log, and a set of instructions so Claude logs every future edit here with the date and time.
- **Why:** So Peter can make and document his own changes, and William can review them, without either person's work changing the other's until both agree.
- **Files:** [README.md](README.md), [EDIT-LOG.md](EDIT-LOG.md), [CLAUDE.md](CLAUDE.md)
- **How to check it:** On GitHub, switch the branch picker to `peter` and open the `peter` folder.
- **Note for William:** While setting up the site on Peter's Windows PC, two steps were missing from the root README's "Run the website" guide. First, `npm run db:local` must be run once, or Get rates fails with `D1_ERROR: no such table: retail_rules`. Second, on Windows, `npm` is blocked until `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` is run once. Worth adding both to the README.
