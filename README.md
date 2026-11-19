# PJ Racket
Browse tennis racket specs and compare rackets side by side.

## Features
- Search, filter by brand and head size, and sort by any spec.
- Thumbnail or list view. The site remembers your choice.
- Full-screen photo viewer with zoom and pan.
- Compare rackets side by side. The comparison link is shareable (`#compare=<id>,<id>`).

## View it
No build step. Open `docs/index.html` in a browser, or serve the folder:

```sh
python3 -m http.server -d docs
```

## Layout
- `docs/`: the site root (served as-is).
  - `index.html`, `app.js`, `style.css`: the page.
  - `data/rackets.js`: all racket data, loaded as a plain script so the page also works from `file://`.
  - `img/<racket-id>.<ext>`: product photos. A racket without one gets a drawn SVG instead.

## Data
- Specs come from each brand's own spec sheet or product page. A spec the brand doesn't publish is `null` (shown as "—"). Specs are never guessed.
- **Swing weight** (strung) and **stiffness** are Tennis Warehouse's measurements for every racket. It's one lab measuring every racket the same way, so the numbers compare directly.
- **Balance** is unstrung, from the brand's spec.
- **Beam** comes from the brand, or from Tennis Warehouse when the brand doesn't publish it.
- **Photos** come from Tennis Warehouse at their highest quality (1400x2400 two-view shots).
