# Peter's edit log

Every edit made for Peter, newest first. Times are Central (the store's time zone). Each entry matches one commit on the `peter` branch. The layout is set in [CLAUDE.md](CLAUDE.md).

---

## 2026-11-25 20:49 CST · Print orders: a "Download Gelato's product list" button

- **Asked for:** "would it help if i attached gelato's api for you to see all of gelatos products in one spot?", then "whats the safest way to do it? last time we just put a input api key for virtual mail but on the admin side".
- **What changed:** the safest way is the key box already on **Counter → Print orders** (owner PIN only, the key is locked before it's saved and never shown again). Below it is a new **Gelato's product list** button (manager or owner PIN). It reads Gelato's whole catalog with that key, one product group at a time with a progress line, and saves a file such as `gelato-catalog-2026-11-25.json` to your Downloads folder. It only reads: nothing is ordered or changed in Gelato. The file has products, sizes, colors and product codes but **no key**, so it's safe to send to Claude.
- **Why it helps:** the product codes in our print setup are guesses until now; with the file Claude can put in Gelato's real codes (P23) and make the menus match exactly what Gelato makes.
- **Tested:** with a pretend Gelato (3 new tests: the catalog list, reading every page of a catalog, and a clear "check the key" message when Gelato refuses it), and on the page (the box shows for a manager or owner once a key is saved). It can't reach the real Gelato from Claude's workspace; it will from your PC.
- **Files:** [site/src/lib/gelato.ts](../site/src/lib/gelato.ts), [site/src/pages/api/print-staff.ts](../site/src/pages/api/print-staff.ts), [site/src/pages/counter/print.astro](../site/src/pages/counter/print.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/gelatoCatalog.test.ts](../site/tests/gelatoCatalog.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, restart `npm run dev`, open Counter → Print orders with the owner PIN, paste the Gelato key in the key box at the bottom and press Save key, then press **Download Gelato's product list**.

## 2026-11-25 18:16 CST · Print shop dropdowns match Gelato's lists

- **Asked for:** Peter sent Gelato's dropdowns for Home and living, Kids and baby, and Drinkware: "this is what is in gelatos dropdown menus".
- **What changed:** our lists now follow Gelato's, since Gelato is the supplier, and the big dropdown shows **headings in columns** like Gelato's:
  - **Kids & Baby:** "Kids, 2 to 14" (t-shirts, hoodies, long sleeve, caps), "Baby, 0 to 24 months" (bodysuits, rompers), "Also for kids" (aprons, lunch boxes).
  - **Home & Living:** "Kitchen and table" (aprons, coasters, lunch boxes), "Home and decor" (ornaments, candles, golf balls). Throw pillows and blankets are gone (not in Gelato's list); phone cases moved to Accessories.
  - **Drinkware:** ceramic, enamel, travel, latte and slim mugs, water bottles, glassware & cups, tumblers, can coolers, food jars, in two columns.
  - **Hats & Bags is now "Accessories"** (Gelato's name; caps, beanies, tote bags, phone cases). Its page is now /shop/accessories.
- Every new name is in all 14 languages, each item has a drawing until photos arrive, and a new test checks that every name is translated and the columns come out right. The bar still fits on one row from 1301 pixels wide.
- **Files:** [site/src/data/printCatalog.ts](../site/src/data/printCatalog.ts), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/components/PrintArt.astro](../site/src/components/PrintArt.astro), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/printCatalog.test.ts](../site/tests/printCatalog.test.ts)
- **How to check it:** `git pull`, refresh, point at **Kids & Baby**, **Home & Living** and **Drinkware**.

## 2026-11-25 18:10 CST · Print shop: Home & Living and Pets categories

- **Asked for:** "also lets add home and living and pets" (Gelato's catalog bar), and "im probably going to need ai pet models too haha".
- **What changed:** two new categories in the catalog bar, each with its own big dropdown, shop page, explore strip and picture card. **Home & Living:** throw pillows, blankets, phone cases, aprons. **Pets:** pet bandanas, pet beds, pet bowls. Nothing in them is online yet, so they show "Ask for a price" until Gelato products are set up. Each has a drawing until real photos arrive; the names are in all 14 languages.
- **To make room:** three category names are shorter: "Hats & Bags" (was Hats & Accessories), "Wall Art" (was Wall Art & Posters), "Cards & Stationery" (was Business Cards & Stationery). The bar fits on one row on screens 1301 pixels wide and up (a common laptop is 1366) and swipes sideways on smaller ones, as before.
- **Photos:** the to-do (P23) now notes the photo ideas: Gelato's Mockup Studio first, AI model tools (including AI pet models) if needed, and the mascot plan.
- **Files:** [site/src/data/printCatalog.ts](../site/src/data/printCatalog.ts), [site/src/components/PrintArt.astro](../site/src/components/PrintArt.astro), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/styles/global.css](../site/src/styles/global.css), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, refresh, point at **Pets** in the catalog bar, then open **Home & Living**.

## 2026-11-25 18:00 CST · Fix: a type error in the dropdown change

- **What happened:** the previous commit (every dropdown stays open) passed the browser check but was pushed with one line the type checker rejects (it read a touch-screen detail that mouse events don't have), so `npm test` failed. Claude's check printed nothing and the commit went through anyway.
- **What changed:** that line is removed; the other check on the same line (does this screen have a mouse) already keeps phones and tablets on taps. `npm test` passes again (295 tests), and the browser check was re-run: Tracking, the account menu and the catalog all stay open on the way down; the phone tap still works.
- **Files:** [site/src/layouts/Base.astro](../site/src/layouts/Base.astro)

## 2026-11-25 17:59 CST · Every dropdown stays open on the way down (Tracking and the account menu too)

- **Asked for:** "and thats for all the drop down menu stuff.. can we eliminate the gap for any drop down menu like 'Tracking' tab".
- **What changed:** **Tracking ▾** and the **"Hi, …"** account menu now work like the catalog bar: an invisible bridge covers the space between the button and its menu, the menu waits about a third of a second before closing, and another menu takes over only if the mouse stops on it. Phones are unchanged (a tap opens and closes). Tested with a slow diagonal mouse path into each menu: Tracking → View all shipments, Hi → My mailbox, Men's → Long sleeve; each stayed open and the click went through.
- **Files:** [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, refresh, move slowly from Tracking down to "View all shipments".

## 2026-11-25 17:57 CST · Catalog dropdowns no longer close on the way down

- **Asked for:** "i hate how when i hover my mouse to go into the womens dropdown. it disappears when i try to click one of the options then i have to hover the button again".
- **Why it happened:** there was a small gap between the category name and its panel, and moving at an angle down to an option crossed the next category (Men's), which took over.
- **What changed:** each category now fills the bar's full height, so there's no gap. A panel stays open for about a third of a second after the mouse leaves it, and another category takes over only if the mouse stops on it for a moment. Tested with a slow diagonal path from Women's across Men's down to "Long sleeve": the panel stays open and the click goes through. Escape still closes it, and keyboard users open it with Tab as before.
- **Files:** [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, refresh, point at Women's and move down to an option.

## 2026-11-25 17:52 CST · Print shop: a big dropdown per category, and shop pages with an "Explore" strip (like Gelato)

- **Asked for:** "lets add a drop down menu like how this works. then i want to have like a selection at the top. like for example if they click t shirt in womens.. it'll still give them the different options like a slide show at the top just incase they want to browse for other stuff" (Gelato's catalog screenshots).
- **What changed:**
  - **The big dropdown:** hovering a category in the catalog bar (Women's, Men's, ...) opens a full-width panel. On the left, ways to order: **Design it online**, **12 or more?** (team, church & business orders), **Need it fast?** (ask about rush). In the middle, **Shop by product** (for Women's: T-shirts, Hoodies, Long sleeve, Tank tops, Crop tops) and **View all Women's**. On the right, a picture with **From $24.99** or **Ask for a price**.
  - **Shop pages:** each category and section has its own page, for example `/shop/womens` and `/shop/womens/t-shirts`. At the top: the path back (**Print shop › Women's › T-shirts**), the title, and **Explore Women's**, a strip of every section in the category with pictures and prices that scrolls sideways (arrows on a computer, a swipe on a phone), with the one you're on outlined. Below: what's online to design (the unisex t-shirt, **Design it**), or a **"Not online yet, but we can make it"** card with Ask for a price and Call us. Clothing pages also have **"12 or more, or need it fast?"**, pointing to local printing.
  - **Sections so far:** Women's (T-shirts, Hoodies, Long sleeve, Tank tops, Crop tops), Men's (T-shirts, Hoodies, Long sleeve, Polo shirts, Tank tops), Kids & Baby (Kids' t-shirts, Baby onesies, Kids' hoodies), Hats & Accessories (Caps, Beanies, Tote bags), Drinkware (Mugs, Water bottles, Tumblers), Wall Art & Posters (Posters, Framed prints, Canvas), Signs & Banners (Banners, Yard signs), Business Cards & Stationery (Business cards, Flyers, Postcards). Online today: t-shirts, posters, flyers and business cards; the rest say "Ask for a price" until their Gelato products are added (one line each in `site/src/data/printCatalog.ts`).
  - The picture cards on Printing and the home page now open these shop pages. Every section has its own simple drawing until real photos arrive.
- **Files:** [site/src/data/printCatalog.ts](../site/src/data/printCatalog.ts), new [site/src/components/PrintArt.astro](../site/src/components/PrintArt.astro), [site/src/components/PrintCategories.astro](../site/src/components/PrintCategories.astro), new [site/src/pages/shop/[cat]/[...sub].astro](../site/src/pages/shop/%5Bcat%5D/%5B...sub%5D.astro), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts)
- **How to check it:** `git pull`, refresh, point at **Women's** in the catalog bar, click **T-shirts**.

## 2026-11-25 17:17 CST · An airier print catalog: shop by who it's for, with picture cards (for Peter to approve)

- **Asked for:** "whats a good way to make things look alittle more airy? gelato has pictures of the types of things they sell / and i think maybe having the categories would enable shoppers/customers separated in genders", then "lets see what you come up with and i'll adjust or approve it if it looks good".
- **What changed:**
  - **The catalog bar** is lighter, like Gelato's: thin gray words, a soft rounded highlight on hover and on the page you're on, more room. It's sorted by who it's for: **Women's · Men's · Kids & Baby · Hats & Accessories · Drinkware · Wall Art & Posters · Signs & Banners · Business Cards & Stationery · All Printing**. Each still opens a short menu.
  - **Picture cards:** a grid of 8 category cards (4 across on a computer, 2 on a phone), each with a light drawing of the product on a soft colored background, a small "CATEGORY" label, the name, and **"From $24.99"** or **"Ask for a price"** (for what's quoted in the store today: kids, hats, drinkware, signs). They're at the top of the **Printing** page (the old four tiles are below as "More from the print shop") and on the **home page** under **"Shop the print shop"**.
  - **Real photos later:** the drawings are stand-ins. A photo from Gelato's Mockup Studio or of a sample goes in `site/public/print/<category>.jpg` and replaces its drawing (one line in `PrintCategories.astro`).
  - Starting prices come from the product files, so they change when prices change.
  - **Note:** Women's and Men's lead to the one unisex t-shirt for now, and Kids, Hats and Drinkware to the ask-us pages, until Peter picks those products in Gelato and sends their product codes.
- **Files:** [site/src/data/printCatalog.ts](../site/src/data/printCatalog.ts), new [site/src/components/PrintCategories.astro](../site/src/components/PrintCategories.astro), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/pages/printing/index.astro](../site/src/pages/printing/index.astro), [site/src/pages/index.astro](../site/src/pages/index.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts)
- **How to check it:** `git pull`, refresh; look at Printing and the home page.

## 2026-11-25 17:06 CST · Top menu cleaned up; Account is the "Hi, Peter" dropdown

- **Asked for:** "i think we need to clean up the first row. like hours/contact / maybe account could be a where it saids 'Hi, Peter' possibly a dropdown menu".
- **What changed:**
  - The top row is now **Ship a package · Tracking ▾ · Mailboxes · Services · Contact & Hours** (it was nine items).
  - **Hours** and **Contact** are one link, **Contact & Hours** (the contact page already shows the hours).
  - **Printing ▾** left the top row; the print catalog bar right under it covers every printing category.
  - **Mailboxes** is in the top row now (the mailbox page was only linked from elsewhere).
  - **Account** is the button at the top right: signed in it says **"Hi, Peter"** and opens a menu on hover (a tap on a phone): **My account · My orders & shipments · My mailbox · Sign out**. Signed out it's still **Log in**.
  - **About PeterShip** moved to the footer, next to Staff sign-in.
- **Files:** [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts)
- **How to check it:** `git pull`, refresh, sign in on the website, point at "Hi, …".

## 2026-11-25 16:59 CST · A print catalog bar across the top of every page (like Vistaprint and 4over)

- **Asked for:** "whats the best way arrange my website to advertise i do printing as well? instead of just having a 'Printing' tab", then (to the idea of a single shirt button) "that looks ghetto.. because some people may see it as just a building a shirt.. i like how vistaprint or 4over has their catalog all over the top".
- **What changed:** a second row under the main menu on every page, a white bar with the whole print catalog: **Business Cards · T-Shirts & Apparel · Signs, Banners & Posters · Flyers & Marketing · Promo Products · All Printing**. Each opens a short menu on hover or keyboard focus (for example T-Shirts & Apparel: Design a custom t-shirt; Team, church & business orders (12+); Embroidered shirts & hats). The category you're in is underlined in red. On a phone it's one row that swipes sideways. Only what the store sells today is listed (designed online, or quoted in the store); a new product is one line in `site/src/data/printCatalog.ts`. In all 14 languages.
- **Files:** new [site/src/data/printCatalog.ts](../site/src/data/printCatalog.ts), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts)
- **How to check it:** `git pull`, refresh any page.

## 2026-11-25 16:39 CST · Gelato print orders, stage 2: the order page and Counter → Print orders (test mode)

- **Asked for:** carrying on with "its more about executing the job" (Gelato for shirts, posters and flyers).
- **What changed:**
  - **New customer page `/print`** ("Order shirts, posters & flyers online" in the **Printing** menu), with a tab per product:
    - **T-shirt:** a color swatch, where the design goes (front center, left chest, or nothing on the front; plus the back), how many of each size (up to 12 online; more says to ask for a bulk quote).
    - **Poster / Flyers:** a size and a quantity, each showing its price.
    - **Your design:** a PNG or JPEG. A **live preview** (the shirt in its color with the logo in place, or the poster cropped to the paper) and a **sharpness check**: green "Sharp", yellow "A little soft", or red "Too blurry to print", which blocks ordering.
    - **Delivery:** shipped to the store for pickup, or to their address.
    - **The price** with shipping, tax and the online fee, then **Check out** on Stripe's page (sign-in needed). The thank-you page shows the order number and status.
    - The page makes the print files itself: each shirt side's whole print area at 150 dots per inch, or the poster or flyer cropped to the paper.
  - **New staff page Counter → Customers → Print orders:**
    - A banner says the mode: **TEST MODE** (no Gelato key yet), **DRAFTS** (key saved; Gelato gets drafts it doesn't print or charge), or **LIVE**.
    - Tabs: **Waiting for approval**, **At Gelato**, **Done**, **All**. Each order shows what was ordered, what was paid, Gelato's estimated cost and about what the store keeps, delivery, and buttons: **Artwork** (see the files), **Approve and send to Gelato**, **Check status**, **Cancel** (manager or owner, before it's sent; refund it in Stripe).
    - **Connection** (owner PIN): paste the Gelato API key, and the **Send real orders** switch. It also shows the webhook address to paste into Gelato's dashboard so status and tracking come back by themselves.
  - Wording in all 14 languages.
- **Files:** new [site/src/pages/print/index.astro](../site/src/pages/print/index.astro), [site/src/pages/print/done.astro](../site/src/pages/print/done.astro), [site/src/pages/counter/print.astro](../site/src/pages/counter/print.astro); [site/src/layouts/Base.astro](../site/src/layouts/Base.astro) (Printing menu), [site/src/data/staffNav.ts](../site/src/data/staffNav.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev` (no new tables). Signed in on the website, Printing → **Order shirts, posters & flyers online**; then Counter → Customers → **Print orders** with your PIN.

## 2026-11-25 16:30 CST · Gelato print orders, stage 1: the behind-the-scenes part (test mode)

- **Asked for:** "at this current time. its more about executing the job" (start Gelato with t-shirts, posters and flyers).
- **What changed (no new pages yet; those are stage 2):**
  - **Presets in one file the owners edit**, `site/src/data/printProducts.json`: a **T-shirt** (4 colors, S to 3XL, front center or left chest, and/or back; $24.99, +$6 for a second spot, +$3 for 2XL and up; over 12 shirts asks for a quote), **Posters** (12 × 18, 18 × 24, 24 × 36 in 1, 2 or 5) and **Flyers** (8.5 × 11 or 5.5 × 8.5 in 25 to 250), plus shipping $6.99 an order. An **embroidered item** is ready but turned off until its Gelato product code is filled in. All prices are starting guesses to change.
  - **Orders:** the customer must be signed in, the artwork is checked (PNG or JPEG; posters and flyers must be sharp enough for the paper and cropped to it), they choose **pickup at the store** (shipped to the store) or **ship to my home**, and pay on Stripe's page (sales tax and the online fee as on cards).
  - **Nothing goes to Gelato until staff approve it.** Three modes: **pretend** (no Gelato key: nothing leaves the website), **draft** (key saved: Gelato gets a draft it doesn't print or charge), **live** (an owner switches real orders on).
  - **Gelato gets the artwork through a private signed link**, and when Gelato reports a change the website asks Gelato itself for the status and tracking before saving them.
  - Only a manager or owner cancels, and only before it's sent; only an owner saves the Gelato key or switches real orders on. Everything is in the audit log.
- **Not touched:** `/api/print` is William's label print queue and stays as it was; the new ones are `/api/print-orders`, `/api/print-staff`, `/api/print-file` and `/api/gelato-webhook`.
- **Files:** new [site/src/data/printProducts.json](../site/src/data/printProducts.json), [site/src/lib/printProducts.ts](../site/src/lib/printProducts.ts), [site/src/lib/printOrders.ts](../site/src/lib/printOrders.ts), [site/src/lib/gelato.ts](../site/src/lib/gelato.ts), [site/src/pages/api/print-orders.ts](../site/src/pages/api/print-orders.ts), [site/src/pages/api/print-staff.ts](../site/src/pages/api/print-staff.ts), [site/src/pages/api/print-file.ts](../site/src/pages/api/print-file.ts), [site/src/pages/api/gelato-webhook.ts](../site/src/pages/api/gelato-webhook.ts), [site/tests/print.test.ts](../site/tests/print.test.ts); [site/src/lib/stripe.ts](../site/src/lib/stripe.ts), [site/src/pages/api/stripe-webhook.ts](../site/src/pages/api/stripe-webhook.ts), [site/src/pages/api/mock-paid.ts](../site/src/pages/api/mock-paid.ts)
- **How to check it:** nothing to click yet; stage 2 adds the customer page and Counter → Print orders.

## 2026-11-25 16:24 CST · To-do P22: Printify or Printful for cheaper shirts, later

- **Asked for:** "lets put printify/printful on the possible to do list in the future. at this current time. its more about executing the job and then we can start cost reducing once things are being ran".
- **What changed:** new to-do **P22**: Gelato runs everything first; once orders are regular, compare Printify and Printful for shirts and connect one if it saves enough. Nothing on the website changed.
- **Files:** [TODO.md](TODO.md)

## 2026-11-25 16:23 CST · Printing plan: Gelato does embroidery; leaning Gelato for everything

- **Asked for:** "im looking at gelato and then theres printful or printify.. i feel i realyl cant go wrong with them", then "gelato has embroidery on select items".
- **What changed (plan only):** the clothing section in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#clothing-dropship-only-peter-november-25) notes Gelato's embroidery on select items and the leaning: **Gelato for everything to start** (one account, one connection, one branding setup, one bill), with Printify or Printful added later for shirts if wanted.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 16:16 CST · Printing plan: local shops for rush clothing orders

- **Asked for:** "im thinking if i have to go local. then it'd be more for rush shipping if i need it tomorrow or something i feel".
- **What changed (plan only):** the clothing section in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#clothing-dropship-only-peter-november-25) adds **Rush**: a checkout choice (ready in 1 to 2 business days, at a rush price) that goes to a local shop (Atomic Ink in West Monroe) by hand with pickup at the store, plus what to settle with the shop first (cutoff, which styles, their price, minimums).
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 16:14 CST · Printing plan: clothing by dropship only (Printify first); business cards on hold

- **Asked for:** "i may have to hold off on business cards. cloudprinter seems more expensive / lets go into clothing for garments and stuff", then "i dont want to buy a printer at all.. dropshipping only ... i could use print shops nearby locally but i'd have to price them higher".
- **What changed (plan only):** a clothing section in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#clothing-dropship-only-peter-november-25): no equipment or stock; **Printify** first (lowest base prices, API), **Printful** as the quality and branding alternative; presets on the website (styles, color, sizes, logo or text in fixed spots, a mockup); staff approval; bulk orders of 12+ by quote through the local partners at a higher price. Peter's next step: free accounts, the same shirt priced on both, one sample shirt each.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 15:29 CST · Printing plan: Cloudprinter's business card quotes saved

- **Asked for:** Peter's Cloudprinter quotes (100, 200 and 500 US-size cards, 350gsm, gloss lamination) and "my price isnt a set in stone price.. im just trying to see these products and their customizability and print on demand service".
- **What changed (plan only):** the quotes, what the codes mean, and the read on them are in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#business-cards-not-on-gelato-peter-november-25): about 11 to 12¢ a card plus shipping at every quantity; good as a print-on-demand service for premium laminated cards priced to cost; everyday cards stay with the shop's laser or 4over; what to try next on Cloudprinter.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 15:09 CST · Printing plan: business cards off Gelato; API printers for cards

- **Asked for:** Gelato's business card price ($1.81 for 10), "lets skip business cards in gelato.. do you possibly have any ideas of what websites that have api, customizations similar to gelato but for business cards?"
- **What changed (plan only):** a section in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#business-cards-not-on-gelato-peter-november-25): Gelato's cards lose money from 250 up at the website's prices, so cards stay off Gelato. Options with an API: **4over** (about 4¢ a card), **Cloudprinter** (from €1.53 for 50, free plan with API, most Gelato-like), Printograph (volume brokers), Printful (card sets); MOO has no public API. Next: price 250 and 500 cards from Cloudprinter and 4over.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 13:26 CST · Printing plan: Gelato's branded packaging

- **Asked for:** "gelato looks pretty admn neat how it even does branded packaging included".
- **What changed (plan only):** the Gelato row in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#other-options-outside-the-franchise-list) now covers its branded packaging: one 4×6 insert card and one 4×3 sticker per order, from about $0.49 each on paid Gelato+ plans, charged only when an order ships, on some products and locations only. Idea: the insert as a coupon that brings customers back to the counter.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 12:32 CST · Printing plan: options outside the franchise's list

- **Asked for:** "i dont have to use their vendors.. just options i can use. im open to seeing what other options are there. and if they fit better for the website. id do it".
- **What changed (plan only):** a new section in [`monetization/print-suppliers/`](../monetization/print-suppliers/README.md#other-options-outside-the-franchise-list): **Gelato** (the best API: test mode, notices when orders ship; higher cost per piece, made for small runs), **Printful** (merch with no minimums, strong API), **SinaLite** (trade-only, blind shipping, says it's cheaper than 4over), **Smartpress** (reseller program, tax refunded on resale), **4OVER4** (a different company from 4over; blind shipping). 4over still fits best for trade-priced paper products with an API; Gelato could be the first automated connection while 4over's approval comes through. Decision 3 updated.
- **Files:** [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md)

## 2026-11-25 12:32 CST · Printing suppliers researched, and the plan for customers designing with presets

- **Asked for:** the franchise's vendor list (trade printers 4over, Printograph, Zoo Printing; banners and signs Signs2Trade, Signs365) with "i can use whatever i please", and "i also want to be able to do a way where i can allow the customers to customize their product ... but probably only with presets.. nothing too out of ordinary that would cause hiccups or misprints".
- **What changed (a plan, nothing on the website yet):** new [`monetization/print-suppliers/README.md`](../monetization/print-suppliers/README.md):
  - Each vendor: what it's for, trade-only, blind shipping, whether it has an API, speed, what to ask. **4over** has a real API (products, options, quotes, orders, status, tracking; needs their approval and a resale certificate). **Printograph** is GotPrint's trade side, with shirts and embroidery, blind shipping, and an API for higher-volume brokers. **Zoo Printing** advertises 1 to 2 days of production. **Signs365** ships blind with no markings (resellers' reports). **Signs2Trade** is eSigns' trade arm.
  - A routing chart (which vendor prints what), a price sheet to fill in with the same items from each, and the questions to ask every vendor.
  - **Presets, not a free canvas:** choices only from what the supplier makes; templates with fixed boxes (based on the business card designer); the website checks sharpness, the cut line, text size and QR codes; the customer approves a proof; **staff approve before it goes to the printer**. Phase 1 by hand, phase 2 through 4over's API.
  - Six decisions for Peter and Rin.
  - Linked from `monetization/README.md`, the main `README.md` and to-do P9.
- **Files:** new [monetization/print-suppliers/README.md](../monetization/print-suppliers/README.md), [monetization/README.md](../monetization/README.md), [README.md](../README.md), [TODO.md](TODO.md)

## 2026-11-25 12:07 CST · Staff stay signed in for 10 minutes, with a 2-minute countdown

- **Asked for:** "lets just keep everything on those tabs the same" (Customers and Store stay as they are), and "for staff sign in, allow the sign in person 10 minutes to stay signed in so we dont have to keep typing in the passcode. and then a popup window pops up that is a countdown timer of the last 2-3 minutes to keep active".
- **What changed:**
  - **Type the PIN once** (on the counter home page or any counter page). For the next **10 minutes** every counter page fills it in by itself and opens (presses Show) on its own. Under the menu it says "Signed in: Peter · Sign out".
  - **Using the screen keeps you signed in:** any click, key press or scroll restarts the 10 minutes.
  - After 8 quiet minutes a **"Still there?"** window counts down the **last 2:00**, with **Stay signed in** (another 10 minutes) and **Sign out**.
  - At 0:00 the PIN is forgotten and the page reloads empty, so customer details don't stay on the screen; a note says why. **Sign out** does the same at any time.
  - The PIN is kept only in that browser, only for those 10 minutes; the website still checks it on every action, as before.
- **Files:** new [site/src/components/StaffSession.astro](../site/src/components/StaffSession.astro), [site/src/components/StaffNav.astro](../site/src/components/StaffNav.astro), [site/src/pages/counter/index.astro](../site/src/pages/counter/index.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts)
- **How to check it:** `git pull`, refresh, type the PIN once, then move between counter pages.

## 2026-11-25 12:00 CST · Fulfillment, Batch and Claims off the menu; Fulfillment noted for later (P21)

- **Asked for:** "lets just keep fulfillment in the background but turned off. keep it in the notes because currently the storefront doesnt have the space to hold other people's items currently".
- **What changed:**
  - **Fulfillment** is off the staff menu (the page still works at `/counter/fulfillment`), and the new to-do **P21** says what it is and what's needed to turn it on: shelf space, PeterShip making labels, the fees.
  - **Batch** and **Claims** are off the menu too: both work on labels bought through PeterShip, and the store's labels come from GP Rate Pro. Their pages still work by address.
  - The **Shipping** dropdown had nothing left, so it's hidden. The menu is now **Counter · Mailboxes · Customers · Store**. A group shows again by itself when one of its lines is put back in `site/src/data/staffNav.ts`.
- **Files:** [site/src/data/staffNav.ts](../site/src/data/staffNav.ts), [site/src/components/StaffNav.astro](../site/src/components/StaffNav.astro), [site/src/pages/counter/index.astro](../site/src/pages/counter/index.astro), [TODO.md](TODO.md)

## 2026-11-25 11:57 CST · Queue, Pickups and Scan a QR taken off the staff menu

- **Asked for:** "lets take out queue, pickups, scan a qr."
- **What changed:** those three are no longer in the Shipping dropdown or on the counter home page. Shipping now has Batch, Fulfillment and Claims. The pages still work at their addresses (`/counter/queue`, `/counter/pickups`, `/counter/scan`) and nothing on them was deleted; each comes back by un-commenting its line in `site/src/data/staffNav.ts`.
- **Files:** [site/src/data/staffNav.ts](../site/src/data/staffNav.ts)

## 2026-11-25 11:51 CST · Exceptions taken off the staff menu

- **Asked for:** "how would we incorporate the exceptions tab?", then (GP Rate Pro doesn't alert on problem packages, but exporting its list every day would be a chore, customers sign a liability waiver, and calling customers about delays is one more thing to handle) "so lets take it out".
- **What changed:** **Exceptions** is no longer in the Shipping dropdown or on the counter home page. It only watches labels made through PeterShip, and the store makes labels in GP Rate Pro, so it was always empty. The page still opens at `/counter/exceptions` and fills by itself if PeterShip ever makes the store's labels; to show it again, un-comment one line in `site/src/data/staffNav.ts`.
- **Files:** [site/src/data/staffNav.ts](../site/src/data/staffNav.ts)

## 2026-11-25 11:41 CST · Drop-offs taken off the staff menu (GP Rate Pro already does it)

- **Asked for:** "whats the thought process of having the dropoff tab?", then "currently our gpratepro.. does a scan for us and gives them a receipt of time. we also keep track of everything.. so it might be not needed".
- **What changed:** **Drop-offs** is no longer in the Shipping dropdown or on the counter home page, so staff don't scan the same package in two places. The page and anything recorded on it are untouched and it still opens at `/counter/dropoff`. To bring it back (say, if PeterShip replaces GP Rate Pro), un-comment one line in `site/src/data/staffNav.ts`.
- **Files:** [site/src/data/staffNav.ts](../site/src/data/staffNav.ts)

## 2026-11-25 11:32 CST · To-do: security check-up (P20, the headless Shopify question), printing on hold for suppliers, prices note

- **Asked for:** "add to the checklist. a buddy of mine said to possibly integrate with headless shopify to have their backend security features so we dont get hacked and such.. would like your input on whether thats needed or just extra stuff", "lets hold off on the business cards until i find the right supplier", "possibly hold out on the mailbox prices. but im thinking im going to raise either the virtual mailboxes or physical mailbox prices", and "i want to get into finding suppliers".
- **What changed (to-do list only, nothing on the website):**
  - **New P20, Website security check-up.** Headless Shopify isn't needed: it would only protect what Shopify itself holds, while the parts worth protecting here are the staff pages, IDs and keys, and cards already go through Stripe. The list of steps that do help: a Cloudflare sign-in wall in front of the staff pages, personal PINs, limiting PIN guesses, 2FA everywhere, firewall rules, backups, a code security review.
  - **P7 (business cards) on hold** until a supplier is chosen; **P9 (suppliers) is next**, and "Start here next time" points to it.
  - **P14:** Peter may raise virtual or physical prices; virtual prices are set in Anytime Mailbox's dashboard, physical in one website file.
- **Files:** [TODO.md](TODO.md)

## 2026-11-25 11:31 CST · A card on file is required before any wall box starts (to-do P15)

- **Asked for:** "I think card on file needs to 100% always be there before a mailbox starts. especially for physical. anytime mailbox already collects their info".
- **What changed:**
  - **Assign** (Counter → Mailboxes) is refused unless the customer has a saved credit or debit card. No exceptions. They can still pay cash; the card covers renewals and fees. Virtual mailboxes aren't affected (Anytime Mailbox collects their payment).
  - **Assign a box to an account:** after you pick the customer it shows "Card on file: VISA ••4242", or the reason Assign is greyed out, the agreement to tick, and **Add card (Stripe's secure page)**. When you come back from Stripe's page and type the PIN, the form fills itself back in (customer, box number, term) and Assign turns on.
  - The customer finder shows "No card on file." next to anyone without one.
  - **Online reservations:** each row shows the card, and **Add card** replaces **Assign** until there is one.
  - Automatic renewal can still be switched off in Edit for someone who wants to pay cash each time; the card stays on file for fees.
- **Files:** [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/mailbox.test.ts](../site/tests/mailbox.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev`, Counter → Mailboxes → **Assign a box to an account** → Find someone → Pick.

## 2026-11-25 11:28 CST · Who may pick up packages (physical and virtual boxes)

- **Asked for:** "adding a box in the and upload id section in the certain mailbox would be nice for who may pick up the packages.. would be nice to have it in the edit button to add. and then i can just search that persons name in the search to pop up that certain box for both virtual and physical mailbox side".
- **What changed:**
  - **Edit** on a wall box (Counter → Mailboxes) and **Edit** on a virtual customer (Counter → Virtual mail) have a new section, **Who may pick up packages**: their full name as on their ID, an optional relation (spouse, assistant…), **Add person**, and **Remove** on each.
  - It's a separate list from "Names allowed at this box" (the 1583 names mail may be addressed to).
  - **Search by their name** finds the box: Mail check on the Mailboxes page finds wall boxes and virtual customers, and the search on the Virtual mail tab finds virtual customers. The result shows "May pick up packages: Paula Pickup (sister)".
  - **Their ID:** Documents has a new kind, **Pickup person's ID**, to keep a copy under the holder (put their name in the note).
  - Every add and remove is in the audit log.
- **Files:** [site/db/schema.sql](../site/db/schema.sql) (new table `mailbox_pickups`), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/lib/mailboxDocs.ts](../site/src/lib/mailboxDocs.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), new [site/tests/pickups-people.test.ts](../site/tests/pickups-people.test.ts)
- **How to check it:** `git pull`, **`npm run db:local`** (one new table), `npm run dev`, then **Edit** on a box → **Who may pick up packages**.

## 2026-11-25 11:24 CST · The staff menu tidied: four dropdowns (to-do P19)

- **Asked for:** "lets go ahead and tidy up the menu" (P19: "this area looks alittle clunky").
- **What changed:**
  - The long "Staff: Queue · Batch · Fulfillment · …" line (19 links) is now **Counter** plus four dropdowns:
    - **Shipping**: Queue, Drop-offs, Pickups, Scan a QR, Batch, Fulfillment, Exceptions, Claims.
    - **Mailboxes**: Mailboxes, Virtual mail.
    - **Customers**: Customers, Accounts, Invoices.
    - **Store**: End of day, Reports, Prices, Staff, Settings, Export.
  - The group of the page you're on is dark blue, and the page itself is bold in its list. One dropdown opens at a time; clicking elsewhere or Escape closes it. On a phone the list opens full width under the buttons.
  - **Counter staff** (a personal counter PIN) don't see Prices, Staff, Settings or Export once they type their PIN; managers and owners see everything. Only the role is remembered for that browser tab, never the PIN. The pages still check the PIN themselves, as before. (The shared counter PIN counts as a manager when an owner PIN exists, so it still sees them.)
  - The counter home page lists the pages in the same four groups.
  - **One shared menu** now: adding a page is one line in `site/src/data/staffNav.ts` instead of editing 23 pages.
- **Files:** new [site/src/components/StaffNav.astro](../site/src/components/StaffNav.astro), new [site/src/data/staffNav.ts](../site/src/data/staffNav.ts), all 23 pages in `site/src/pages/counter/`, [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [CLAUDE.md](../CLAUDE.md)
- **How to check it:** `git pull`, refresh any counter page.

## 2026-11-24 16:18 CST · Deactivate and Delete at Anytime Mailbox switched on

- **Asked for:** Peter sent the docs for Deactivate Renter (`POST /renters/{renter_id}/deactivate`) and Delete Renter (`DELETE /renters/{renter_id}`), each answering `{ "success": true }`.
- **What changed:** those two addresses are now in `site/src/data/virtual.json`, so **Edit → Danger zone → Deactivate at Anytime Mailbox** (manager or owner PIN) and **Delete at Anytime Mailbox** (owner PIN only) really change the account at Anytime Mailbox, after the look-up and the box number typed to confirm. Everything else about them is as before (audited, closed here with a note, nothing erased on the website).
- **Files:** [site/src/data/virtual.json](../site/src/data/virtual.json), [site/tests/anytime-danger.test.ts](../site/tests/anytime-danger.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, refresh Virtual mail, owner PIN, **Edit** on a renter that really should be deactivated or deleted, red **Danger zone**. Try it first on one you're sure about.

## 2026-11-23 18:19 CST · Mail check finds virtual boxes by number ("104" finds "Mailbox 104")

- **Asked for:** "can you make it where if im in the physical mailbox side. in the 'mail check' i want to be able to check for virtual mailbox owners as well".
- **Why it didn't work:** Mail check already searched virtual customers, but only matched when the box name *started with* what you typed. Anytime Mailbox names boxes "Mailbox 104", so typing `104` found nothing.
- **What changed:** Mail check on Counter → Mailboxes, and the search on Counter → Virtual mail, now match the number inside a virtual box's name: `104`, `#104`, `Mailbox 104` or the start of the number all find it (a leading Mailbox / Box / PMB / Suite / Unit is ignored). Names, business names, email and phone still work. Virtual results still show their service, their ID hold if any, and a link to the Virtual mail tab.
- **Files:** [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts) (`vnoShort`, `vnoMatches`), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/tests/virtual.test.ts](../site/tests/virtual.test.ts)
- **How to check it:** `git pull`, refresh Counter → Mailboxes, type `104` in Mail check.

## 2026-11-23 17:09 CST · "IDs to update" scrolls inside its own box (virtual and physical)

- **Asked for:** "also in the 'Ids to update' section, we need a scroll feature in that section".
- **What changed:** both **IDs to update** lists, on Counter → Virtual mail and on Counter → Mailboxes, sit in their own box (about half the screen tall) that scrolls inside, so a long list doesn't stretch the page. On the Virtual mail tab, a style mix-up had let the customer list's taller size win; that's fixed too.
- **Files:** [site/src/styles/global.css](../site/src/styles/global.css), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro)
- **How to check it:** `git pull`, refresh either page, scroll inside IDs to update.

## 2026-11-23 17:07 CST · "IDs to update" on the Virtual mail tab

- **Asked for:** "can you make a section in the virtual mailboxes similar to the physical boxes. section like 'IDs to update'".
- **What changed:** Counter → Virtual mail has its own **IDs to update** card, under the customer list (in its own scrolling box):
  - Each customer whose photo ID **has expired** (first, with ID HOLD / suspended and the red HOLD MAIL) or **expires within 30 days**, soonest first.
  - On each: **Remind** (sends their ID text and email now), **Documents**, and a date box with **Save new ID date** for when they bring a current ID. For an expired one, tick "I checked this ID in person" to reinstate them.
  - At the bottom: "Also on hold: N waiting on verification at Anytime Mailbox (no ID date yet)", with **Show only them**, which filters the list above to those customers.
  - The automatic ID texts and emails keep going out on their own, as before.
- **Files:** [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts)
- **How to check it:** `git pull`, refresh Counter → Virtual mail, scroll below the customer list.

## 2026-11-23 14:05 CST · Virtual customers without an ID date are on HOLD MAIL (unverified renters)

- **Asked for:** "renters would be 'assigned' to a box. but they didn't fully finish the whole verification process. does the api even allow us to see whats not verified or not?" (the red ⚠ in Anytime Mailbox's dashboard), then Retrieve Renter's fields, then "would hae to go with option 1. one by one".
- **The answer:** no. List Renters, Retrieve Renter and List Mailboxes have no verification field (only active / inactive / deleted and assigned / pending-assignment). The ⚠ is only in their dashboard.
- **What changed:**
  - A virtual customer with **no ID date** now shows the red **HOLD MAIL: "No verified ID on file. Don't scan or forward their mail in Anytime Mailbox; keep it behind the counter. Type their ID date once Anytime Mailbox shows them verified (no ⚠)."**, on the Virtual mail tab and in **Mail check**.
  - Typing their ID date (once the ⚠ is gone in Anytime Mailbox) takes them off hold right away.
  - The bar at the top now reads "N customers are on HOLD MAIL until their ID date is typed in", with **Show only them**.
  - **One by one:** after **Save ID date**, the cursor jumps to the next customer still waiting, ready to type the next date.
- **Files:** [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts)
- **How to check it:** `git pull`, refresh Virtual mail → **Show only them** → with Anytime Mailbox's dashboard open, type a date for each one without a ⚠ and press **Save ID date** (or Enter on the button); leave the ⚠ ones as they are.

## 2026-11-23 13:59 CST · Check at Anytime Mailbox shows more about their box list

- **Asked for:** Peter's Check of "Mailbox 104": renter "active", box assigned Aug 5 2026, box status "(not given)".
- **What that means:** going by the renter's details, Anytime Mailbox's API calls 104 active and set up. The box-status list was read but had no box named exactly "Mailbox 104", so the one field that may say it isn't active never got looked at.
- **What changed:** Check now also shows how many boxes that list returned and how many of each status, the first few box names in it (to see how they're written there), and any box in it with the same number or the same renter. Still read only.
- **Files:** [site/src/lib/anytime.ts](../site/src/lib/anytime.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/tests/anytime.test.ts](../site/tests/anytime.test.ts)
- **How to check it:** `git pull`, refresh, **Edit** on 104, **Check** again.

## 2026-11-23 13:56 CST · "Check at Anytime Mailbox" button in Edit (to find out why box 104 wasn't flagged)

- **Asked for:** "dont tink it works the way im intending too.. because mailbox number 104 isnt a active renter".
- **What changed:** Edit now has a **Check #104 at Anytime Mailbox** button (any staff PIN, read only). It shows exactly what Anytime Mailbox's API says about that box: every renter who has it (their number, status and the date the box was assigned, deleted renters included), the box's own status, and in plain words what Sync decides from that. Nothing changes anywhere.
- **Why:** Sync goes by what the API says. If box 104 isn't active in Anytime Mailbox's dashboard but the API still calls it active and assigned, Sync needs a different rule. This button shows which field tells them apart.
- **Files:** [site/src/lib/anytime.ts](../site/src/lib/anytime.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts) (`renter_check`), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/anytime.test.ts](../site/tests/anytime.test.ts)
- **How to check it:** `git pull`, refresh Virtual mail, **Edit** on #104, **Check #104 at Anytime Mailbox**.

## 2026-11-23 13:51 CST · Sync brings in only verified renters; Close all for the ones already imported

- **Asked for:** "why did you import renters that arent even active?..", then "well im going one by one per renter.. its already happened to like 2-3 renters.. i could only imagine how many others arent active.. fix this for me.. its annoying".
- **Why it happened:** Anytime Mailbox's API calls a renter "active" as soon as they sign up, even before they're verified. Sync trusted that word.
- **What changed:**
  - Sync now also reads **every box's status** at Anytime Mailbox (List Mailboxes). A renter only counts when their box is **assigned** (verified and set up). A box that is still **pending-assignment** doesn't count. If box statuses can't be read, Sync uses whether the box has an assigned date instead, and says so next to the totals.
  - **Signed up but not verified yet** renters go in their own folded group, "Signed up at Anytime Mailbox but not verified yet: not added (N)". They're never in **Add all**.
  - **The ones already imported** show at the top: "Not verified at Anytime Mailbox, open here (N)", with **Close all N on our list** (and a Close button on each). That closes them on the website only; nothing changes at Anytime Mailbox. Once they're verified there, the next Sync offers them again.
  - The List Mailboxes path wasn't in the screenshots; the site uses `/mailboxes` (`mailboxes_path` in `virtual.json`). If it's different, Sync still works using the assigned dates.
- **Files:** [site/src/lib/anytime.ts](../site/src/lib/anytime.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/data/virtual.json](../site/src/data/virtual.json), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/anytime.test.ts](../site/tests/anytime.test.ts)
- **How to check it:** `git pull`, `npm run dev`, Virtual mail → **Sync now** → **Close all N on our list** at the top.

## 2026-11-23 13:42 CST · Virtual mailboxes list scrolls inside its own box

- **Asked for:** "i dont like how when i have 80 customers in my virtual mailboxes and it flooded my whole page. can you make it contained in the virtual mailbox area and has a scroll feature?"
- **What changed:** on Counter → Virtual mail, the customer list sits in its own box (about two-thirds of the screen tall) that scrolls inside, so the page below it (Add someone by hand, Connection) stays close. Search, Sync and the yellow "no ID date" bar stay above the box. Nothing else changed.
- **Files:** [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev`, Counter → Virtual mail, scroll inside the list.

## 2026-11-23 13:21 CST · Deactivate or delete at Anytime Mailbox, from Edit → Danger zone

- **Asked for:** "if i close the account on the website.. would it actualyl close the account in anytime mailbox?" (no, it only read from them), then "yes, but I want it to be little harder to close their account.. possibly add it in the edit button with like more of a heads up if someone presses it. it'll delete on the anytime mailbox side / i also want to add a delete option as well because one of the nonverified renters happened to not be a active", and "yes" to owners only for Delete, owners and managers for Deactivate.
- **What changed:**
  - **Close is off the list row.** Each row keeps Edit and Documents; a closed one still has Reopen.
  - **Edit → Danger zone** (red box under the form; only for a manager or owner PIN, only for an open customer):
    - **Close on our list only**: like the old Close; nothing changes at Anytime Mailbox.
    - **Deactivate at Anytime Mailbox** (manager or owner): stops their account there and closes them here.
    - **Delete at Anytime Mailbox** (owner only): for sign-ups that never got verified. Removes their account there; they stay on our list as closed.
  - **The heads-up:** the site first looks them up at Anytime Mailbox and shows exactly who it will change (renter number, name, boxes, status). **Yes, do it** stays grey until you **type their mailbox number**. If their account changed in between, it stops.
  - **Records:** the audit log gets who, when and which renter; their row gets a note like "Deactivated at Anytime Mailbox 2026-11-23 by Peter". Nothing is erased on the website; ID dates and documents stay.
  - **Waiting on one thing:** the exact Deactivate Renter and Delete Renter addresses from their docs. Until those are in `site/src/data/virtual.json`, both buttons say they're waiting and **send nothing**.
  - **Note on PINs:** the shared counter PIN (1234) counts as a manager once an owner PIN exists (how the PINs already work), so it can Deactivate but never Delete. Personal counter PINs on the Staff page can't do either.
- **Files:** [site/src/lib/anytime.ts](../site/src/lib/anytime.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/data/virtual.json](../site/src/data/virtual.json), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/anytime-danger.test.ts](../site/tests/anytime-danger.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev`, Virtual mail with the owner PIN → **Edit** on someone → scroll to the red **Danger zone**. Until the paths are added, the buttons only say what they're waiting on.

## 2026-11-19 15:51 CST · Virtual customers: ID date without uploading, a "no ID date" reminder, and Add by hand folded away

- **Asked for:** "is there anyway i can grab all the renters info? because now when i add the renter to my list.. i gotta reupload their documents..", then "well im going to have to remember to input the renters id to the website..", then "seems like this website tool would only serve as a find a mailbox finder and lets me know if its expired or not. so i wont need add a virtual mailbox owner at the top i believe?"
- **The answer on documents:** Anytime Mailbox's API has no documents or ID dates (only renters and mailboxes), so they can't be pulled in. They don't need to be: Anytime Mailbox keeps the verified IDs and 1583. The website only needs **the date the ID expires**.
- **What changed:**
  - **Type the ID date right in the customer's row:** a date box and **Save ID date**, no file. It's saved as "Photo ID · On file at Anytime Mailbox" with that date, and every ID rule works from it (expiring badge, ID HOLD and HOLD MAIL, suspension, IDs to update, Remind, the automatic texts and emails). For someone on hold, the row also has the "I checked this ID in person" box, as reinstating needs.
  - **The reminder, so nobody has to remember:** a yellow bar at the top of the list, "42 customers have no ID date yet…", with **Show only them** to work through the list. Each of them has a yellow **NO ID DATE** badge, on this tab and in **Mail check**.
  - **Add a virtual customer** is now folded near the bottom as **Add someone by hand**, since Sync brings customers in. **Edit** opens it when needed. The page now starts with Sync and the list.
  - Uploading a scan in Documents still works if you ever want one.
- **Files:** [site/src/pages/api/mailbox-docs.ts](../site/src/pages/api/mailbox-docs.ts) (`add_date`), [site/src/components/MailboxDocs.astro](../site/src/components/MailboxDocs.astro), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/virtual-ids.test.ts](../site/tests/virtual-ids.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev` (no new tables). Virtual mail → **Sync now** → **Add all** → the yellow bar → **Show only them** → type a date → **Save ID date**.

## 2026-11-19 15:47 CST · Sync results: grouped, folded and in a scrolling box; Add all

- **Asked for:** "sync works. but after i hit sync.. it seems to blow up my whole page with all the active renters haha".
- **What changed:**
  - Sync results sit in **one box that scrolls inside**, so the page doesn't grow.
  - They're **grouped**: Different details, Inactive at Anytime Mailbox, Active there but closed here, **Not on our list**, Not found at Anytime Mailbox, each with a count. Groups fold open and shut; a long "Not on our list" starts folded.
  - **Add all N to our list** (with a confirm) brings every new renter in at once. Any that can't be added (say, a number that's a wall box) show the reason on their row.
  - **Hide** clears the results.
- **Files:** [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts)
- **How to check it:** `git pull`, `npm run dev`, Virtual mail → **Sync now with Anytime Mailbox**.

## 2026-11-19 15:39 CST · Anytime Mailbox: Test the key, and Sync now (read only)

- **Asked for:** "can i try testing things from anytime renters?", then Anytime Mailbox's API docs as screenshots: the address and Bearer sign-in, List Renters (with its example response), List Renter Mailboxes, Retrieve Renter, List Authorized Recipient.
- **What changed:**
  - The site now knows where Anytime Mailbox's API is (`https://connect.anytimemailbox.com/v1`, saved in `site/src/data/virtual.json`).
  - **Test** (in the Connection card) really tries the key: "The key works: Anytime Mailbox answered", or "Anytime Mailbox refused the key", or, if the List Renters path is wrong, a note to send Claude the path from their docs.
  - **Sync now with Anytime Mailbox** (top of the Virtual mailboxes list, once a key is saved) reads all your active and inactive renters, 100 at a time, and lines them up with the hand-kept list by mailbox name ("A103"). It **only reads**: nothing changes at Anytime Mailbox. It shows:
    - **NOT ON OUR LIST** → **Add to our list** (name, email, phone, company as an allowed name).
    - **DIFFERENT: Phone** (ours → theirs) → **Use theirs**.
    - **INACTIVE AT Anytime Mailbox, still open here** → **Close**.
    - **ACTIVE AT Anytime Mailbox, closed here** → **Reopen**.
    - **NOT FOUND AT Anytime Mailbox** → check their dashboard (no button).
    - Matching customers are just counted ("3 renters read · 1 match our list · 2 to look at").
  - Every button uses the same Add / Edit / Close as by hand, so the usual checks (never a wall box number, no duplicates) still apply. Nothing is changed unless you press a button.
  - The path for List Renters wasn't on the screenshots; the site uses `/renters`, the usual one. If Test says the address was wrong, it's a one-line fix (`renters_path`).
- **Files:** new [site/src/lib/anytime.ts](../site/src/lib/anytime.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/data/virtual.json](../site/src/data/virtual.json), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/anytime.test.ts](../site/tests/anytime.test.ts), [site/tests/service-keys.test.ts](../site/tests/service-keys.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev` (no new tables). Counter → Virtual mail, owner PIN, paste the new key at the bottom, **Save key**, **Test**, then **Sync now with Anytime Mailbox** at the top of the list.

## 2026-11-19 15:26 CST · Virtual mail: the Connection card (API key) moved to the bottom

- **Asked for:** "alright lets put that api key connection area at the very bottom of the page".
- **What changed:** on Counter → Virtual mail, the **Connection** card (the Operator API key box) is now the last card, under the virtual mailboxes list. Add a virtual customer and the list come first. Nothing else changed.
- **Files:** [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro)
- **How to check it:** `git pull`, `npm run dev`, Counter → Virtual mail, scroll to the bottom.

## 2026-11-19 15:22 CST · Paste the Anytime Mailbox key on the website (owner PIN only)

- **Asked for:** "wouldnt it be better i input the api key on the website just so its easier to transfer ownership or something?", then "yes lets build it.. i already put it in the notepad dev.. but i think its better to be able to attach on the website".
- **What changed:**
  - **Counter → Virtual mail → Anytime Mailbox → Connection** now has an **Operator API key** box with **Save key**, **Test** and **Remove key**. Only an **owner PIN** sees the box. Counter staff see only whether a key is saved.
  - **The key is locked** (encrypted, like the ID photos) before it's saved, and the website never shows it again, only "ends in ABCD", who saved it and when. It isn't in the Export page or the audit log; the log only says "API key saved".
  - **A key in `.dev.vars` or on Cloudflare** (`ANYTIME_API_KEY`) is used first, and the box then says "Key set on the server". To use the website box instead, delete that line from `.dev.vars`.
  - **Test** says what's still missing: Anytime Mailbox's API address from their documentation (to-do P18). Once that's added, the same button will really try the key.
  - On the live site, keys can only be saved once William has set `DOCS_KEY` (the same lock as the ID photos).
  - Any future virtual mailbox service gets its own key box on its own tab.
- **Files:** new [site/src/lib/serviceKeys.ts](../site/src/lib/serviceKeys.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/data/virtual.json](../site/src/data/virtual.json) (`api_base`, empty until their docs), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/service-keys.test.ts](../site/tests/service-keys.test.ts), [site/tests/virtual.test.ts](../site/tests/virtual.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev` (no new tables). Delete the `ANYTIME_API_KEY=` line from `.dev.vars` and restart `npm run dev`, then Counter → Virtual mail, load with the **owner PIN (9999)**, paste the new key, **Save key**.

## 2026-11-19 14:28 CST · Virtual customers: ID dates, ID hold and HOLD MAIL; Anytime Mailbox API plan in P18

- **Asked for:** "i suppose it doesnt hurt to have the functionality there in item 5 / because i want to start tracking their id's and expirations.. and i want to know whether i should be holding their mail or not" (after the Anytime Mailbox API screenshots).
- **What changed:**
  - **Documents for every virtual customer**, even without a website account. Each row on the Anytime Mailbox tab has a **Documents** button with a count, e.g. "Documents (1)", for their photo ID (with its expiration date) and 1583.
  - **The same ID rules as wall boxes:** a yellow badge when the ID expires within 30 days; when it has expired, a red **ID HOLD** badge and a red **HOLD MAIL** block: "Don't scan or forward their mail in Anytime Mailbox. Keep it behind the counter until they bring a current ID." After 30 days the badge says suspended. They're reinstated only by a new ID checked in person, with a future date.
  - **Mail check** shows the red HOLD MAIL block for a virtual customer on hold, instead of "scan it in their app".
  - **IDs to update** on the Mailboxes page includes virtual customers ("Anytime Mailbox #4521 · name"), with the **Remind** button. The automatic 30-day, expired and suspended texts and emails go to them too.
  - **Linking a website account later** moves the documents onto the account, so nothing is lost.
  - **To-do P18** now lists what the Anytime Mailbox API can do for us (create renters, assign boxes, authorized recipients, activate and deactivate, a Sync button) and what's needed first: their API docs (web address and how it signs in).
- **Files:** [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/api/mailbox-docs.ts](../site/src/pages/api/mailbox-docs.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), new [site/tests/virtual-ids.test.ts](../site/tests/virtual-ids.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev` (no new tables, so no `db:local` this time). Counter → Virtual mail → **Documents** on a customer → upload a photo ID with a past expiration date → the row turns red with HOLD MAIL; Mail check by their number shows the same.

## 2026-11-19 13:27 CST · Virtual mail: one tab per service, starting with Anytime Mailbox; to-do P19

- **Asked for:** "im going to possibly add other virtual mailbox applications.. so lets make this tab for 'Anytime Mailbox' ... in the virtual tab section. i want another tab labeled 'Anytime Mailbox'", then "this area looks alittle clunky.. i feel some arent needed here. add to the todo list to clean this up" (the staff menu line).
- **What changed:**
  - **Counter → Virtual mail** now has a **tab per service**. The first is **Anytime Mailbox**, showing how many open customers it has, e.g. "Anytime Mailbox (2)". Each tab has its own connection card, add form ("Anytime Mailbox #"), and list.
  - **Adding another service later** is one line in `site/src/data/virtual.json` (an id and a name); its tab appears by itself.
  - Customers already entered belong to Anytime Mailbox. The same number can be used by two different services, but not twice in one.
  - **Mail check** names the service: "Anytime Mailbox #4521 · ... ANYTIME MAILBOX: scan it in their app, not a wall box", and its button opens that service's tab.
  - **To-do P19:** tidy up the staff menu (group the 20 links, hide by role, one shared menu).
- **Files:** new [site/src/data/virtual.json](../site/src/data/virtual.json), [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql) (new table `virtual_mailbox_providers`), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/virtual.test.ts](../site/tests/virtual.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, **`npm run db:local`** (one new table), `npm run dev`, then Counter → **Virtual mail**.

## 2026-11-19 13:13 CST · Virtual mail tab (Anytime Mailbox), and Mail check searching it

- **Asked for:** "do you think its better to have 'Anytime Mailbox' as its own tab or incorporate with the physical boxes tab?" (its own tab, with one shared Mail check), then "lets go ahead and add it right now and start".
- **What changed:**
  - A new staff page, **Counter → Virtual mail** (in the staff menu on every counter page, after Mailboxes), for customers whose mail service runs on **Anytime Mailbox**.
  - **Add a virtual customer:** their Anytime Mailbox #, name, email, phone, other names allowed (family, business; one per line), a note, and optionally their **website account** (so **Documents** works for their IDs and 1583). **Edit**, **Close** (with a reminder to close it in Anytime Mailbox too) and **Reopen**; a search box over the list.
  - **Never a wall box number:** a virtual number inside a wall box range (1100–1220, 1221–1284, 1300–1323) is refused, and two open virtual mailboxes can't share a number.
  - **Mail check** on the Mailboxes page now searches virtual customers too (number, name, business name, email or phone) and shows them in blue: **"ANYTIME MAILBOX: scan it in their app, not a wall box"**, with a button to the Virtual mail page. A closed one says to return it to sender.
  - A **Connection** card says what's still waiting on Anytime Mailbox: API access and a key, and permission to show their logo (to-do P18). Until then the list is kept by hand. No logo is shown yet.
  - Every add, edit, close and reopen is in the activity log, and the list is in Export.
- **Files:** new [site/src/pages/counter/virtual.astro](../site/src/pages/counter/virtual.astro), new [site/src/pages/api/virtual.ts](../site/src/pages/api/virtual.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), the staff menu line in every counter page and [site/src/pages/counter/index.astro](../site/src/pages/counter/index.astro), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql) (new table `virtual_mailboxes`), [site/src/env.d.ts](../site/src/env.d.ts) (`ANYTIME_API_KEY`, for later), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/virtual.test.ts](../site/tests/virtual.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, **`npm run db:local`** (one new table), `npm run dev`. Open **Virtual mail** in the staff menu (PIN 1234), add a customer, then search their name in **Mail check** on the Mailboxes page.

## 2026-11-19 12:48 CST · Reminder: Anytime Mailbox API and logo (to-do P18)

- **Asked for:** "when i get back to coding again. remind me to add 'Anytime Mailbox' Api and their logo on the website"
- **What changed:** new to-do **P18**, marked "Next coding session", plus a **"Start here next time"** line at the top of [TODO.md](TODO.md). It lists what to get from Anytime Mailbox first (whether they have an operator API and a key, permission and an official logo file, our sign-up link) and what to build after. Nothing changed on the website.
- **Files:** [TODO.md](TODO.md)

## 2026-11-18 12:57 CST · A more eye-catching Services section on the home page

- **Asked for:** "can you edit the services page to make it more enticing or eye catching for the customers of what we can do"
- **What changed:**
  - A bolder heading, **"Everything you need, in one stop"**, with a line under it.
  - **Shipping, Mailboxes and Printing** are now feature cards: a colored icon, three check-mark selling points, and a big button (**Ship a package**, **Reserve a mailbox**, **See printing**). Shipping has a **Most popular** tag.
  - **Packing, Returns drop-off, Notary and Shredding** are compact cards, two per row, each with an icon and a quick action: **Get directions** (opens Google Maps) or, for Notary, **Call ahead** (dials the store).
  - A navy strip at the bottom: **"Not sure we can help? Just ask."** with the phone number to tap.
  - In all 14 languages.
- **Fixed:** the Returns drop-off card linked to a `/returns` page that doesn't exist (customers got "page not found"); it now offers directions. The Mailbox rental text still said "Sign up at the counter with two IDs" in the translations; it now says to reserve online, then finish at the counter.
- **Files:** new [site/src/components/ServicesShowcase.astro](../site/src/components/ServicesShowcase.astro), [site/src/pages/index.astro](../site/src/pages/index.astro), [site/src/data/store.ts](../site/src/data/store.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev`, open the home page and scroll to Services.

## 2026-11-18 12:44 CST · Remind button for expiring and expired IDs

- **Asked for:** "yes lets add those remind buttons so i can send one manually"
- **What changed:** Each row in **IDs to update** (Counter → Mailboxes) has a **Remind** button. It sends that holder the right message now, by text and email: "expires soon" (with the warning that mail will be held), "expired: mail held at the counter" (with the suspension date), or "account suspended". It says how it went ("ID reminder sent to Nina Names (text + email)"), can be pressed again, and is in the activity log. The daily run and the button use the same words. **Send due reminders** now also sends any ID notices that are due, so they can be tried on your computer.
- **Files:** [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/mailbox-ids.test.ts](../site/tests/mailbox-ids.test.ts)
- **How to check it:** `git pull`, `npm run dev`, then **Remind** on a row in **IDs to update**; the text and email show in PowerShell as `[mock sms]` and `[mock email]`.

## 2026-11-18 12:24 CST · Key deposit: Paid / Unpaid for each renter

- **Asked for:** "also for each renter. add a Key deposit paid or unpaid button"
- **What changed:** Every box in **Boxes on the website** (Counter → Mailboxes) has a **Key deposit** button: green **Paid** or red **Unpaid** (new boxes start Unpaid). One tap switches it after "Mark the key deposit for box #1100 (Carla Checkin) as PAID?". Hovering shows who changed it and when; the **Edit** window shows the same button with "changed by ..., date". Every change is in the activity log.
- **Files:** [site/db/schema.sql](../site/db/schema.sql) (new table `mailbox_keys`), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox-ids.test.ts](../site/tests/mailbox-ids.test.ts), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, **`npm run db:local`** (one new table), `npm run dev`, then the **Key deposit** button on any box.

## 2026-11-18 12:22 CST · Red HOLD MAIL on IDs to update and in Check in

- **Asked for:** "maybe its smart to have in 'ID's to update' to have in red Hold mail so it'll prevent the renter to go in and get their mail"
- **What changed:** For anyone on ID hold or suspended, **IDs to update** now shows a red **HOLD MAIL** block: "Don't put mail in box #1102. Keep it behind the counter until they bring a current ID. 2 letters are still in the box: take them out." The same red block shows in the **Check in** window when that box is picked. The ID-hold badge is now red everywhere (it was orange).
- **Files:** [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev`; a box whose photo ID has expired shows the red block under **IDs to update**.

## 2026-11-18 12:01 CST · ID hold, suspension, and reinstating with an ID checked in person

- **Asked for:** "remind them that their id is about to expire, if they dont renew, we can hold their mail until they renew ... keep track of that certain customer ... maybe 30 or 60 days their account is going to be considered expired. we'll still take their money which they will have to agree to it.. they'll have to renew their id and come into the building for us to verify the id and reinstate their account".
- **What changed** (goes by each holder's newest photo ID on file):
  - **30 days before** it expires, the text and email now also say: "If it expires first, we'll hold your mail and packages at the counter until you do."
  - **The day it expires: ID hold.** An orange **ID HOLD: keep at the counter** badge shows in the box list, Mail check, the Check in window and the Edit window. The holder gets a text and email saying their mail is held and the date their account will be suspended.
  - **30 days later: suspended.** The badge turns red (**SUSPENDED: ID needed**); mail is still held; billing continues as their agreement says; the holder and staff get a notice. The 30 is `id_grace_days` in `site/src/data/mailboxes.json` (change it to 60 if you like).
  - **Reinstating:** in **Documents**, a red note explains what to do. Staff upload the new photo ID with its expiration date and tick **"I checked this ID in person (the customer is here)"**. Without the tick, or without a future date, the upload is refused. Then "Reinstated: their mail can go in the box again." The badge disappears and the activity log records who checked it.
  - The customer's **dashboard** shows the matching notice (expiring, held, or suspended).
  - An old ID no longer counts once a newer one is on file (no more reminders for the old one, and it drops off **IDs to update**).
- **Files:** [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/pages/api/mailbox-docs.ts](../site/src/pages/api/mailbox-docs.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/components/MailboxDocs.astro](../site/src/components/MailboxDocs.astro), [site/src/components/MailboxDashboard.astro](../site/src/components/MailboxDashboard.astro), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox-ids.test.ts](../site/tests/mailbox-ids.test.ts), [TODO.md](TODO.md)
- **How to check it:** `git pull`, `npm run dev`. In a box's **Documents**, upload a photo ID with an expiration date a few days in the past: the box shows **ID HOLD**. Upload a new one with a future date: refused until you tick the in-person box, then reinstated.

## 2026-11-18 11:44 CST · ID expiration dates, names allowed at each box, and to-do P17

- **Asked for:** "is there anything else i can add or need to worry about about my mailbox service" (the list is now to-do P17), then "yes. we should add for the id portion to input like expiration date so we can start keeping track of their expiration date".
- **What changed:**
  - **Documents:** a **date box for when an ID expires**, on upload or later (**Add date** / **Save date** on each document). Each one shows "Expires 2029-03-04", yellow within 30 days, red **EXPIRED** after.
  - **IDs to update** (Counter → Mailboxes): every holder whose ID on file expires within 30 days or has expired, with their **Documents** button.
  - **Reminders:** the holder gets a text and email 30 days before ("please bring the new one by") and once after it expires; staff get the list by email (`STAFF_EMAIL`). Each goes out once; a new date starts over. Runs every morning on the live site.
  - **Names allowed at this box** (Edit window): the holder, plus anyone you add from their PS Form 1583 (person or business), with Remove. **Mail check** and the **Check in** search find the box by any of those names, and show "Also: ..." so staff know a business or family name belongs there.
- **Files:** [site/db/schema.sql](../site/db/schema.sql), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/worker.ts](../site/src/worker.ts), [site/src/pages/api/mailbox-docs.ts](../site/src/pages/api/mailbox-docs.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/components/MailboxDocs.astro](../site/src/components/MailboxDocs.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-ids.test.ts](../site/tests/mailbox-ids.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, **`npm run db:local`** (two new tables), `npm run dev`. On `/counter/mailboxes`, open a box's **Documents**, upload a photo with an expiry date a few days away: it shows in **IDs to update**. In **Edit**, add a business name, then search it in **Mail check**.

## 2026-11-18 11:06 CST · To-do P16: store domain, email, and checking in mail by email

- **Asked for:** "yes add to do list" (after talking through checking mail in by email, the way MetroFax turns an email into a fax: `1105@monroegoinpostal.com`).
- **What changed:** new to-do **P16**: ask Goin' Postal corporate whether franchisees get a store email or domain and whether "Goin' Postal" can be in our own domain; then the domain on Cloudflare with free Email Routing (box numbers to the website, everything else forwarded to Peter's Gmail); a Gmail for the copier's Scan to Email; the list of senders allowed to check mail in; and the build. Nothing changed on the website.
- **Files:** [TODO.md](TODO.md)
- **How to check it:** open `peter/TODO.md` and look for P16.

## 2026-11-18 10:50 CST · "Check in mail or package" window, and Mail check at the top

- **Asked for:** "this is a little confusing.. can we make it where if a piece of mail/package comes in. where we click like a button 'Check in Mail or Package' pops up a window with a list of mailboxes or we can search then we click the box number, then have a add mail piece or package", and "[Mail check] needs to be at the very top for staff to quickly check if the piece of mail is something we can check in or not".
- **What changed** on Counter → Mailboxes:
  - **Mail check is first** (right under the PIN), so staff look up a name or box number before anything else. Each result for an open box has a **Check in** button that opens the check-in window on that box.
  - **Mail in** is now one big button, **Check in mail or package**. It opens a window with **every box** (number, name, size, letters and packages in it now; boxes on mail hold in yellow, return-to-sender in red) and a **search** box (a number or a name; Enter picks the first match).
  - **Tap a box** and the window shows that customer, with big **+ Letter** and **+ Package** buttons, the **📷 Photo** button and a note. The "is it empty?" question and the fee warnings appear here as before. **Added this time** lists each piece with its own **Undo**. **← Another box** goes back to the list; **Done** closes it.
- **Files:** [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css)
- **How to check it:** `git pull`, `npm run dev`, `/counter/mailboxes` (PIN 1234): press **Check in mail or package**, type a name, tap the box, then **+ Letter**.

## 2026-11-16 21:06 CST · Mailbox report on the Reports page, Choose a box, Move/Remove a piece, and Check these boxes always showing

- **Asked for:** "Yes add to the reports page" (the mailbox report for a month, quarter or year), "add to the to do list ... requiring customers to have a credit card or debit card on file before signing up", "where is the 'Check these boxes list'", "i want to be able to remove a package or letter from a customer just incase i accidentally assigned to the wrong person ... each customer to have a list of things checked in", and "a popup window to allow staff to choose whats available ... a table of all the numbers and a column of whether its a small/medium/large".
- **What changed:**
  - **Counter → Reports** has a **Mailboxes** section for the dates at the top: boxes in use (at the start, new, closed, expired, and each size rented, e.g. "Small 84 / 121"), money taken through the website (online and automatic renewals, letter overage, extra-package and storage fees, fees paid at the counter; plus owed now, waived and declined), mail handled (letters and packages in, picked up, forwarded, returned, and how long packages waited), and people (reservations, forwarding requests, boxes on hold). **Download mailbox report (CSV)** gives the same summary plus every money line, for Excel or your accountant. New date buttons for every report: **Last month**, **This quarter**, **This year**.
  - **Choose a box:** a button next to every Box # field (reservations and Assign a box to an account) opens a window with a table of every **free** number and its size, with All / Small / Medium / Large. For a reservation it opens on the size they reserved. **Pick** fills in the number.
  - **Every piece in a box** is listed in the **Edit** window (packages first): what it is, the day it came in, who logged it, any note, the photo, and **Move** (to another box number: its photo goes with it and any fee it caused is waived) and **Remove** (logged by mistake).
  - **Check these boxes** now always shows on the Mailboxes page, saying "Nothing to check right now." when it's empty, so it's easy to find (it used to hide when empty).
- **To-do:** P15, a card on file before a mailbox starts (cash is still fine to pay).
- **Files:** new [site/src/lib/mailboxReport.ts](../site/src/lib/mailboxReport.ts), [site/src/pages/counter/reports.astro](../site/src/pages/counter/reports.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-report.test.ts](../site/tests/mailbox-report.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, `npm run dev`. On `/counter/reports` (PIN 1234) press **This month** and scroll to **Mailboxes**. On `/counter/mailboxes`, press **Choose a box** in Assign a box to an account; put a package in a box, then **Edit** that box and try **Move**.

## 2026-11-16 20:54 CST · A Billing card instead of the "Charge due amounts now" button

- **Asked for:** "im thinking of it having a list of people who need to get charged or got charged.. i think that button is a little dangerous once i have alot of customers and say my brother accidentally presses it and charges everyone"
- **What changed** on Counter → Mailboxes:
  - The **Charge due amounts now** button is gone, and so is the "charge everyone" action behind it. Only the live site's automatic morning run charges in bulk.
  - A new **Billing** card shows: **Waiting to be charged** (each customer who owes fees: what for, the total, and their card or "no card: pays at the counter"); **Renewing in the next 7 days** (box, customer, amount, date, card); and **Recent charges (30 days)** (paid, declined, paid at the counter, waived).
  - **Charge now** sits on a single row, shows only for a manager or owner PIN, and asks "Charge Ann Owes $1.45 on the card ending 1111?" before anything happens. A renewal row has Charge now only on the day it's due (or if the morning run missed it).
  - Anyone with a staff PIN can look at the lists; only managers and owners see the Charge buttons.
- **Files:** [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-billing.test.ts](../site/tests/mailbox-billing.test.ts), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, `npm run dev`, open `/counter/mailboxes` with PIN 1234 and look at the **Billing** card. To see someone in it, put more than 20 letters in a small box with a card on file.

## 2026-11-16 20:43 CST · "Check these boxes" every 2 weeks, and "I picked up my mail" becomes something staff confirm

- **Asked for:** "i'd atleast want to be able to track the more quiet boxes so like maybe 2 weeks is good ... so either me or the staff has something to do per 2 weeks", and "what if they tapped 'I picked up my mail' when they really didnt?"
- **What changed:**
  - **Check these boxes** (Counter → Mailboxes): boxes whose letters have sat **2 weeks** with no one checking, each with **Empty (picked up)** and **Mail still there**. Once checked, a box stays off the list for 2 more weeks. The number is `check_every_days` in `site/src/data/mailboxes.json`.
  - **"I picked up my mail" no longer clears anything.** The customer's count stays; their dashboard says "Thanks! We'll confirm next time we check your box." The box goes to the **top** of Check these boxes ("Holder says they picked up (date); the count says 3 letters"), and the next time staff put a letter in, Mail in asks "the holder says they picked up on (date)... Is it empty?" even if the box was already checked that day.
  - **Empty** clears the letters. **Mail still there** keeps them, and the audit log notes the tap "DID NOT MATCH", so you can spot anyone doing it on purpose.
  - A false tap can't dodge the 45¢ overage: the count only drops when staff see an empty box.
- **Files:** [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/components/MailboxDashboard.astro](../site/src/components/MailboxDashboard.astro), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/mailbox-photos.test.ts](../site/tests/mailbox-photos.test.ts), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, `npm run dev`. Put a few letters in a box with **Mail in**, sign in as that customer and tap **I picked up my mail**, then reload `/counter/mailboxes`: the box is under **Check these boxes**, and the next letter for it asks you to confirm.

## 2026-11-16 20:35 CST · Photos of mail as it comes in, and keeping the letter count right

- **Asked for:** "is it worth taking a picture of the outside of the envelope and packages so we kinda keep track of what goes in and out?" (yes, for packages and important letters), then "how can i track if the customer already picked up their mail.. i feel like i can only physically check which may be annoying to do a count".
- **Photos:**
  - **Mail in** has a **📷 Photo** button (the tablet's camera). Take the photo, then tap **+ Letter** or **+ Package**: the photo goes with that piece, with a small preview until it's used. Tapping **+ Package** without a photo asks "Log this package without a photo?". For letters, only certified or important ones.
  - The tablet shrinks the photo before sending it. Photos **delete themselves after 90 days**.
  - Staff see them in the **Edit** window (a **Photo** button next to each package, and any letter with a photo). The holder sees a thumbnail on their dashboard next to the package and in Recent mail; tapping it opens it full size. Only the signed-in holder of that box can open their photos; anyone else gets "not found".
  - **Undo** removes the photo too.
- **Keeping the letter count right without counting:**
  - Customers take letters out with their key, so the site can't know. Now, the **first time a box gets a letter each day**, if the site thinks letters are still in it, **Mail in** asks: "Box #1105 should still have 7 letters. Is it empty?" with **Empty (picked up)** and **Mail still there**. One glance at the box you already have open. Letters put in later that day don't ask again.
  - Customers can also tap **I picked up my mail** on their dashboard.
  - Both clear **letters only**; packages are handed over at the counter (Edit → **All picked up**).
  - This also keeps the 45¢ letter overage fair: the count is checked by eye whenever new mail goes in.
- **Files:** new [site/src/lib/mailboxPhotos.ts](../site/src/lib/mailboxPhotos.ts), new [site/src/pages/api/mailbox-photo.ts](../site/src/pages/api/mailbox-photo.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/components/MailboxDashboard.astro](../site/src/components/MailboxDashboard.astro), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-photos.test.ts](../site/tests/mailbox-photos.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, **`npm run db:local`** (one new table), `npm run dev`. On `/counter/mailboxes`, **Mail in** a box: tap **📷 Photo** and pick a picture, then **+ Package**. Open **Edit** on that box and press **Photo**. Sign in as the holder: the thumbnail is on **My mailbox**. To see the "is it empty?" question, put a letter in a box, then come back the next day (or ask me how to fake a new day).

## 2026-11-16 20:25 CST · Package rules: 2 free at a time, 5 free days, then $1 a day up to $10, final notice on day 30

- **Asked for:** "I believe i should give each customer 2 box limit, but really i want the customer to only have 1 at max but i wont charge them if they hit 2. because i dont have the space"; agreed $2 for the 3rd package "if not picked up within 2 days"; "i want them to pick up their packages"; then, worried about surprise bills, the $1-a-day storage fee with a $10 cap and warnings; and "i like the 30 day return to sender notice".
- **What changed:**
  - **Packages no longer count toward the letter limit.** Letters fill the box (20 / 50 / 115, 45¢ per extra letter); packages have their own rules.
  - **Up to 2 packages at a time are free.** A 3rd (or later) package costs **$2**, but only if it's still here **2 days** after it came in. The holder is told right away: the day it arrives they get a message saying "you have 3 packages; up to 2 are free, the next is $2 if it's still here on (date)."
  - **Each package is free for 5 days**, then **$1 a day**, **never more than $10** per package.
  - **No surprises:** a text and email on **day 4** ("please pick up by day 5; after that $1 a day, $10 at most"), on **day 6** ("storage has started; pick up anytime to stop it"), and on **day 30** ("final notice: pick it up by (3 days later) or it goes back to the sender"). The fee notices go out even if the holder turned off "you've got mail" texts. The dashboard lists each package with "Free until (date)", "Storage so far: $3 (stops at $10)", or the final notice, plus the rules in one line.
  - **At the counter:** the box list shows "5/20 3 pkg", yellow when a package is past its free days and red **RETURN TO SENDER** from day 33. The Edit window lists each package (arrived, days here, free until or storage so far, any extra-package fee). The Mail in line warns when a box goes past 2 packages.
  - The fees are added once a day (each morning on the live site, or with **Charge due amounts now**) and charged with the other fees to the card on file; without a card they're a balance to pay at the counter. **Waive** still works for a regular having a rough week.
  - All the numbers are in `site/src/data/mailboxes.json`: `package_free_count` 2, `package_fee` 2, `package_fee_after_days` 2, `package_free_days` 5, `storage_fee_per_day` 1, `storage_cap` 10, `package_remind_day` 4, `package_return_notice_day` 30, `package_return_after_notice_days` 3.
- **Files:** [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/components/MailboxDashboard.astro](../site/src/components/MailboxDashboard.astro), [site/src/worker.ts](../site/src/worker.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox-mail.test.ts](../site/tests/mailbox-mail.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, `npm run dev`. On `/counter/mailboxes`, **Mail in** three packages to one box: the line warns about the 3rd, and the list shows "3 pkg". Open that customer's **My mailbox** to see each package's free-until date and the rules.

## 2026-11-16 20:00 CST · Mail log, capacity and overage fees, card on file, automatic renewal, and the customer's mailbox dashboard

- **Asked for:** a customer mailbox dashboard like the picture Peter sent; "keep track of each piece of mail ... if they're at capacity ... billing them being over capacity ... 45 cents", "20 pieces max on the small boxes, 50 medium and 115 for large", a "You've got mail" text and email; "me adding their credit/debit card ... to do the subscription ... automatically charging them overages"; then "remind them at the last month in a email that if they don't cancel, it will automatically renew, so theres a papertrail. the system shall automatically charge them for the same plan they paid for previously". Peter dropped the idea of a cancellation fee.
- **What changed, at the counter (Counter → Mailboxes):**
  - **Mail in**, at the top: type the box number, then tap **+ Letter** or **+ Package** once per piece (an optional note like "Amazon"). It shows "#1196 Danny Dash: 7 of 20" and an **Undo** for the last piece.
  - **Capacity:** small holds 20 pieces, medium 50, large 115 (letters and packages both count). Each piece that comes in once the box is already full adds a **45¢ overage**; the Mail in line turns red and says so. The box list has an **In box** column ("7/20"), yellow when nearly full, red when over.
  - **"You've got mail":** the holder gets one text and one email a day, on the first piece, with a link to their dashboard. If the box is full it also says each extra piece is 45¢.
  - **Edit window** now also shows what's in the box, with **All picked up / Forwarded / Returned to sender**; the **card and automatic renewal** (Add or Replace card, Turn on/off); and the **balance** with **Charge card now** (managers and owners), **Paid at the counter**, and **Waive** (managers and owners).
  - **Adding a card at the counter:** tick "The customer read and agreed..." (automatic renewal and the 45¢ overage), press **Add card**, and Stripe's secure page opens; the card is typed there, never on our site. Saving a card turns automatic renewal **on**.
  - **Forwarding requests** from customers show in their own card with **Done** and **Cancel** (and email `STAFF_EMAIL`).
  - **Charge due amounts now** (managers and owners) runs today's automatic renewals and overage charges by hand; the live site does it every morning.
- **What changed, for the customer (Account → My mailbox), now a dashboard like Peter's picture:** the store name and a bell; "Your mailbox #1196" and its status; their address with Copy; big **Mail pieces** and **Packages** counts; **Mailbox capacity** with a bar and percent (yellow at 80%, red when over, with a warning) and when the last mail came; **Plan** (size, term, price), **Next renewal**, **Automatic renewal** On/Off, **Card on file**, and any **Balance due**. Then rows that open: **Request mail forwarding** (address and note), **Manage subscription** (turn automatic renewal on or off, add/replace/remove the card, renew online), **Billing history**, **Notification preferences** (text me / email me when mail arrives), and **Recent mail**.
- **Automatic renewal:** on the box's paid-through date, the site charges the **same plan** (6 months or 1 year, at that size's price) to the card on file and extends the box, with a receipt email. A declined card is tried once; the customer and staff get an email and the box runs out as usual. **Overage fees** are charged to the card each morning once they add up to 50¢ (the card companies' minimum); without a card they wait as a balance to pay at the counter.
- **The paper trail Peter asked for:** with automatic renewal on, the 2-month, 1-month and 1-week reminders say: "Unless you turn it off, your mailbox #1196 renews automatically on (date) for $90.00 (6 months, the same plan as now), charged to your card ending 4242", then how to stop it before that date. Every reminder sent is in the audit log.
- **On the legal question** (my general understanding, not legal advice): turning automatic renewal on at sign-up is fine when the customer clearly agrees (the card page and the counter checkbox say it plainly), is reminded before each charge, and can turn it off as easily as they turned it on. Peter decided against a cancellation fee. A one-page mailbox agreement reviewed by a local attorney is on the to-do list.
- **Files:** new [site/src/components/MailboxDashboard.astro](../site/src/components/MailboxDashboard.astro), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/lib/stripe.ts](../site/src/lib/stripe.ts), [site/src/pages/api/stripe-webhook.ts](../site/src/pages/api/stripe-webhook.ts), [site/src/pages/api/mock-paid.ts](../site/src/pages/api/mock-paid.ts), [site/src/worker.ts](../site/src/worker.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-mail.test.ts](../site/tests/mailbox-mail.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm run db:local`** (four new tables), then `npm run dev`. On `/counter/mailboxes` (PIN 1234): type a box number in **Mail in** and tap **+ Letter** a few times; press **Edit** on that box, tick the agreement box and **Add card** (on your computer it skips Stripe and saves a test Visa ending 4242). Then sign in as that customer and open **Account → My mailbox**. The "You've got mail" text and email show in PowerShell as `[mock sms]` and `[mock email]`.

## 2026-11-16 19:33 CST · Mailbox Documents (IDs and Form 1583), and Mailboxes on the Customers page

- **Asked for:** "a 'Document' tab for me to upload all their ID's and form 1583's", "if im going to mailbox.. i want to be able to hit the 'Documents' button on their list item and then a window pops up all of their documents or i can upload documents there", and "in the customers tab to add a mailbox section for them".
- **What changed:**
  - **Counter → Mailboxes:** every box (in use, expired, and in Mail check results) has a **Documents** button, with a count once there are files, e.g. "Documents (2)". It's also in the Edit pop-up.
  - **The Documents window:** all of that person's documents (Photo ID, Second ID, PS Form 1583, Other), who added each and when, and a note. **Add a document**: pick what it is, choose a photo or PDF (on a phone or tablet this can be the camera), add a note, Upload. Big phone photos are shrunk to a size that's still easy to read. **View** shows the file inside the window, with Open full size; **Delete** removes it for good.
  - **Who can do what:** any staff PIN can upload and see the list; **only a manager or owner can open or delete** a file, and every time someone opens one it goes in the audit log with their name.
  - **Locked files:** each file is encrypted before it's stored, using a secret key (`DOCS_KEY`) that is kept apart from the files. On your computer it uses a built-in test key, so it works without setup; the live site won't take uploads until William sets `DOCS_KEY`.
  - **Keep for a year:** once all of a person's boxes have ended, the window says "Their last box ended (date). Keep these until (a year later), then delete them," and turns red when that date has passed. Nothing is deleted on its own.
  - **Counter → Customers:** opening a customer now shows a **Mailboxes** card next to their notes and addresses: every box they've had, its status, what to do with their mail, any reservation, and the **Documents** button. Their shipments are below it as before, so everything about them is in one place.
- **Files:** new [site/src/components/MailboxDocs.astro](../site/src/components/MailboxDocs.astro), new [site/src/lib/mailboxDocs.ts](../site/src/lib/mailboxDocs.ts), new [site/src/pages/api/mailbox-docs.ts](../site/src/pages/api/mailbox-docs.ts), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/counter/customers.astro](../site/src/pages/counter/customers.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/env.d.ts](../site/src/env.d.ts), [site/.dev.vars.example](../site/.dev.vars.example), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), new [site/tests/mailbox-docs.test.ts](../site/tests/mailbox-docs.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm run db:local`** (one new table), then `npm run dev`. On `/counter/mailboxes` (PIN 1234) press **Documents** on a box, upload a photo, then **View** it. On `/counter/customers`, search the same person and press **Open**: the Mailboxes card is next to Notes.

## 2026-11-16 19:09 CST · Expired mailboxes: hold the mail 6 months, then return to sender

- **Asked for:** "keep track of customers who expired. that way i know to keep their mail for 6 months and also tell me to stop holding their mail after the 6 months ends", "i dont know whether i should put it in the box or do RTS", "a search feature on the admin side to find the customer for either active/expired", "hold the expired customers information up to a year?"
- **What changed** on **Counter → Mailboxes**:
  - **Mail check** at the top: type a box number or the name on the mail. It shows every box that matches, current holder first, then past holders, and in color what to do today: **Put it in the box** (green), **HOLD the mail until (date)** (yellow), or **RETURN TO SENDER (since date)** (red).
  - A **red alert** when a hold is over: "Stop holding mail for 2: return their mail to sender", with the box numbers and names.
  - A new **Expired and closed boxes** list: box, holder, contact, the day it ended, and the mail instruction, return-to-sender first. Boxes stay on it for **a year** after they end; Mail check still finds them after that. Nothing is deleted.
  - **Boxes in use** now shows only paid boxes; an expired one moves to the Expired list (its **Edit** button is still there to renew or close it).
  - The Edit pop-up shows the hold line for an expired box.
  - **Rules:** a box ends on its paid-through date if it isn't renewed, or the day staff close it. Mail is held for **6 months** after that (through the same day 6 months later), then returned to sender. Both numbers are in `site/src/data/mailboxes.json` (`hold_months`, `keep_months`).
  - The morning job also **emails you** (the `STAFF_EMAIL` address) the list of boxes whose hold ended, once each.
  - The customer's "expired" text and email now say "We'll hold your mail until (date), then return it to sender."
- **Fixed while testing:** on a phone, the staff tables made the page wider than the screen; they now scroll sideways inside their card.
- **Files:** [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/worker.ts](../site/src/worker.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox.test.ts](../site/tests/mailbox.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, `npm run dev`, open `/counter/mailboxes` (PIN 1234). To make an expired box, use **Assign a box to an account** with a **Start date** in the past: 12/01/2025 and 6 months gives one still on hold; 11/01/2025 gives one past its hold (return to sender). Then try **Mail check** with the box number or the name. To get the "stop holding" email in PowerShell, add `STAFF_EMAIL=you@example.com` to `.dev.vars`, restart, and press **Send due reminders**.

## 2026-11-16 19:03 CST · Mailboxes: Edit pop-up with undo, automatic reminders, renew online with Stripe

- **Asked for:** "i like the +6 month or +12 month button but i want to be able to reverse it as well ... can we have like a edit button and a pop up comes up to send reminders, add months or year", "send automatic reminders when they get to their last two months and last month ... a reminder when its their last week", and "the customer to be able to login to their own account and extend their service as well that will collect payment via stripe".
- **What changed:**
  - **Counter → Mailboxes:** each box now has one **Edit** button. It opens a pop-up with **+6 months / +1 year**, **−6 months / −1 year** (to undo a mistake), **set the paid-through date** by hand, **Send a reminder now**, and **Close this box**. Taking time off can't go back to or before the day the box started. Every change is in the audit log with the old and new date.
  - **Reminders** now go out **2 months, 1 month and 1 week** before the paid-through date, and the day after it expires, each one once, by text and email. On the live site they go out **by themselves every morning** (9 am Central in winter, 10 am in summer). The **Send due reminders** button still works and never sends the same reminder twice. The sent list says which one went ("2-month reminder").
  - **Renew online:** the customer's **My mailbox** tab has **Add 6 months · $90** and **Add 1 year · $180** (their box's prices), with the new date each would give. The button goes to Stripe's payment page; when the payment comes back, the box is extended once (even if Stripe reports it twice), the customer gets a receipt email, and the page says "Thank you! Your mailbox is now paid through ...". Renewing early adds to the current date; renewing after it expired starts from today.
  - Reminder texts and emails now include the renew-online link.
- **Fixed while testing:** taking a year off a box that started the same day was allowed; now it's refused with a clear message.
- **Files:** [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), new [site/src/lib/mailboxJobs.ts](../site/src/lib/mailboxJobs.ts), [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), new [site/src/worker.ts](../site/src/worker.ts), [site/wrangler.jsonc](../site/wrangler.jsonc), [site/src/lib/stripe.ts](../site/src/lib/stripe.ts), [site/src/pages/api/stripe-webhook.ts](../site/src/pages/api/stripe-webhook.ts), [site/src/pages/api/mock-paid.ts](../site/src/pages/api/mock-paid.ts), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/i18n/index.ts](../site/src/i18n/index.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox.test.ts](../site/tests/mailbox.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm run db:local`** (one new table), then `npm run dev`. On `/counter/mailboxes` (PIN 1234) press **Edit** on a box and try the buttons. On your **Account → My mailbox**, press **Add 6 months**: on your computer there's no Stripe key, so it skips the payment page and goes straight to "Thank you!". The automatic morning reminders only run on the live site; on your computer use **Send due reminders**.

## 2026-11-15 15:42 CST · To-do: virtual mail, and raising mailbox prices

- **Asked for:** "add to my to do list for virtual mail. raise my prices like 2-5 bucks each.. i havent thought about a figure but put it to the list"
- **What changed:** Two new to-do items. **P13 Virtual mail on the website**: what we have now (Anytime Mailbox), a small first step (a card on the Mailboxes page linking to our Anytime Mailbox sign-up) and the bigger one (running it ourselves). **P14 Raise mailbox prices $2 to $5 each**: today's prices, the questions to decide (the figure, new customers only or at renewal), and the two places to change (the website's `mailboxes.json` and William's register). Prices are **not** changed yet.
- **Files:** [TODO.md](TODO.md)
- **How to check it:** open `peter/TODO.md` and look for P13 and P14.

## 2026-11-15 15:38 CST · Mailboxes on the website

- **Asked for:** "another function i want to add is for mailboxes", then the prices (small $90 / $180, medium $120 / $240, large $180 / $360 for 6 months / a year), the box numbers in the 1000s, "i want the customers who have an account on the website to be able to view their mailbox once i have assigned them their box", and "email and text them to remind them that their mailbox is expiring soon".
- **What changed:**
  - A new **Mailboxes** page (`/mailbox`, linked from Services): the three sizes and prices, what you get, what to bring (two IDs, USPS Form 1583, payment), and a sample address. A signed-in customer picks a size and 6 months or a year, sees the total, and presses **Reserve my mailbox**. They get a code like MR-ABCDE and pay at the counter.
  - A new staff page, **Counter → Mailboxes** (in every counter page's menu): free boxes per size, **reservations waiting** (type the box number, press Assign), **boxes on the website** with paid-through date and status, **+6 months / +1 year**, **Remind**, **Close**, and **Assign a box to an account** for customers who signed up at the counter.
  - The customer's **Account** page gets a **My mailbox** tab once a box is assigned: box number, status (Current, Renews soon, Expired), their full address with a Copy button, size, paid-through date and term.
  - **Reminders by text and email**: 30 days before, 7 days before, and the day after it expires, each sent once. For now staff press **Send due reminders** on the Mailboxes page once a day; making it automatic needs a scheduled job (TODO P12).
  - Prices, box ranges, the address format and the reminder days are in one file Peter can edit: `site/src/data/mailboxes.json`.
  - Every change (assign, renew, close, reminders) is in the audit log, and both new tables are in Export.
- **Assumed, please confirm:** medium is **6 months** for $120 (Peter wrote "7 months"); box numbers **#1100–1220 small, #1221–1284 medium, #1300–1323 large**; addresses read **1800 Forsythe Ave, Suite 2 #1230, Monroe, LA 71201**.
- **Fixed while testing:** the reminder code read the send functions' "mock mode" flag as "sent", so in real use it would have said "no phone"; and the staff page's section shared a name with the page layout and never showed.
- **Files:** [site/src/data/mailboxes.json](../site/src/data/mailboxes.json), [site/src/lib/mailbox.ts](../site/src/lib/mailbox.ts), [site/src/pages/api/mailbox.ts](../site/src/pages/api/mailbox.ts), [site/src/pages/mailbox.astro](../site/src/pages/mailbox.astro), [site/src/pages/counter/mailboxes.astro](../site/src/pages/counter/mailboxes.astro) (and the menu line in every counter page), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql), [site/src/data/store.ts](../site/src/data/store.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/mailbox.test.ts](../site/tests/mailbox.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm run db:local`** (new tables), then `npm run dev`. Sign in as a customer, open **Services → Mailboxes** (or `/mailbox`) and reserve one. Then open `/counter/mailboxes`, enter PIN 1234, type a box number like 1230 and press Assign. Back on **Account**, the **My mailbox** tab shows it. Reminder texts and emails show in the PowerShell window as `[mock sms]` and `[mock email]`.

## 2026-11-15 14:55 CST · Carrier logos in the Tracking page's box

- **Asked for:** "go in the tracking page. put the logo brands in that box as well"
- **What changed:** The **Tracking** page's "Track a package" box now shows **"Tracking numbers from"** with the USPS, UPS, FedEx and DHL logos under the Track button, the same as the home page's box.
- **Files:** [site/src/pages/track/index.astro](../site/src/pages/track/index.astro)
- **How to check it:** `git pull`, then `npm run dev`, and open **Tracking** in the menu.

## 2026-11-15 14:54 CST · The store's address beside the logo, instead of "Forsythe"

- **Asked for:** "change Forsythe to 'Monroe, LA'", then "or rather change it to '1800 Forsythe Ave, Suite 2, Monroe, LA 71201'"
- **What changed:** The red words beside the Goin' Postal logo at the top of every page now read **1800 Forsythe Ave, Suite 2, Monroe, LA 71201**. On a computer they sit beside the logo in two neat lines; on a phone they go under the logo so nothing overlaps the Log in button. Only the header changed: the store's name ("Goin' Postal Forsythe") stays the same on labels, receipts and page titles. The words come from a new store setting, `headerLabel`, so each store can set its own.
- **Files:** [site/src/data/store.ts](../site/src/data/store.ts), [site/stores/forsythe.json](../site/stores/forsythe.json), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/styles/global.css](../site/src/styles/global.css), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`, and look at the top of any page on a computer and on a phone (or a narrow browser window).

## 2026-11-15 14:51 CST · Official carrier logos on the site

- **Asked for:** "Here's the logos to use.." (USPS, UPS, FedEx Authorized ShipCenter, DHL, and the DHL Express Certified International Specialist badge)
- **What changed:** The carrier name badges are now the **official logos** Peter supplied, everywhere they appear: next to "Authorized for" at the top of every page, under the tracking box, the big row on **Ship a package**, and the footer. The **DHL Certified International Specialist** badge shows in the big row on Ship a package. The files are used as supplied; the two DHL images only had their plain grey margin trimmed so they line up with the others.
- **Note:** the UPS file is small (56 × 67 pixels), so it can look a little soft on sharp screens. A larger copy from the UPS logo kit would be crisper; just send it and it replaces this one.
- **Files:** [site/public/brand/carriers/](../site/public/brand/carriers/) (the five logo files), [site/src/data/carriers.ts](../site/src/data/carriers.ts), [site/src/components/CarrierBadges.astro](../site/src/components/CarrierBadges.astro), [site/src/styles/global.css](../site/src/styles/global.css), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Look at the top of any page, the home page's tracking box, Ship a package, and the bottom of any page.

## 2026-11-15 14:45 CST · Carrier wording: "Authorized for"

- **Asked for:** "we are authorized for everything"
- **What changed:** The carrier wording now says the store is authorized: **"Authorized for USPS · UPS · FedEx · DHL"** in the header, **"Authorized for every major carrier"** on the Ship page, and **"Authorized shipping location for ..."** in the footer (the tracking box still says "Tracking numbers from"). In all 14 languages. It stays general rather than naming each carrier's program title, since each program words its title differently; the exact titles can come with the logo kits.
- **Why:** The store is an authorized location for all four carriers (Peter), which is a selling point.
- **Files:** [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/pages/ship/in-store.astro](../site/src/pages/ship/in-store.astro), [site/src/pages/ship/index.astro](../site/src/pages/ship/index.astro), [site/src/data/carriers.ts](../site/src/data/carriers.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Look at the top and bottom of any page, and Ship a package.

## 2026-11-15 14:42 CST · Carrier branding: USPS, UPS, FedEx, DHL across the site

- **Asked for:** "add more branding for the providers we are partnered with such as ups/fedex/usps/dhl ... at the top of the page lined up at the white blank, maybe the tracking box, at the footnote possibly ... also in the 'Ship a package' tab. we need more branding in there"
- **What changed:** The four carriers now show in four places:
  - **Header:** "We ship USPS · UPS · FedEx · DHL" in the white space between the logo and Log in (on computers; hidden on phones so the header doesn't crowd).
  - **Tracking box:** "Tracking numbers from USPS · UPS · FedEx · DHL" under the Track button.
  - **Ship a package:** a big **"Every major carrier, at one counter"** row with the four carriers, near the top.
  - **Footer:** "We ship with USPS · UPS · FedEx · DHL" on every page.
- **Logos:** for now each carrier shows as its **name** in a clean badge. Their logos are trademarks, so only the **official files** can be used, as supplied and under each carrier's rules (usually for authorized retail locations). The site is ready for them: put the file in `site/public/brand/carriers/` and set it in `site/src/data/carriers.ts`, and that carrier's badge becomes its logo everywhere at once. The wording says "We ship", not "partner" or "authorized", until the store's status with each carrier is confirmed (to-do P11).
- **Why:** Seeing the carriers right away tells people this is where to ship.
- **Files:** [site/src/data/carriers.ts](../site/src/data/carriers.ts) (new), [site/src/components/CarrierBadges.astro](../site/src/components/CarrierBadges.astro) (new), [site/src/layouts/Base.astro](../site/src/layouts/Base.astro), [site/src/pages/index.astro](../site/src/pages/index.astro), [site/src/pages/ship/in-store.astro](../site/src/pages/ship/in-store.astro), [site/src/pages/ship/index.astro](../site/src/pages/ship/index.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Look at the top of any page on a computer, the home page's tracking box, **Ship a package**, and the bottom of any page.

## 2026-11-15 13:19 CST · Deals and news boxes on the sign-up form (email pre-checked, texts not)

- **Asked for:** "let this be the area they can opt in to get text messages and emails.. and have them prechecked.. that way they'll just mindlessly click create account. and its up to them if they uncheck or leave it checked"
- **What changed:** The **Create a free account** form now has **Deals and news (optional)** under the mobile number:
  - **☑ Email me Goin' Postal deals and news** starts **checked**. The customer can untick it.
  - **☐ Text me Goin' Postal deals and news** starts **unchecked**. The customer ticks it.
  - Whatever they leave ticked is recorded on their account, with the exact wording they saw, once they confirm their email. It shows on their Profile tab, where they can change it anytime.
- **Why texts aren't pre-checked:** under the TCPA, a pre-checked box isn't consent for marketing texts, and fines are $500 to $1,500 per text. The phone carriers also reject texting-platform registrations (to-do P4) whose sign-up form pre-checks the text box. US email law (CAN-SPAM) allows a pre-checked email box, as long as every email has an unsubscribe link. To get more text sign-ups legally, offer a reason, for example "$5 off your next order" (Peter to decide).
- **Files:** [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/api/account.ts](../site/src/pages/api/account.ts), [site/src/lib/session.ts](../site/src/lib/session.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/account-signup.test.ts](../site/tests/account-signup.test.ts) (2 more tests), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Sign out, open http://localhost:4321/account, and create a test account. Then look at the **Profile** tab: the email box is ticked and the text box isn't, unless you ticked it.

## 2026-11-15 13:14 CST · Account page in tabs, mobile number at sign-up, card orders under My orders

- **Asked for:** "can we be more organized on this page ... having buttons at the top.. like having a profile page", "get their number right from the bat at signup", "maybe one of the buttons be 'My orders'", and whether designs should be kept separate by product or in one area.
- **What changed:**
  - **The account page has tabs across the top: Profile · My orders · My designs · Addresses**, plus **Business** for customers with a business account. One section shows at a time, and the address bar remembers which one, so old links (like "View all shipments" in the Tracking menu, which opens `#orders`) land on the right tab.
    - **Profile:** name, email, phone, password, and deals and news.
    - **My orders:** **business card orders** with their status (Not paid, Paid and being made, At the printer, Ready to pick up, Picked up), then shipping orders. Card orders didn't show on the account at all before.
    - **My designs:** **one place for every product**, with filter buttons (All, Business card, and later T-shirt, Banner, Yard sign, Promo item; only the ones with designs show) and a label on each design. Edit, Reorder and Delete as before.
    - **Addresses:** saved addresses and the add form.
  - **Sign-up now asks for a mobile number** (required, checked for 10 digits), with a note that it's for calls and texts about orders, not marketing unless they say yes. It's saved to the account when they confirm their email. Accounts made before this keep asking on their first purchase, as before.
  - **Fixed on phones:** once signed in, the "Hi, Peter" button could push the page sideways on a phone (on every page). It now fits, and a long name ends in "…".
  - In all 14 languages.
- **Why:** The one long page was hard to scan. Getting the phone number at sign-up means the store can call or text a customer about any order.
- **About older card orders:** only card orders placed from now on are listed under My orders (older ones weren't linked to an account).
- **Files:** [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/api/account.ts](../site/src/pages/api/account.ts), [site/src/lib/session.ts](../site/src/lib/session.ts), [site/src/lib/cardOrders.ts](../site/src/lib/cardOrders.ts), [site/src/pages/api/cards.ts](../site/src/pages/api/cards.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/tests/account-signup.test.ts](../site/tests/account-signup.test.ts) (new, 3 tests), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Open http://localhost:4321/account, sign out, and create a new test account: the mobile number is now asked for. Then click through the tabs, and order a business card to see it under **My orders**.

## 2026-11-15 12:26 CST · Editor tools like Vistaprint (Templates, Graphics, Background, More) and "Design with AI" in demo mode

- **Asked for:** "lets add more functions that is broken up similar to vista print" (Templates that stay in the editor, the Background panel with colors and patterns, the More menu with QR codes), "possibly allow people to use ai to come up a design", then "lets just see it in action first and we can decide later. put that in the to do list to see if its worth spending 2 cents per ai use".
- **What changed:** The editor's left tool bar now has seven tools:
  - **Templates:** every layout shown with the customer's own words, in any of the 12 color schemes. Click one and the card changes **without leaving the editor**. Typed words, uploaded logos, added graphics and the background pattern all come along. The font for the whole card is here too, plus "Start over from the full gallery".
  - **Text** and **Uploads:** as before.
  - **Graphics (new):** 24 icons (phone, email, website, location, star, heart, house, car, wrench, hammer, leaf, fork and knife, scissors, medical, coffee, camera, paw, music, truck, cart, briefcase, church cross, cake, check) and 8 shapes (circle, square, rounded box, ring, triangle, diamond, line, frame), in any color.
  - **Background (new look):** 16 curated colors, any custom color, and **10 patterns** (dots, stripes, diagonal, grid, waves, chevron, confetti, leaves, circles, crosshatch) in 6 color pairs, plus Remove pattern. Every icon, shape and pattern was **drawn for the store**, so nothing belongs to anyone else.
  - **AI design (new):** the customer describes their business and the look they want, and gets **three designs** to pick from, built only from our layouts, colors, patterns and icons. Each one opens as a fully editable card. There's also a "Describe your business and let AI design it" button on the first step.
  - **More (new):** **QR code**. Type a web address and a scannable QR code goes on the card (it checks that the address looks real).
  - **Selecting a picture no longer jumps to another panel**, so you can add several icons in a row.
- **AI: demo mode for now, no cost.** Without an AI key, "Design it for me" picks designs by matching words in the request (business type, colors, a name in quotes), and says plainly that it's a demo. When a key is added, the same button asks Claude (Anthropic's AI), at about 2 cents a request. Either way: **sign-in required, 10 tries per customer per day** (changeable), and the AI can only choose from our own pieces; anything else it says is thrown away.
- **Why:** More choices make the store feel like the place to go, and the AI is a step Vistaprint's editor doesn't offer this simply. Demo mode lets you try it before deciding to pay.
- **Files:** [site/src/lib/cardArt.ts](../site/src/lib/cardArt.ts) (new: patterns, icons, shapes), [site/src/lib/cardDesign.ts](../site/src/lib/cardDesign.ts) (new: template switching, AI designs, demo mode), [site/src/pages/api/card-ai.ts](../site/src/pages/api/card-ai.ts) (new), [site/src/pages/cards/design.astro](../site/src/pages/cards/design.astro), [site/src/env.d.ts](../site/src/env.d.ts), [site/.dev.vars.example](../site/.dev.vars.example), [site/package.json](../site/package.json) (the Anthropic library), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/tests/card-tools.test.ts](../site/tests/card-tools.test.ts) (new, 8 tests), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm install`** (a new library), then `npm run dev`. Sign in, open Business Cards, press **Describe your business and let AI design it**, and type something like *a fun card for my crawfish restaurant "Bayou Boil", red and gold*. Pick a design, then try Templates, Graphics, Background and More.

## 2026-11-15 12:03 CST · New card editor screen, and "Let us design it for you"

- **Asked for:** "Let us design it for you" from Vistaprint, "may be neat to have when people are customizing their business card as an additional charge ... towards the top of the page"; and "the buttons at the top are starting to look a little convoluting ... like as if its photoshop ... possibly a editor window with the function buttons on the left like how vistaprint does it and then it allows you to hit next at the top right".
- **What changed:**
  - **The designer is now an editor screen** instead of a row of buttons:
    - **A top bar:** "Business Cards", Undo, Redo, Save, then Preview, the **price** (it follows the options), and a red **Next** button at the top right.
    - **A tool bar down the left** with four tools, each opening its own panel next to it: **Designs** (change the layout, and the font for the whole card), **Text** (+ Add text), **Uploads** (logo or photo, or a finished design), and **Background** (the color of the side).
    - **When something on the card is clicked**, its settings (size, bold, color, and so on) appear in the panel under the tool.
    - **The card big in the middle**, with a "Safety area" tag, and **zoom** (− 100% +) underneath.
    - **Front and Back** as small pictures of each side on the right. Click one to switch sides.
    - **Next** goes to a separate **Choose your options** step (quantity, paper, finish, corners, timing, design), showing the card next to it, with **Back to the design**. The page heading only shows on the first step.
    - On a phone, the tools sit in a row across the top and everything stacks.
  - **"Let us design it for you (+$20.00)"** is a link just under the top bar, and a new **Design** choice in the options: "I'll design it myself" (included) or "Let us design it for you" (+$20.00). Choosing it explains what happens and asks the customer to write in the notes what they want (business name, details, colors, ideas, plus their logo in Uploads). Notes are required for it and can now be twice as long. On the review page, the box they tick says the store will design the cards and send a proof to approve before printing. **Staff see a big "DESIGN HELP" banner** on the counter card page, like the RUSH one.
  - **The $20 is a placeholder** like the other card prices; the real price is part of to-do P9.
  - In all 14 languages.
- **Why:** The editor was getting crowded. Now each button has a clear place, like the big print sites. Design help is extra money for the store from customers who don't want to design it themselves.
- **Files:** [site/src/pages/cards/design.astro](../site/src/pages/cards/design.astro), [site/src/lib/cards.ts](../site/src/lib/cards.ts) (the Design option), [site/src/pages/api/cards.ts](../site/src/pages/api/cards.ts), [site/src/pages/cards/review.astro](../site/src/pages/cards/review.astro), [site/src/pages/counter/card/[code].astro](../site/src/pages/counter/card/%5Bcode%5D.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/cards.test.ts](../site/tests/cards.test.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Open Business Cards and pick a design. Try each tool on the left, click text on the card, switch Front and Back on the right, then press **Next**. Go back and click **Let us design it for you**.

## 2026-11-15 11:51 CST · Saved designs on the customer's account: edit, reorder (business cards now, every product later)

- **Asked for:** "once they make an account, they'll have their business card saved and they can still make edits to their previous card and make an order with that or just reorder the same one", then "along with t shirts, pens, banners and yard signs. same deal save their stuff"
- **What changed:**
  - **The account page has a new "Your saved designs" section.** Each saved business card shows its picture, its name, and either "Saved (date)" or "Last ordered (date): 250 cards · Gloss". It has three buttons:
    - **Edit** opens it in the designer, with the last quantity and options already ticked.
    - **Reorder** goes straight to Review your order with the same card, quantity and options, priced again at **today's** prices.
    - **Delete** asks first.
  - **Cards are saved two ways:** a new **Save to my account** button in the designer, and **automatically every time a card is ordered**. Editing a saved card and saving or ordering it updates that same card, so the list doesn't fill up with copies. A customer who isn't signed in is told to sign in, and their design waits on the page meanwhile.
  - **Built for every printed product.** T-shirts, banners, yard signs and pens and promo items use the same saved list once they can be ordered online (to-do P7). Until then the section says they're coming.
  - **Safety:** a customer can only ever see, change or delete their own designs. Up to 30 of each product per customer, and a design with too many huge pictures is refused with a clear message. A design that can't be saved never stops the order.
  - In all 14 languages.
- **Why:** Repeat orders are easy money. A customer who can reorder their cards in two clicks comes back to us instead of starting over somewhere else.
- **Files:** [site/db/schema.sql](../site/db/schema.sql) (new `saved_designs` table), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/src/lib/savedCards.ts](../site/src/lib/savedCards.ts) (new), [site/src/pages/api/account.ts](../site/src/pages/api/account.ts), [site/src/pages/api/cards.ts](../site/src/pages/api/cards.ts), [site/src/pages/account/index.astro](../site/src/pages/account/index.astro), [site/src/pages/cards/design.astro](../site/src/pages/cards/design.astro), [site/src/pages/cards/review.astro](../site/src/pages/cards/review.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/tests/saved-designs.test.ts](../site/tests/saved-designs.test.ts) (new, 4 tests), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then **`npm run db:local`** (new table), then `npm run dev`. Sign in, design a card, press **Save to my account**, then open **Account**: the card is under "Your saved designs". Try Edit, Reorder and Delete.

## 2026-11-15 11:28 CST · To-do P9: find a business card supplier and price to compete

- **Asked for:** "add to the to do list. need to find a business card supplier. and understand their services and features they can provide. and getting prices to make sure we can be competitive"
- **What changed:** Nothing on the website. A new to-do item, **P9**, with the steps: make a short list (trade printers with plain-box shipping, a local printer, printing in the store, and asking the franchise); a list of questions for each supplier (papers, finishes, shapes, price breaks, turnaround, file and bleed requirements, how to order, sample packs); comparing with Vistaprint and others; setting our prices; and putting them on the site. Linked from decision D20 in the meeting notes.
- **Why:** The card shop is built, but its prices are placeholders and nobody has picked a printer yet.
- **Files:** [TODO.md](TODO.md) (P9), [FOR-WILLIAM.md](FOR-WILLIAM.md) (D20)
- **How to check it:** Open `peter/TODO.md` and find P9.

## 2026-11-15 11:28 CST · Business cards: turn the card in 3D, with Front and Back buttons

- **Asked for:** "after the customer is done with their design that they can drag their card or flip their card around to check how their card looks digitally.. it gives a customer a professional and 'editorial' feel", and "it gives a front and back view option in the 3d card viewer".
- **What changed:**
  - **A 3D card** the customer can **drag to turn** with a mouse or a finger. **Front** and **Back** buttons under it turn it to face that side straight on, and the button for the side facing you lights up. The keyboard works too: arrow keys turn it, Enter flips it.
  - It shows what was picked: **gloss** has a shine that slides across as the card turns, **soft touch** a soft sheen, **linen** its weave, **thick** paper a thicker edge, and **rounded corners** are round.
  - It's on the **Review your order** page, above the flat front and back (those stay as the exact proof), and behind a new **Preview in 3D** button in the designer, which opens it in a window.
  - In all 14 languages.
- **Why:** It makes checking the card feel professional, like a big print shop, and helps people see the finish they're paying for.
- **Files:** [site/src/lib/card3d.ts](../site/src/lib/card3d.ts) (new: the 3D viewer), [site/src/pages/cards/review.astro](../site/src/pages/cards/review.astro), [site/src/pages/cards/design.astro](../site/src/pages/cards/design.astro), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Open Business Cards, pick a design, tick Gloss and Rounded corners, and press **Preview in 3D**. Drag the card, then press **Back** and **Front**. The same card is on the review page after **Review order**.

## 2026-11-14 20:24 CST · Business card shop page, like an online print shop, plus "Upload your design"

- **Asked for:** "once someone click business cards. it should start looking like a vistaprint website", with screenshots of Vistaprint's paper, shape, finish, business-use and editor sections; "allow people to feel they have options and feel this is the place to go". Who prints the cards is still open, and the prices stay as they are for now.
- **What changed:**
  - **Business Cards now opens a shop page** (`/cards`) built the way online print shops lay theirs out, in our own colors, words and pictures (every card picture is drawn from the site's own designs; nothing of Vistaprint's is copied):
    - a top banner, "Business cards, printed here in Monroe", **From $24.99 · $0.25 each / 100 cards**, with **Browse designs** and **Upload your design** buttons, and a fanned stack of sample cards;
    - four reasons to order here: pick up in the store, a real person checks every card, next-day rush, local help;
    - **Pick your paper**: Standard, Thick and Linen, each with its "From" price;
    - **Compare finishes**: Matte, Gloss and Soft touch tabs with what each is like and its price;
    - **Square or rounded corners**;
    - **Designs for your type of business**: Restaurant & Food, Beauty & Salon, Construction & Trades, Real Estate, Auto & Repair, Lawn & Landscaping, Church & Nonprofit, Medical & Health (each opens the designs in that business's colors and with matching sample wording), plus "See every design" and "Already have a design?";
    - **How it works** in three steps.
  - **Every price on the page comes from the same price list the checkout charges**, so the page can't show a price that's different from the bill. Only what the store sells today is shown.
  - **The designer moved to `/cards/design`.** Clicking a paper, finish or corner on the shop page opens it with that option already ticked in the order form.
  - **New: Upload your design.** Someone with a finished card from their own designer starts from a blank card and presses **Upload your design** (or **Upload a finished design** in the toolbar). The picture fills the card and is sized for printing. If it's too small to print sharply, or the wrong shape so the edges get trimmed, they're warned in plain words. A card that is only an uploaded picture can now be ordered (before, the front had to have text).
  - **Fixed:** "Payment was cancelled" never showed after someone backed out of the card payment, because that page was built once ahead of time. It's now built on each visit.
  - Everything is in all 14 languages.
- **Why:** So the store feels like the place to go for business cards: lots of options, clear prices, and the local advantages a big website can't offer.
- **Files:** [site/src/pages/cards/index.astro](../site/src/pages/cards/index.astro) (new shop page), [site/src/pages/cards/design.astro](../site/src/pages/cards/design.astro) (the designer, moved from `cards/index.astro`), [site/src/lib/cardShop.ts](../site/src/lib/cardShop.ts) (new: business types and "From" prices), [site/src/pages/cards/review.astro](../site/src/pages/cards/review.astro), [site/src/lib/stripe.ts](../site/src/lib/stripe.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/tests/card-shop.test.ts](../site/tests/card-shop.test.ts) (new, 3 tests), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Open **Printing → Business Cards**. Click the Gloss tab, a paper, and a business type. Then try **Upload your design** with any picture from your computer.

## 2026-11-14 20:07 CST · "Printing" menu with a dropdown, and a page for each product

- **Asked for:** "lets do 'Printing' and then have a drop down menu for: Business Cards, Banners & Yard Signs, Custom T-Shirts, Pens & Promo Items, maybe have See all printing at the top of the dropdown menu or bottom"
- **What changed:**
  - The **Business cards** tab is now **Printing ▾**. Its dropdown lists **Business Cards, Banners & Yard Signs, Custom T-Shirts, Pens & Promo Items**, then a line, then **See all printing** at the bottom. It works like the Tracking menu: it opens on hover on a computer and with the ▾ arrow on a phone.
  - **New page "Printing"** (See all printing): a tile for each product. Business Cards is marked **Order online** with a "Design your cards" button. The other three are marked **Order in the store**, each with "Learn more".
  - **New pages for Banners & Yard Signs, Custom T-Shirts and Pens & Promo Items**: what it's for, how it works (tell us what you need, we send a price and a proof, pick it up), "Online ordering is coming soon", a **Call us** button and a **Send us a message** button, plus the store's hours. These pages will get the online "request a quote" form later (to-do P7 step 3).
  - **Fixed on phones:** the whole site was secretly about 1,000 pixels wide on a phone, so phones shrank the page to fit. That was caused by the menu bar and the language/text-size bar from the Theme B work. Pages now fit the screen exactly, and on a phone a dropdown opens as a full-width panel right under the menu bar.
  - Everything is in all 14 languages.
- **Why:** So visitors see right away that the store does printing, not just shipping, using the same "Shipping · Printing · Office Services" words as the franchise logo.
- **Files:** [site/src/layouts/Base.astro](../site/src/layouts/Base.astro) (the menu), [site/src/pages/printing/index.astro](../site/src/pages/printing/index.astro), [banners.astro](../site/src/pages/printing/banners.astro), [t-shirts.astro](../site/src/pages/printing/t-shirts.astro), [promo.astro](../site/src/pages/printing/promo.astro) (all new), [site/src/components/PrintProduct.astro](../site/src/components/PrintProduct.astro) (new, the shared layout of the three product pages), [site/src/styles/global.css](../site/src/styles/global.css), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** `git pull`, then `npm run dev`. Hover **Printing** in the menu, then click each item. On a phone, or with the browser window made narrow, tap the ▾ next to Printing.

## 2026-11-14 19:42 CST · Switch Off now means no shipping prices online at all

- **Asked for:** "I think the way I want the switch to work is basically not even give them quotes on the website."
- **What changed:** The Settings switch is now called **Online shipping: prices and labels**. When it's **Off** (as it is now):
  - The **Ship a package** page no longer has the price form. It shows **"Ship with us in the store"**: what we do for you (every carrier, packing, insurance and signature, a receipt with tracking), the address, phone and hours, a **Get directions** button and **Track a package**.
  - The **home page** headline says **"Every carrier, one counter."** with in-store steps (bring your package, we compare every carrier, we print the label) instead of "buy your label online".
  - The website's price lookup **refuses customers** and only answers staff PINs, so prices can't be pulled from the site some other way. Online orders are refused too.
  - **Staff quotes on the Queue page still work**, because the Queue sends your PIN.
  - The "reserve online, pay at the counter" idea from the last entry is gone, because there are no online prices to reserve.
  - When it's **On**, everything is back to William's online shipping with one click.
- **Why:** Peter wants shipping to bring people into the store, not give prices away online.
- **Files:** [site/src/pages/ship/in-store.astro](../site/src/pages/ship/in-store.astro) (new), [site/src/pages/ship/index.astro](../site/src/pages/ship/index.astro), [site/src/pages/index.astro](../site/src/pages/index.astro), [site/src/pages/api/rates.ts](../site/src/pages/api/rates.ts), [site/src/pages/api/orders.ts](../site/src/pages/api/orders.ts), [site/src/pages/counter/queue.astro](../site/src/pages/counter/queue.astro), [site/src/pages/counter/settings.astro](../site/src/pages/counter/settings.astro), [site/src/pages/api/settings.ts](../site/src/pages/api/settings.ts), [site/src/lib/siteSettings.ts](../site/src/lib/siteSettings.ts), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/tests/site-settings.test.ts](../site/tests/site-settings.test.ts) (9 tests now), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** First `git pull`, then `npm run dev`. Open http://localhost:4321/ship: it says "Ship with us in the store". The home page headline says "Every carrier, one counter." Turn it On at /counter/settings with the owner PIN and both go back to online shipping.

## 2026-11-14 19:15 CST · Online label buying: an on/off switch for the owners

- **Asked for:** "where or how should we do a online labels with a switch? a admin login to switch it off?" (P7 step 1)
- **What changed:** A new staff page, **Settings**, in the staff menu on every staff page. It has one switch: **Online label buying, On or Off**. Anyone on staff can see it with their PIN, but only an **owner PIN** can flip it, it asks "are you sure?" first, and every change is written in the staff audit log with the name and time. It starts **Off**.
  - **When Off** (now): customers still compare USPS, UPS, FedEx and DHL prices on the Ship page, but the button says **"Reserve, pay at the counter"**. They get a pickup code and QR code, there is no online card payment and no online convenience fee, and the order shows up in the **Queue** like a walk-up, where staff press "Rung up. Buy label" after taking payment on the register.
  - **When On**: everything works as William built it: pay by card through Stripe and print at home.
  - Business cards are not affected; they are always paid online.
- **Why:** Peter's decision (D19): e-commerce first, online labels on the sideline. This keeps people coming into the store for labels, while the Ship page still shows prices and brings them in. When the time comes, an owner turns it on with one click, nothing to rebuild.
- **Files:** [site/src/pages/counter/settings.astro](../site/src/pages/counter/settings.astro) (new page), [site/src/pages/api/settings.ts](../site/src/pages/api/settings.ts) (new), [site/src/lib/siteSettings.ts](../site/src/lib/siteSettings.ts) (new), [site/src/shipping/store.ts](../site/src/shipping/store.ts), [site/db/schema.sql](../site/db/schema.sql) (new `site_settings` table), [site/src/pages/api/orders.ts](../site/src/pages/api/orders.ts), [site/src/pages/api/rates.ts](../site/src/pages/api/rates.ts), [site/src/pages/ship/index.astro](../site/src/pages/ship/index.astro), [site/src/pages/ship/done.astro](../site/src/pages/ship/done.astro), the staff menu line in every page in [site/src/pages/counter/](../site/src/pages/counter/), [site/src/i18n/strings.ts](../site/src/i18n/strings.ts), [site/src/i18n/staff3.ts](../site/src/i18n/staff3.ts), [site/src/styles/global.css](../site/src/styles/global.css), [site/tests/site-settings.test.ts](../site/tests/site-settings.test.ts) (new, 6 tests), [TODO.md](TODO.md), [FOR-WILLIAM.md](FOR-WILLIAM.md)
- **How to check it:** First `git pull`, then `npm run db:local` (new table), then `npm run dev`. Open http://localhost:4321/counter/settings, type a PIN and press Show. To flip it locally, put a number after `OWNER_PIN=` in `site/.dev.vars` (for example `OWNER_PIN=9999`) and restart. Then try the Ship page: with the switch Off the last button says "Reserve, pay at the counter" and you land on the pickup-code page; the order is in /counter/queue.

## 2026-11-14 18:59 CST · Decision: e-commerce first, online labels on the sideline

- **Asked for:** Peter's input: online labels might pull price-sensitive local customers away from the counter, though they also reach customers nationwide; "I'd rather do the e-commerce side, make money with that, and then slowly take risks like selling shipping labels."
- **What changed:** Nothing on the website. Added **P7** (Print & Promo online: business cards, banners and yard signs, t-shirts, business pens and promo items, mailboxes; build order and questions) and **P8** (online labels, later, with the checks to do first) to the to-do list, and **D19** to the meeting notes.
- **Why:** Higher margins, no price shopping, no competition with the counter, and pickups bring people in. Labels come later, on purpose.
- **Files:** [TODO.md](TODO.md) (P7, P8), [FOR-WILLIAM.md](FOR-WILLIAM.md) (D19)

## 2026-11-14 15:39 CST · Store hours and phone number

- **Asked for:** "Change my hours to 9 AM to 6:30 PM Monday to Friday, Saturdays 9 am to 3 pm and Sundays 10 am to 3 pm. And my store phone number is (318) 570-2132."
- **What changed:**
  - **Hours:** Monday to Friday 9:00 am to 6:30 pm; Saturday 9:00 am to 3:00 pm; Sunday 10:00 am to 3:00 pm (Sunday was "Closed").
  - **Phone:** (318) 570-2132 (was the placeholder (318) 000-0000). It shows wherever the site lists the store's phone, and it's now the store's contact number on shipping labels (+1 318 570 2132), which carriers use if there's a problem with a package.
  - The same facts in `site/stores/forsythe.json`, the template for the next store.
- **Not changed:** the printed counter flyer leaves blank HOURS and PHONE lines to fill in by hand; the business-card designer's sample card keeps its made-up number.
- **Files:** [store facts](../site/src/data/store.ts), [store file](../site/stores/forsythe.json)
- **How to check it:** `git pull`, refresh the home page: "Hours and directions" in the right column shows the new hours and phone. The Contact page shows them too.
- **Checks run:** 166 tests pass, the site builds, and the built home and contact pages show the new hours and phone.

## 2026-11-14 15:28 CST · New look: Theme B, Friendly & warm, with the Goin' Postal logo

- **Asked for:** "Let's do B" (from the three theme ideas), with the company logo at the top left. The logo is the file the franchise supplies.
- **What changed (every page, staff pages included):**
  - **Colors from the logo:** navy #29276E and flag red #CB3833 on a warm off-white page, instead of the glossy blue and tan.
  - **Font:** Nunito, a rounded, friendly face, served from the store's own site (not Google's servers). Lao, Khmer, Thai, Korean, Chinese and Japanese keep the fonts that carry their letters.
  - **Header:** white, with the **Goin' Postal logo** top left and "Forsythe" beside it, the menu in navy ("Ship a package" as a red pill, the current page underlined in red), the Tracking dropdown as a soft card, and the red **Log in** pill on the right.
  - **A slim bar above the header** holds the language picker, text size and High contrast, like ups.com. It stays small whatever text size is picked.
  - **Buttons** are flat pill shapes: red for the main action, navy for the other. **Cards, boxes and fields** are white with soft shadows and rounded corners. Headings are navy.
  - **On a phone:** the menu scrolls sideways on one line and the top bar stays on one line, so the tracking box now starts on the first screen (192 px down an 844 px screen). That settles D13.
  - **High contrast** still turns everything flat black and white with bold outlines.
- **The logo:** `site/public/brand/goin-postal-logo.png`, the franchise's file used as is (never redrawn or recolored). It's in the public GitHub repo because the site has to serve it; the footer already says Goin' Postal's name and logo belong to GP Brands. A larger PNG or an SVG from franchise support would look sharper.
- **New package:** the Nunito font (`@fontsource-variable/nunito`). After `git pull`, run `npm install` once.
- **Files:** [layout and header](../site/src/layouts/Base.astro), [styles](../site/src/styles/global.css) (a Theme B section at the end), [logo](../site/public/brand/goin-postal-logo.png), [package list](../site/package.json)
- **How to check it:** `git pull`, then `npm install`, then `npm run dev`, and open http://localhost:4321. Try the Ship page, Tracking, Business cards, Account, a phone-sized window, another language and High contrast.
- **Checks run:** 166 tests pass, the type check is clean, the site builds. Screenshots of the home, Ship, Tracking, Business cards, Account and staff Queue pages on a computer, the home and Ship pages on a phone, the Tracking menu, High contrast, Lao and Chinese; no page scrolls sideways; the font loads. The sign-up and sign-in journey from the Ship page ran again on the new theme.
- **Fixed while checking:** "Ship a package" lost its pill (and went white on white on the Ship page) because an older rule won; the "PeterShip" title kept a faint mirror reflection from the old look; the top bar grew to three rows on a phone at larger text sizes.

## 2026-11-14 15:19 CST · Theme ideas and to-do P6

- **Asked for:** help getting started on "a better website theme, something more friendly to the eyes and not so old styling", with the company logo at the top left. The logo is the file the franchise supplies.
- **What changed:** Nothing on the website yet. Claude made a preview with three directions (A. Clean & bright, B. Friendly & warm, C. Bold & proud), each a mini home page with the logo, in the logo's navy and red, plus a comparison and the steps. Added **P6** to the to-do list and **D18** to the meeting notes. The preview file isn't in the repo because it contains the franchise logo (the repo is public).
- **Why:** So Peter can pick a look before the whole site is restyled in one change.
- **Files:** [TODO.md](TODO.md) (P6), [FOR-WILLIAM.md](FOR-WILLIAM.md) (D18)

## 2026-11-14 14:54 CST · Passwords for customer accounts, with the email link kept as a backup

- **Asked for:** "Why is it 'email me a sign-in link'? They can't just put a password?" Peter picked: add passwords, keep the link for "forgot password". Also asked about "Sign in with Google" (added as P5 on the to-do list).
- **What changed:**
  - **The Account page** now has two boxes: **Sign in** (email and password, with "Forgot your password? Email me a sign-in link") and **Create a free account** (name, email, password).
  - **Creating an account** asks for a password, then sends one confirmation email; opening the link signs the customer in and brings them back to where they were (the Ship page with its form, or the card review page with the design). After that it's email and password every time.
  - **Existing customers** (from the counter or the old email-link sign-in) "create an account" with their usual email: the confirmation link adds the password to their existing account, so their history stays.
  - **Signed-in customers** can set or change their password on the Account page. **Forgot password:** the email link signs them in, then they set a new one.
  - **The Ship page and the card review page** now show **Sign in** and **Create an account** buttons (the form or design is kept on the device meanwhile).
  - All new and changed text in all 14 languages.
- **Security:**
  - Passwords are stored only as a one-way scrambled code (PBKDF2-SHA256, salted, 100,000 rounds), never as typed, and the staff export blanks those codes.
  - **A password only takes effect once the email is proven** (the confirmation link), so nobody can put a password on someone else's email and see their orders.
  - Five wrong passwords for an email (or thirty from one connection) lock sign-in for fifteen minutes; the message is the same whether the email exists or not; sign-ups from one connection are limited too.
  - Passwords need 8 or more characters and can't be one of the most common passwords or the email itself.
- **Before going live:** email (Resend) must be connected, since sign-up confirmation and "forgot password" use it. The new table needs the database setup re-run (`npm run db:local`, and `db:remote` on the live site).
- **Files:** [password helpers (new)](../site/src/lib/password.ts), [tests (new)](../site/tests/password.test.ts), [sign-in links and lockout](../site/src/lib/session.ts), [account API](../site/src/pages/api/account.ts), [account page](../site/src/pages/account/index.astro), [store](../site/src/shipping/store.ts), [database table](../site/db/schema.sql), [ship page](../site/src/pages/ship/index.astro), [card review page](../site/src/pages/cards/review.astro), [text, 14 languages](../site/src/i18n/strings.ts), [styles](../site/src/styles/global.css), [TODO.md](TODO.md) (P5)
- **How to check it:** `git pull`, `npm run db:local` (new table), `npm run dev`. Open **Log in**, create an account (the confirmation email prints in the PowerShell window; the page also shows a "dev: open it" link). Sign out from the Account page, then sign back in with the password.
- **Checks run:** 166 tests pass (6 new), the type check is clean, the site builds, the database setup runs twice cleanly. In a real browser: sign-up from the Ship page back to a filled-in form; a common password refused; wrong and right passwords; changing the password; the lockout on the sixth try even with the right password; an existing customer's new password doing nothing until their email link is opened, then working with their history kept; "forgot password" sending the link.

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
