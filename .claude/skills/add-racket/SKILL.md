---
name: add-racket
description: Add one or more tennis rackets to the site (docs/data/rackets.js plus a photo in docs/img/). Use when asked to "add <brand> <model>", "add racket", or to add a new model or year of a racket.
---

# Add a racket

Adds rackets to `docs/data/rackets.js` and saves a photo for each one. The data rules in `CLAUDE.md` always apply, especially: **never guess a spec**, swing weight and stiffness come only from Tennis Warehouse, and balance comes only from the brand (unstrung).

Arguments: one or more racket names, for example `dunlop cx200 tour 2027`.

## 1. Check what's there

```sh
grep -n -i "<brand>" docs/data/rackets.js
ls docs/img | grep -i <brand>
```

- If the racket is already listed, say so and stop.
- Read the brand's section and its `// ---- <Brand> (...) ----` source comment. Follow the source and the `colors` used by sibling models in the same line.

## 2. Get the brand's specs

You need head size, unstrung weight, unstrung balance, beam, length and string pattern. Use the brand source listed under "Fetching data" in `CLAUDE.md`. For blocked brands (Wilson, Head, Solinco, and most Shopify stores), use retailer listings of the brand's spec instead.

Use a browser User-Agent with curl and save pages in the scratchpad directory, not the repo:

```sh
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
curl -sL -A "$UA" "<url>" -o page.html
```

To turn a saved page into searchable text:

```sh
python3 -I -c "
import re,html,sys
t=open(sys.argv[1]).read()
t=re.sub(r'<script.*?</script>|<style.*?</style>','',t,flags=re.S)
t=html.unescape(re.sub(r'<[^>]+>',' ',t)); t=re.sub(r'\s+',' ',t)
for k in sys.argv[2:]:
  i=t.find(k); print(k,'::',t[i:i+800] if i>=0 else 'NOT FOUND')
" page.html "Weight" "Balance"
```

Brand tips:
- Dunlop: the series page (for example `/dunlop/tennis/rackets/cx-series`) links to every product page. Each product page has a series-wide spec table, such as "2027 CX Series", with headsize, weight, balance (mm), length, frame thickness and pattern.
- Babolat, Yonex, Tecnifibre: use the URL patterns in `CLAUDE.md`.
- Balance in mm becomes cm with one decimal place (310 mm → `31.0`).

## 3. Get Tennis Warehouse's swing weight, stiffness and code

Find the product page with WebSearch (`allowed_domains: ["tennis-warehouse.com"]`). The brand's series category page (for example `Dunlop_CX_Racquets/catpage-SCXSERIES.html`) lists every model and year with its `descpage…-<CODE>.html` link, which helps tell years apart.

Fetch the product page and read the Specifications block, starting at `Head Size:`. Take `Swingweight:` (strung) and `Stiffness:`. If the brand doesn't publish a beam, use TW's `Beam Width:`. Don't use TW's balance, which is measured strung.

Confirm it's the same racket: compare `data-gtm_detail_stock_number` with the brand's product code. Some brands, Dunlop included, use different code schemes, so the numbers won't match. In that case, match on the year in the title, head size, beam and pattern, and tell the user you did.

If a value isn't on the product page, check the playtest review (`learning_center/racquet_reviews/<CODE>review.html`). If it isn't there either, use `null`.

## 4. Save the photo

```sh
curl -sL -A "$UA" "https://img.tennis-warehouse.com/new_big/<CODE>-1.jpg" -o docs/img/<id>.webp
file docs/img/<id>.webp
```

If `file` reports JPEG, rename the file to `.jpg`. Never re-encode the image, and never use `watermark/rs.php`.

## 5. Add the entry

The id is `<brand>-<model>-<year>` in lowercase with hyphens (for example `dunlop-cx-200-tour-2027`), and the photo's file name must match it. Put the entry inside its brand section, next to its closest sibling:

```js
  { id: "dunlop-cx-200-tour-2027", brand: "Dunlop", model: "CX 200 Tour (2027)",
    headSize: 95, weight: 310, balance: 31.0, swingweight: 324, swingweightType: "strung", stiffness: 66, beam: "20.5", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-200-tour-2027.webp" },
```

- Write `beam` as a string. A constant beam is `"20.5"`; a variable beam is `"23/26/23"`.
- Unpublished specs are `null`. Put a comment next to the racket for any source exception or any disagreement between listings.
- If the racket uses a new source, update the brand section's source comment.
- **Generations.** If the site already has another generation of the same frame (same family, head size and pattern, e.g. Blade 98 16x19 V9 → V10), add `line: "<family>", year: <model year>` after `model` on the new racket. If the other generations don't have them yet, add them there too. Take the year from the model name, from the brand, or from Tennis Warehouse's product name ("Pure Aero 2026") or review date (`Review date: June 2026` on the `…review.html` page), and note the source in a comment unless it's in the model name. Use `year: null` if no source gives it. Keep `line` the same string across the family. Don't set `line` on a racket with no other generation on the site.

## 6. Verify

```sh
node -e "global.window={};require('./docs/data/rackets.js');const r=window.RACKETS;console.log(r.length,new Set(r.map(x=>x.id)).size)"
```

The two numbers must be equal, which means no duplicate ids. Check that each new `image` file exists.

## 7. Report

Give the specs in a short table with the source of each value, plus links to the pages you used. Mention any identity match you made without a code match, and any `null` values. Don't commit unless the user asks.
