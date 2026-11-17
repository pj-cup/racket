# CLAUDE.md

Static site for browsing and comparing tennis rackets. See README.md for the layout.

## Conventions
- `docs/` is the site root (wwwroot). There is no build step and there are no dependencies. Keep `docs/data/rackets.js` a plain `window.RACKETS = [...]` script so `file://` works.
- One object per racket in `rackets.js`, grouped by brand, with a source comment on each brand section.
- **Never guess a spec.** If the source doesn't publish it, use `null`. Note any per-racket source exception in a comment next to that racket.
- **Swing weight** and **stiffness** always come from Tennis Warehouse (swing weight strung, `swingweightType: "strung"`). Don't mix in brand or unstrung numbers.
- **Balance** is always unstrung, from the brand or a retailer listing the brand's spec. Never use Tennis Warehouse's balance, which is strung.
- **Beam** comes from the brand, or from Tennis Warehouse when the brand doesn't publish it.
- **Photos** go in `docs/img/<racket-id>.<ext>` and are referenced as `image: "img/<racket-id>.<ext>"`. Each photo's file name must match the racket's `id`.

## Fetching data
- wilson.com, head.com, tecnifibre.com, solincosports.com and most Shopify tennis stores return 429 or 403 to curl and WebFetch. For these brands, use retailer listings of the brand's spec. When the listings disagree, use the value most of them give and note the conflict in a comment.
- Brand spec sources that work with curl and a browser User-Agent:
  - Babolat: `https://www.babolat.com/us/x/<product-code>.html` (the slug is ignored). It lists "Weight (unstrung)" and "Balance (unstrung)". The product code is TW's `data-gtm_detail_stock_number`, e.g. `101567`.
  - Yonex: `https://www.yonex.com/tennis/racquets/<line>/<code>`, e.g. `vcore/08vc100`. The line page `…/racquets/<line>` links to every model.
  - Tecnifibre: `https://b2b.tecnifibre.com/en/p/<product-code>.html`, e.g. `14FI305S5`.
- tennis-warehouse.com works with a browser User-Agent:
  - Specs: product pages `…/descpage<RC><BRAND>-<CODE>.html`. Look for `Swingweight: N` in the Specifications block. Older models show the number in the playtest review (`learning_center/racquet_reviews/<CODE>review.html`).
  - Photos: `https://img.tennis-warehouse.com/new_big/<CODE>-1.jpg`. This is a 1400x2400 two-view (side and face) shot with no watermark, served as a quality-92 WebP with a transparent background even though the URL ends in `.jpg`. Save it as `docs/img/<racket-id>.webp` without re-encoding. Check the real format with `file`: a few older products return a JPEG instead, so save those as `.jpg`. Avoid `watermark/rs.php`, which serves the same image re-encoded as a quality-63 JPEG.
  - The search page is rendered by JavaScript, so use WebSearch with `allowed_domains: ["tennis-warehouse.com"]` to find a racket's page and code.
- To confirm a TW listing is the same racket, match its `data-gtm_detail_stock_number` with the brand's product code.
