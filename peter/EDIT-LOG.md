# Peter's edit log

Every edit made for Peter, newest first. Times are Central (the store's time zone). Each entry matches one commit on the `peter` branch. The layout is set in [CLAUDE.md](CLAUDE.md).

---

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
- **Checks run:** all 119 automated tests pass, the type check is clean, and the site builds. Both dropdowns were tried in a real browser.

## 2026-11-14 10:37 CST · Set up Peter's section

- **Asked for:** "a tabbed section for Pete's edits ... so our work wouldn't affect each other. I'd have my own section and my own readme section ... a date and time stamp per edit."
- **What changed:** Made Peter's own branch (`peter`) and folder (`peter/`), with a README explaining how it stays separate from William's work, this edit log, and a set of instructions so Claude logs every future edit here with the date and time.
- **Why:** So Peter can make and document his own changes, and William can review them, without either person's work changing the other's until both agree.
- **Files:** [README.md](README.md), [EDIT-LOG.md](EDIT-LOG.md), [CLAUDE.md](CLAUDE.md)
- **How to check it:** On GitHub, switch the branch picker to `peter` and open the `peter` folder.
- **Note for William:** While setting up the site on Peter's Windows PC, two steps were missing from the root README's "Run the website" guide. First, `npm run db:local` must be run once, or Get rates fails with `D1_ERROR: no such table: retail_rules`. Second, on Windows, `npm` is blocked until `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` is run once. Worth adding both to the README.
