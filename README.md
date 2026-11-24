# PJ Racket
Browse tennis racket specs and compare rackets side by side.

## Features
- Search, filter by brand and head size, set min/max for weight, swing weight, stiffness and balance, and sort by any spec.
- Thumbnail, list or spec map view. The map plots every racket on two specs you pick (weight vs swing weight by default). The site remembers your choice.
- Starting points: one-click presets (Arm-friendly, Maneuverable, Stable & solid, Lightweight) that set the sliders and sort, and show the exact numbers they use.
- Generations: rackets with older versions on the site (e.g. Blade 98 16x19 V7–V10) link to a comparison of the whole line, oldest first, and you can hide older generations.
- Find similar: rank rackets by how close they are to one racket on head size, weight, balance, swing weight and stiffness.
- Full-screen photo viewer with zoom and pan.
- Compare rackets side by side.
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
