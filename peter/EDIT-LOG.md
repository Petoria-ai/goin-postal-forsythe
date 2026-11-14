# Peter's edit log

Every edit made for Peter, newest first. Times are Central (the store's time zone). Each entry matches one commit on the `peter` branch. The layout is set in [CLAUDE.md](CLAUDE.md).

---

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
