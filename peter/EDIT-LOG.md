# Peter's edit log

Every edit made for Peter, newest first. Times are Central (the store's time zone). Each entry matches one commit on the `peter` branch. The layout is set in [CLAUDE.md](CLAUDE.md).

---

## 2026-11-14 14:41 CST · Log in button, and business cards: review page, secure payment, confirmation

- **Asked for:** "A login button on the far right top of the page, so it allows customers to immediately log in", so that once logged in they can use all the features, like business cards; and for business cards, "a second page like a secure payment section ... and a confirmation page for them to hit confirm order." Peter picked: a review page on our site, then Stripe's secure payment page; anyone can design, sign in to order.
- **What changed:**
  - **Log in button** at the top right of every page (gold, like the Ship a package tab). Signed out it says **Log in** and comes back to the same page after signing in. Signed in it says **Hi, Pat** (or **Account** until the customer has a name) and opens their account. Staff pages don't show it.
  - **Business cards, step by step:**
    1. **Design** as before. The name, email and phone boxes are gone from the designer (they come from the account). The button is now **Review order**.
    2. **Review your order** (new page): both sides of the card, the quantity and options, sales tax, the online fee and the total (priced by the server, so they match the charge), the pickup details from the account (name and phone asked here if the account doesn't have them yet), a required box "I checked the spelling, phone numbers and layout. The cards are printed exactly as shown.", and **Confirm and pay**. A line says payment is by Stripe and the store never sees the card number. Signed-out customers sign in right on this page; the design waits on their device while they open the email link.
    3. **Stripe's secure payment page** takes the card details.
    4. **The confirmation page** ("Paid. We are printing your cards.") with the pickup code and a QR to show at the counter.
  - **Ordering cards needs an account**, like buying labels. Designing is open to everyone.
  - All new text in all 14 languages.
- **Why the card form isn't on our own page:** card numbers that pass through the store's own site bring the full card-security rules (PCI) and the liability if they're ever stolen. Stripe's page keeps card numbers off the site entirely.
- **Files:** [header](../site/src/layouts/Base.astro), [account API](../site/src/pages/api/account.ts) (who is signed in), [card designer](../site/src/pages/cards/index.astro), [review page (new)](../site/src/pages/cards/review.astro), [card orders API](../site/src/pages/api/cards.ts), [text, 14 languages](../site/src/i18n/strings.ts), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev`. See **Log in** at the top right. Open **Business cards**, pick a layout, click the sample name on the card and type yours, then **Review order**. Sign in from the review page (open the link printed in the PowerShell window or the "dev: open it" link), tick the box and press **Confirm and pay**. In demo mode the Stripe step is skipped and you land on the confirmation page.
- **Checks run:** 160 tests pass, the type check is clean, the site builds. In a real browser: the button's text and link signed out and signed in; the designer's Review order; the review page's server prices ($39.99 + $4.39 tax + $1.40 fee = $45.78 for 250 cards); sign-in from the review page with the design kept; Confirm blocked until the box is ticked; the confirmation page; the review page empty after ordering; ordering cards without an account refused.

## 2026-11-14 14:26 CST · Tracking page search made bigger and centered, like the home page

- **Asked for:** "In the tracking tab, can you make the track a code box bigger and centered like the front page of the website."
- **What changed:** The top of the tracking page now looks like the home page's tracking box: a centered white card with "Track a package", the short instructions, a wide search box, and the gold **Track** button beside it. The search box hint reads "Pickup code or tracking number" (instead of the sample code GP-7K3M9Q). The "not found" message and the "Track on UPS" style buttons appear centered under it. On a phone, the button sits under the box.
- **Why:** The same look on both pages, and a bigger box that's easier to use.
- **Files:** [tracking page](../site/src/pages/track/index.astro), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321/track.
- **Checks run:** the site builds. In a real browser: the box is centered on the page; a UPS number still offers "Track on UPS"; nonsense still says not found; no sideways scrolling on a phone.

## 2026-11-14 14:23 CST · State boxes say "State" instead of "LA"

- **Asked for:** "Instead of LA, I want 'State'."
- **What changed:** Both **State** boxes on the Ship page (return address and "Where is it going?") now show a grey "State" hint instead of "LA". It follows the language picker, like the rest of the page. The box still takes the two-letter state code, and the address dropdown and ZIP lookup still fill it in.
- **Why:** "LA" looked like it was already filled in.
- **Files:** [ship page](../site/src/pages/ship/index.astro)
- **How to check it:** `git pull`, open http://localhost:4321/ship: both State boxes read "State" in grey.
- **Checks run:** the site builds.

## 2026-11-14 14:22 CST · Sample address removed from the street boxes

- **Asked for:** "Remove the address in the address box."
- **What changed:** Both **Street address** boxes on the Ship page (return address and "Where is it going?") no longer show the grey sample "1800 Forsythe Ave, Monroe". They start empty. The address dropdown still works the same.
- **Why:** The store's own address as a sample could confuse customers into thinking it was already filled in.
- **Files:** [ship page](../site/src/pages/ship/index.astro)
- **How to check it:** `git pull`, open http://localhost:4321/ship: both street boxes are blank.
- **Checks run:** the site builds.

## 2026-11-14 14:13 CST · Tracking menu, recently tracked, accounts to buy, marketing consent

- **Asked for:** change the tab "Track" to "Tracking" with a dropdown like UPS's ("Track a shipment", "View all shipments"); a "recently tracked / save your tracking here" box that asks people to log in or sign up; "they can only create shipments when they have an account, so I can start email and SMS marketing once I collect their phone number and email"; and "add to the to-do list: find an SMS platform".
- **What changed:**
  - **"Track" is now "Tracking"** in the header (14 languages), with a dropdown: **Track a shipment** (the tracking page) and **View all shipments** (the orders on the customer's account). It opens on hover, with the keyboard, or with the ▾ arrow on a phone.
  - **Recently tracked** on the tracking page:
    - Signed out: "Save your tracking here", with **Sign in** and **Create an account**.
    - Signed in: the last 10 things they tracked (the store's codes and other carriers' numbers), newest first, plus a link to all their shipments.
  - **Buying a label online needs a free account.** Anyone can still get rates. At the pay step, a signed-out customer sees "Sign in to buy your label", types their email and gets a sign-in link. The whole form is kept on their device; the link brings them back to the Ship page with everything filled in and the rates showing. Sign-in and sign-up are the same link (no password).
  - **First purchase asks for a mobile number** ("for problems with this shipment"). The account takes its name from the return address.
  - **Marketing consent, done the legal way:** two **unticked** boxes, "Email me Goin' Postal deals and news" and "Text me Goin' Postal deals and news ... Up to 4 messages a month ... Reply STOP to stop, HELP for help. Agreeing is not a condition of buying." Each yes is logged with the exact wording, the language, the email or phone, where, and when. Customers can change either choice anytime on the **Account** page; that's logged too.
  - The staff counter and business accounts are unchanged: walk-ups don't need an account.
  - **To-do P4:** find a texting platform, with the registration and consent rules.
- **Problems found and fixed:**
  - **Every online order renamed the customer after the person receiving the package** (for example "Sam" instead of "Pat"), because online orders didn't carry the customer's own name. Fixed: they do now. (H9 in FOR-WILLIAM.)
  - The customer record's existing "consent" flags are switched on automatically for anyone with an email; they mean "receipts and tracking", not marketing. Marketing consent is now kept separately so nobody lands on a marketing list without saying yes. (H8.)
- **Before going live:**
  - **Email must be connected (Resend).** Buying now needs the sign-in email; without it nobody can buy online.
  - The two new tables need the database setup re-run: `npm run db:local` on each computer, `npm run db:remote` on the live site.
- **Files:** [header and menu](../site/src/layouts/Base.astro), [tracking page](../site/src/pages/track/index.astro), [tracking lookup](../site/src/pages/api/track.ts), [ship page](../site/src/pages/ship/index.astro), [orders](../site/src/pages/api/orders.ts), [account page](../site/src/pages/account/index.astro), [account API](../site/src/pages/api/account.ts), [sign-in return path](../site/src/lib/session.ts), [consent wording (new)](../site/src/lib/consent.ts), [store](../site/src/shipping/store.ts), [database tables](../site/db/schema.sql), [tests (new)](../site/tests/accounts-tracked.test.ts), [text, 14 languages](../site/src/i18n/strings.ts), [styles](../site/src/styles/global.css), [TODO.md](TODO.md) (P4)
- **How to check it:** `git pull`, then `npm run db:local` once (new tables), then `npm run dev`.
  1. Hover **Tracking** in the header: the two choices appear.
  2. Open the tracking page signed out: "Save your tracking here".
  3. On the Ship page, get rates and pick one: "Sign in to buy your label". Type an email and press the button. The terminal window prints the sign-in email; open its link (or the "dev: open it" link on the page). You're back on the Ship page, filled in, with rates.
  4. Pick a rate, type a mobile number, tick a marketing box if you like, and pay.
  5. On the Account page, see the choices; on the tracking page, see Recently tracked.
- **Checks run:** 160 tests pass (8 new: recently tracked, consent, the sign-in return path), the type check is clean, the site builds, and the database setup runs twice cleanly. The whole journey above was run in a real browser, including the order API refusing a signed-out buyer.

## 2026-11-14 13:51 CST · Links under the tracking box centered

- **Asked for:** "Can you center the words 'Ship a package, Hours and directions, Contact'."
- **What changed:** The three links under the home page's tracking box now sit centered under the box on every screen width. They were drifting left on wide screens, because the site keeps every paragraph to a comfortable reading width and that row was a paragraph; that row is now allowed the box's full width.
- **Why:** So the links line up under the search box, like the title and the box above them.
- **Files:** [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321 on a wide window: the links sit centered under the Track box.
- **Checks run:** the site builds; measured in a browser at 1000, 1400 and 1920 pixels wide, the links' center matches the box's center each time.

## 2026-11-14 13:29 CST · "Track a package" box at the top of the home page

- **Asked for:** "The first thing I want customers to see is a 'track my shipment' box on the front page, for ease of use, kind of similar to how UPS does it on ups.com."
- **What changed:**
  - **A big "Track a package" box** is now the first thing on the home page, full width, above everything else: one box for the pickup code or tracking number, a **Track** button, and quick links under it (**Ship a package**, **Hours and directions**, **Contact**). Pressing Track opens the tracking page with the results already looked up. It works even without JavaScript, and in all 14 languages.
  - **Packages not shipped here:** before, a UPS or FedEx number from somewhere else just got "We could not find that." Now the tracking page recognizes the carrier from the number's shape and offers a **"Track on UPS"** (or USPS, FedEx, DHL) button that opens the carrier's own tracking page. A number that could belong to two carriers gets both buttons.
  - **Fixed:** the tracking page always showed an empty red error box, even with no error. Empty error lines are now hidden everywhere.
- **Why:** Tracking is the most common reason people visit a shipping store's site, so it's one step from the home page, and nobody gets stuck on "not found".
- **Files:** [home page](../site/src/pages/index.astro), [tracking page](../site/src/pages/track/index.astro), [carrier recognition (new)](../site/src/lib/carrierTrack.ts), [tests (new)](../site/tests/carrier-track.test.ts), [text, 14 languages](../site/src/i18n/strings.ts), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321. Type a pickup code from one of your test orders and press Track. Then try `1Z999AA10123456784`: a "Track on UPS" button appears.
- **Checks run:** 154 tests pass (7 new), the type check is clean, the site builds. In a real browser: the box is first on the page; a real pickup code shows its status; a UPS number not shipped here offers UPS's tracking; nonsense still says "not found"; on a phone there's no sideways scrolling.
- **Noticed, not changed:** on a phone, the site's header (menu, language, text size) fills the whole first screen, so the tracking box is just below it. That's William's header design: D13 in [FOR-WILLIAM.md](FOR-WILLIAM.md).

## 2026-11-14 13:08 CST · To-do: insurance terms, do's and don'ts, limits

- **Asked for:** "Let's add to the to-do list about insurance, like a disclaimer with do's and don'ts, how much we can actually insure, what is not insurable. I don't want to add it yet because we would have to look at all the regulations per carrier."
- **What changed:** Added **P3** to the to-do list: what the disclaimer should cover, why it's waiting, what the site does today, a research checklist to fill in for each carrier (limits, free cover, items never covered, lower-limit items, packing rules, proof, deadlines, who files), and the decisions after that. Also added as **D12** in the meeting notes for William. Nothing on the website changed.
- **Why:** So the insurance terms are written from each carrier's real rules, not guessed, before customers see them.
- **Files:** [TODO.md](TODO.md) (P3), [FOR-WILLIAM.md](FOR-WILLIAM.md) (D12)
- **How to check it:** On GitHub, open `peter/TODO.md` on the `peter` branch and scroll to P3.

## 2026-11-14 13:05 CST · "What's inside" only asked with insurance

- **Asked for:** "For the What's inside box near the insurance tickbox, let's only make that box pop up if they check the insurance tickbox, because that's the only time it matters."
- **What changed:**
  - **What's inside** moved from "What is it?" into the insurance box, under **Value in USD**. It's hidden until **Insure it for the full value** is ticked.
  - When insurance is ticked, it's required, along with the value: Get rates asks for both.
  - Without insurance, the contents aren't sent at all; carriers get "Merchandise" on the label, as they already did when it was left blank.
- **Why:** One less box for most customers. The contents matter for an insurance claim, so they're asked exactly then.
- **Files:** [ship page](../site/src/pages/ship/index.astro)
- **How to check it:** `git pull`, open http://localhost:4321/ship. No "What's inside" box at first. Tick **Insure it for the full value**: Value in USD and What's inside appear. Untick it: both disappear.
- **Checks run:** 147 tests pass, the site builds. In a real browser: hidden at first, shown and required with insurance, sent only with insurance, hidden and not sent again after unticking.

## 2026-11-14 13:00 CST · Packaging picker with pictures on the Ship page

- **Asked for:** a packaging choice like Pirate Ship's (USPS flat rate boxes and envelopes, UPS Express packaging), with pictures so customers see what they're shipping in. "Use the photos I have for now, and draw the ones for FedEx."
- **What changed:**
  - **A "Packaging" picker** at the top of "What is it?". It shows the current choice with its picture; **Change** opens the full list with pictures, in four groups:
    - **Your own packaging:** envelope or soft pack, box (the default), tube or irregular.
    - **USPS:** Small, Medium and Large Flat Rate boxes; Flat Rate, Legal and Padded envelopes; Priority Mail Express, Legal and Padded envelopes.
    - **UPS:** Express Envelope, Small, Medium and Large Express Box, Express Tube, Express Pak.
    - **FedEx:** Envelope, Pak, Small, Medium, Large and Extra Large Box, Tube.
  - **Carrier packaging fills in its own size**, so the size boxes hide and the customer only types the weight ("The size comes from the packaging: just type the weight").
  - **Only the right services show:** USPS Flat Rate items by Priority Mail; USPS Express envelopes by Priority Mail Express; UPS Express items by UPS air services; FedEx items by FedEx Express services.
  - **The carrier is told the packaging**, when pricing and on the label (USPS rate indicator, UPS packaging code, FedEx packaging type).
  - **Tube or irregular** ticks "Irregular package" and opens Extra services so the customer sees it.
  - **Clear messages:** USPS packaging over 70 lb is refused; a combination nothing can carry (for example hazardous materials in a flat rate box, which must go by Ground Advantage) says so instead of showing an empty list.
  - Each carrier item says **"Ask for one at our counter"**, to bring people in for the free carrier packaging.
  - The **counter page** shows the packaging; **saved packages** remember it.
  - Sizes now accept decimals (12.5 in), for flat rate sizes and for customers' own boxes.
  - Demo rates gained UPS 2nd Day Air, FedEx 2Day and USPS Priority Mail Express, so carrier packaging can be tried before the carrier accounts are connected.
  - All new text in all 14 languages. Carrier product names stay in English, as printed on the packaging.
- **Pictures:** the general, USPS and UPS pictures are cropped from the Pirate Ship screenshots Peter supplied, **for now**: they belong to Pirate Ship or the carriers, so they should be replaced before the site goes live (D10 in [FOR-WILLIAM.md](FOR-WILLIAM.md)). The 7 FedEx pictures are drawn by the store in FedEx's colors, without FedEx's logo. All live in `site/public/packaging/` (308 KB), so swapping them is just replacing files.
- **Why:** Flat rate and carrier packaging can save customers a lot, there's nothing to measure, and the store avoids carrier adjustment charges when packaging is declared correctly.
- **Files:** [packaging catalog and rules (new)](../site/src/lib/packaging.ts), [tests (new)](../site/tests/packaging.test.ts), [pictures (new)](../site/public/packaging/), [ship page](../site/src/pages/ship/index.astro), [parcel checks](../site/src/lib/validate.ts), [rate engine](../site/src/shipping/engine.ts), [USPS](../site/src/shipping/providers/usps.ts), [UPS](../site/src/shipping/providers/ups.ts), [FedEx](../site/src/shipping/providers/fedex.ts), [demo rates](../site/src/lib/easyship.ts), [shipment types](../site/src/shipping/types.ts), [counter page](../site/src/pages/counter/[code].astro), [text, 14 languages](../site/src/i18n/strings.ts), [staff text](../site/src/i18n/staff3.ts), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321/ship. Under "What is it?", click **Change** next to Packaging and pick **USPS Priority Mail Medium Flat Rate Box**: the size boxes disappear. Fill in the rest and Get rates: only USPS Priority Mail. Try a UPS or FedEx item: only that carrier's express services.
- **Checks run:** 147 tests pass (11 new, including that every picture file exists), the type check is clean, the site builds. In a real browser: all 25 items listed with pictures, every carrier rule above, the 70 lb limit, the hazmat-plus-flat-rate message, and a flat rate order showing its packaging on the counter page.
- **Bug caught while testing:** the size boxes only accepted whole inches, so a flat rate box's 8.5 in size blocked Get rates silently. Fixed by allowing decimals.

## 2026-11-14 12:37 CST · Return labels on the Ship page

- **Asked for:** the Pirate Ship "Return Labels" tick box (screenshot), with its two choices: "Return Labels Only" and "Return Labels Included".
- **What changed** (in **Extra services**, under Signature confirmation):
  - A **Return label** checkbox. Ticking it opens two choices:
    - **Return label only** (picked by default): swaps the addresses, so the one label runs from the "Where is it going?" address back to the return address. The order is marked as a return.
    - **Return label included**: the outgoing label plus a return label. Each rate shows the return label's price under it ("+ $9.65 return label"), and the total includes it.
  - The return label uses **the same service back** when that carrier offers it, otherwise the same carrier's cheapest, otherwise the cheapest of all. It has no signature and no insurance.
  - Both labels are bought when the order is paid. The **done page** shows the return label line and a "Download return label" button; the **counter page** shows it with its tracking number and "Open return label to print". It's recorded as its own shipment (pickup code + "-R") for reports and tracking.
  - If the return label can't be bought after the outgoing one was, the outgoing label still stands, and the counter page shows a red note to buy the return label by hand.
  - A business account's discount applies to the return label too. On the card payment page it's its own line.
  - Saved packages remember the return label choice.
  - All new text in all 14 languages.
- **Why:** Sellers who expect returns can send a return label with every package, and anyone can buy just a return label.
- **How it's charged, for now:** the return label is **charged now, at the price shown** (the page says so). Pirate Ship's "charges postage only if used" needs the postal service's pay-on-use returns on the store's own account, plus a way to bill the customer later. That's a decision for the prices meeting (D9 in [FOR-WILLIAM.md](FOR-WILLIAM.md)).
- **Files:** [ship page](../site/src/pages/ship/index.astro), [return label rules](../site/src/lib/options.ts), [tests](../site/tests/options.test.ts), [rates](../site/src/pages/api/rates.ts), [orders](../site/src/pages/api/orders.ts), [order record](../site/src/lib/orders.ts), [card payment](../site/src/lib/stripe.ts), [label step](../site/src/lib/fulfil.ts), [done page](../site/src/pages/ship/done.astro), [counter page](../site/src/pages/counter/[code].astro), [text, 14 languages](../site/src/i18n/strings.ts), [staff text](../site/src/i18n/staff3.ts), [styles](../site/src/styles/global.css)
- **How to check it:** `git pull`, open http://localhost:4321/ship, fill in the form, open **Extra services**, tick **Return label**.
  - Leave **Return label only**, Get rates, pay: the done page says the label goes *to* your return address.
  - Pick **Return label included**, Get rates: each rate shows "+ $X return label"; pick one and the total includes it. Pay: the done page has both download buttons.
- **Checks run:** 136 tests pass (4 new), the type check is clean, the site builds. Both choices bought in a real browser: "only" sent the label to the sender's address; "included" charged $19.98 on the page and the order alike, and both labels showed on the done and counter pages.

## 2026-11-14 12:25 CST · Meeting notes for Peter and William

- **Asked for:** "Let's make sure we are documenting all these hiccups so when me and William meet again we can pick up what we are talking about."
- **What changed:**
  - New file [FOR-WILLIAM.md](FOR-WILLIAM.md), in five sections:
    1. **Problems found** (H1 to H5): the two missing README setup steps, the insurance that was charged but never bought, the signature total bug, and the address dropdown that looked broken.
    2. **Changes to William's code**, and why each is worth his review.
    3. **Things to check once carrier accounts are connected.**
    4. **Decisions waiting** (D1 to D8), with who decides.
    5. **Things left alone on purpose.**
  - A new rule in Peter's Claude instructions: every future hiccup, open decision or change to William's code goes into this file in the same commit, so it stays current without being asked.
- **Why:** So the next meeting with William starts from one page instead of memory.
- **Files:** [FOR-WILLIAM.md (new)](FOR-WILLIAM.md), [CLAUDE.md](CLAUDE.md) (rule 6), [README.md](README.md) (lists the new file)
- **How to check it:** On GitHub, open the `peter` folder on the `peter` branch and click FOR-WILLIAM.md.

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
