# PJ Racket
Browse tennis racket specs and compare rackets side by side.

## Features
- Search, filter by brand and head size, set min/max for weight, swing weight, stiffness and balance, and sort by any spec. Each min/max slider has a histogram of every racket behind it, so you can see where rackets cluster.
- Thumbnail, list, spec map or spec lines view. The site remembers your choice.
  - Cards and list rows show a small bar per spec: where the racket sits between the lowest and highest on the site.
  - The map plots every racket on two specs you pick (weight vs swing weight by default). Arrows link each line's generations, oldest to newest.
  - The spec lines view draws one line per racket across head size, weight, balance, swing weight and stiffness, so you can see trade-offs over all five at once. Active min/max filters show as bands on the axes.
  - Both views can color rackets by brand: Wilson, Head and Babolat get their own color, and the other brands share gray. Click a brand in the legend to highlight it and fade the rest.
- Starting points: one-click presets (Arm-friendly, Maneuverable, Stable & solid, Lightweight) that set the sliders and sort, and show the exact numbers they use.
- Generations: rackets with older versions on the site (e.g. Blade 98 16x19 V7–V10) link to a comparison of the whole line, oldest first, and you can hide older generations.
- Find similar: rank rackets by how close they are to one racket on head size, weight, balance, swing weight and stiffness. The spec bars mark the reference racket's value, and the map numbers the 5 closest and draws spokes to them.
- Full-screen photo viewer with zoom and pan.
- Compare rackets side by side. A spec profile above the table shows where each racket sits among all rackets on the five main specs. When you compare generations of one line, small charts also show how each spec changed by year.
- Every view is a shareable link: the browse filters, sort and view live in the URL hash, and so does a comparison (`#compare=<id>,<id>`).

## View it
No build step. Open `docs/index.html` in a browser, or serve the folder:

```sh
python3 -m http.server -d docs
```

## Layout
- `docs/`: the site root (served as-is).
  - `index.html`, `app.js`, `style.css`: the page. Spec icons are [Lucide](https://lucide.dev) line icons (ISC), inlined in `app.js`.
  - `data/rackets.js`: all racket data, loaded as a plain script so the page also works from `file://`.
  - `img/<racket-id>.<ext>`: product photos. A racket without one gets a drawn SVG instead.

## Data
- Specs come from each brand's own spec sheet or product page. A spec the brand doesn't publish is `null` (shown as "—"). Specs are never guessed.
- **Swing weight** (strung) and **stiffness** are Tennis Warehouse's measurements for every racket. It's one lab measuring every racket the same way, so the numbers compare directly.
- **Balance** is unstrung, from the brand's spec.
- **Beam** comes from the brand, or from Tennis Warehouse when the brand doesn't publish it.
- **Photos** come from Tennis Warehouse at their highest quality (1400x2400 two-view shots).
