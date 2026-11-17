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
- wilson.com, head.com, tecnifibre.com and most Shopify tennis stores return 429 or 403 to curl and WebFetch.
- tennis-warehouse.com works with a browser User-Agent:
  - Specs: product pages `…/descpage<RC><BRAND>-<CODE>.html`. Look for `Swingweight: N` in the Specifications block. Older models show the number in the playtest review (`learning_center/racquet_reviews/<CODE>review.html`).
  - Photos: `https://img.tennis-warehouse.com/watermark/rs.php?path=<CODE>-1.jpg&nw=1400`. This is a two-view (side and face) shot with no watermark.
  - The search page is rendered by JavaScript, so use WebSearch with `allowed_domains: ["tennis-warehouse.com"]` to find a racket's page and code.
- To confirm a TW listing is the same racket, match its `data-gtm_detail_stock_number` with the brand's product code.
