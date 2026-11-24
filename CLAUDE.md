# CLAUDE.md

Static site for browsing and comparing tennis rackets. See README.md for the layout.

## Conventions
- To add rackets, use the `add-racket` skill (`.claude/skills/add-racket/SKILL.md`).
- Browse state (search, filters, sort, view, map axes, similar reference) lives in the URL hash. A new browse control must be read in `readBrowseHash()` and written in `writeBrowseHash()` in `docs/app.js`.
- The open photo is `zoom=<id>`, layered on top of the browse or compare hash. Any code that rewrites the hash must keep it with `keepZoom()`.
- `docs/` is the site root (wwwroot). There is no build step and there are no dependencies. Keep `docs/data/rackets.js` a plain `window.RACKETS = [...]` script so `file://` works.
- One object per racket in `rackets.js`, grouped by brand, with a source comment on each brand section.
- **Never guess a spec.** If the source doesn't publish it, use `null`. Note any per-racket source exception in a comment next to that racket.
- **Swing weight** and **stiffness** always come from Tennis Warehouse (swing weight strung, `swingweightType: "strung"`). Don't mix in brand or unstrung numbers.
- **Balance** is always unstrung, from the brand or a retailer listing the brand's spec. Never use Tennis Warehouse's balance, which is strung.
- **Beam** comes from the brand, or from Tennis Warehouse when the brand doesn't publish it.
- **Generations:** rackets of the same frame family share `line` and have a sourced `year` (never guessed; `null` if unknown). Set them only when the site has 2+ generations; the `add-racket` skill has the details.
- Cosmetic or limited editions (Laver Cup, Hall of Fame) join their base model's `line` with their own `year`. Start the `model` with the `line` name ("RF 01 Laver Cup 2026"): the generation buttons label each racket as the year plus whatever the model adds to the line name.
- **Photos** go in `docs/img/<racket-id>.<ext>` and are referenced as `image: "img/<racket-id>.<ext>"`. Each photo's file name must match the racket's `id`.

## Fetching data
- wilson.com, head.com, tecnifibre.com, solincosports.com and most Shopify tennis stores return 429 or 403 to curl and WebFetch. For these brands, use retailer listings of the brand's spec. When the listings disagree, use the value most of them give and note the conflict in a comment.
- Brand spec sources that work with curl and a browser User-Agent:
  - Babolat: `https://www.babolat.com/us/x/<product-code>.html` (the slug is ignored). It lists "Weight (unstrung)" and "Balance (unstrung)". The product code is TW's `data-gtm_detail_stock_number`, e.g. `101567`.
  - Yonex: `https://www.yonex.com/tennis/racquets/<line>/<code>`, e.g. `vcore/08vc100`. The line page `…/racquets/<line>` links to every model.
  - Tecnifibre: `https://b2b.tecnifibre.com/en/p/<product-code>.html`, e.g. `14FI305S5`.
  - Dunlop: each product page on `us.dunlopsports.com` (find links on `/dunlop/tennis/rackets/<series>`) has a spec table with the unstrung weight and balance for the whole series.
- Retailer spec sources that work with curl and a browser User-Agent, including for discontinued frames:
  - tennisnuts.com "[Frame Only]" listings: a spec table with "Weight Unstrung", "Balance (+/- 5mm)" (the brand's unstrung spec), "Beam Width" and the brand's product code (`Code: WRT…`).
  - tenniscompanion.org reviews: a spec table with "Unstrung Weight" and "Unstrung Balance".
- tenniswarehouse-europe.com product pages (`descpageRC<BRAND>-<CODE>-EN.html`) list "Unstrung Weight" and "Unstrung Balance". curl gets blocked, but WebFetch works.
- tennis-warehouse.com works with a browser User-Agent:
  - Specs: product pages `…/descpage<RC><BRAND>-<CODE>.html`. Look for `Swingweight: N` in the Specifications block. Older models show the number in the playtest review (`learning_center/racquet_reviews/<CODE>review.html`), under "Babolat RDC Ratings" as `Flex Rating N` and `Swing Weight N`. A review of a cosmetic-only update may reuse the previous version's measurements; say so in the racket's comment.
  - Retired products: the used-racquet page `orderusedproduct.html?pcode=<CODE>` often still has the full Specifications block. An unknown code silently shows a different racket's specs, so confirm the product name on the page. It shows no stock number, so match on the TW code and name.
  - Photos: `https://img.tennis-warehouse.com/new_big/<CODE>-1.jpg`. This is a 1400x2400 two-view (side and face) shot with no watermark, served as a quality-92 WebP with a transparent background even though the URL ends in `.jpg`. Save it as `docs/img/<racket-id>.webp` without re-encoding. Check the real format with `file`: older products return a JPEG instead (some only 700x1200), so save those as `.jpg`. Avoid `watermark/rs.php`, which serves the same image re-encoded as a quality-63 JPEG.
  - The search page is rendered by JavaScript, so use WebSearch with `allowed_domains: ["tennis-warehouse.com"]` to find a racket's page and code.
- To confirm a TW listing is the same racket, match its `data-gtm_detail_stock_number` with the brand's product code.

## Testing
- Headless Chrome (`--headless=new --dump-dom`) can run a test script against a scratch copy of `docs/`. Don't use `--virtual-time-budget`: `<dialog>` close events never fire under it. Use `--timeout=<ms>` and hold the load event with an unreachable `<img>` instead.
