(() => {
  const MAX = 4;
  const data = window.RACKETS || [];
  const byId = new Map(data.map(r => [r.id, r]));
  const $ = id => document.getElementById(id);

  // Balance in points head-light (positive) / head-heavy (negative): 1 pt = 1/8 in.
  const balancePts = r => ((r.length * 2.54) / 2 - r.balance) / 0.3175;
  const NA = "—"; // spec the brand doesn't publish
  const has = v => v !== null && v !== undefined;
  const fmtBalance = r => {
    if (!has(r.balance)) return NA;
    return ptsLabel(Math.round(balancePts(r))); // the cm value is shown as `sub` in the compare table
  };
  const pts = n => n + (n === 1 ? " pt" : " pts");
  const ptsLabel = p => p === 0 ? "even" : p > 0 ? pts(p) + " HL" : pts(-p) + " HH";

  // hint: one-line "what it means" shown in the compare table.
  // delta(r, a): difference from racket A, as text (compare table only).
  const signed = (d, unit) => (d > 0 ? "+" : "−") + Math.abs(+d.toFixed(1)) + unit;
  const FIELDS = [
    { key: "headSize", icon: "target", label: "Head size",  unit: " sq in", num: r => r.headSize,
      hint: "Bigger = more forgiving, less precise", extremes: ["Biggest", "Smallest"], delta: (r, a) => signed(r.headSize - a.headSize, " sq in") },
    { key: "weight", icon: "dumbbell", label: "Weight",     unit: " g", num: r => r.weight,
      hint: "Unstrung. Heavier = more stable, more effort", extremes: ["Heaviest", "Lightest"], delta: (r, a) => signed(r.weight - a.weight, " g") },
    { key: "balance", icon: "scale", label: "Balance",    fmt: fmtBalance, num: r => has(r.balance) ? balancePts(r) : null, scale: v => ptsLabel(Math.round(v)),
      sub: r => has(r.balance) ? `${r.balance.toFixed(1)} cm` : "",
      hint: "Unstrung. More pts HL = quicker hands, less plow", extremes: ["Most HL", "Least HL"],
      delta: (r, a) => { const d = Math.round(balancePts(r)) - Math.round(balancePts(a)); return d === 0 ? "" : `${pts(Math.abs(d))} ${d > 0 ? "more" : "less"} HL`; } },
    // Every racket uses Tennis Warehouse strung swing weight, so they compare directly (group kept as a guard).
    { key: "swingweight", icon: "wind", label: "Swing weight", fmt: r => has(r.swingweight) ? `${r.swingweight}` : NA,
      num: r => r.swingweight, group: r => r.swingweightType, extremes: ["Highest", "Lowest"],
      hint: "Strung. Higher = more power and stability, slower to swing", delta: (r, a) => signed(r.swingweight - a.swingweight, "") },
    { key: "stiffness", icon: "biceps-flexed", label: "Stiffness",  unit: " RA", num: r => r.stiffness,
      hint: "Higher = more power, less comfort", extremes: ["Stiffest", "Softest"], delta: (r, a) => signed(r.stiffness - a.stiffness, " RA") },
    { key: "pattern", icon: "grid-3x3", label: "String pattern", hint: "Open (16x19) = more spin; dense (18x20) = more control" },
    { key: "beam", icon: "triangle-right", label: "Beam",       unit: " mm", hint: "Thicker = more power, less feel" },
    { key: "length", icon: "ruler", label: "Length",     unit: " in", num: r => r.length, extremes: ["Longest", "Shortest"], delta: (r, a) => signed(r.length - a.length, " in") },
  ];
  const TABLE_GROUPS = [
    { name: "Feel",  keys: ["weight", "balance", "swingweight", "stiffness"] },
    { name: "Frame", keys: ["headSize", "pattern", "beam", "length"] },
  ];
  const LETTERS = "ABCD";
  FIELDS.forEach(f => { if (!f.fmt) f.fmt = r => has(r[f.key]) ? `${r[f.key]}${f.unit || ""}` : NA; });
  const CARD_FIELDS = ["headSize", "weight", "balance", "swingweight", "stiffness", "pattern"];

  // Dataset-wide range per numeric field, for the comparison bars.
  const ranges = {};
  FIELDS.filter(f => f.num).forEach(f => {
    const vals = data.map(f.num).filter(has);
    ranges[f.key] = [Math.min(...vals), Math.max(...vals)];
  });
  const field = key => FIELDS.find(f => f.key === key);

  // Min/max filters ("More filters"). Balance filters on the whole pts HL shown on the cards.
  const RANGE_FIELDS = [
    { key: "weight" }, { key: "swingweight" }, { key: "stiffness" }, { key: "balance", unit: "pts HL", round: true },
  ].map(rf => { const f = field(rf.key); return { ...rf, f, unit: rf.unit ?? (f.unit || "").trim() }; });
  const rangeVal = (rf, v) => !has(v) ? null : rf.round ? Math.round(v) : v;
  // "Find similar": distance between two rackets over these specs, each scaled by its spread across all rackets
  // (z-scores), as a root mean square over the specs both rackets publish. Fewer than 3 shared specs: not ranked.
  const SIM_KEYS = ["headSize", "weight", "balance", "swingweight", "stiffness"];
  const simStats = SIM_KEYS.map(k => {
    const f = field(k), vals = data.map(f.num).filter(has);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length) || 1;
    return { f, sd };
  });
  function distance(a, b) {
    let sum = 0, n = 0;
    simStats.forEach(({ f, sd }) => {
      const va = f.num(a), vb = f.num(b);
      if (has(va) && has(vb)) { sum += ((va - vb) / sd) ** 2; n++; }
    });
    return n >= 3 ? Math.sqrt(sum / n) : Infinity;
  }
  // Short "how it differs" line vs the reference racket, e.g. "+5 g · 1 pt more HL · +8 SW".
  const simDiff = (r, ref) => simStats.map(({ f }) => {
    const a = f.num(r), b = f.num(ref);
    if (!has(a) || !has(b) || a === b) return "";
    const d = f.delta(r, ref); // "" when balance differs in cm but not in whole pts
    return d && f.key === "swingweight" ? d + " SW" : d;
  }).filter(Boolean).join(" · ") || "Same specs";
  let similarId = null; // set: the browse list is sorted by closeness to this racket


  let selected = [];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Spec icons: single-color line icons from Lucide (lucide.dev, ISC), inlined so they take the text color.
  const ICONS = {
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    dumbbell: '<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    "biceps-flexed": '<path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/><path d="M15 14a5 5 0 0 0-7.584 2"/><path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/>',
    "grid-3x3": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    "triangle-right": '<path d="M22 18a2 2 0 0 1-2 2H3c-1.1 0-1.3-.6-.4-1.3L20.4 4.3c.9-.7 1.6-.4 1.6.7Z"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  };
  // Define each icon once as a <symbol>; every use is a short <use> reference (cards re-render on each filter change).
  document.body.insertAdjacentHTML("afterbegin", `<svg style="display:none">${Object.entries(ICONS)
    .map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`).join("")}</svg>`);
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // ---------- Racket image ----------
  // Real photo if `image` is set, else an SVG drawn from specs: head scaled by head size,
  // string grid from the pattern, colors from `colors: [frame, grip]`.
  let svgSeq = 0;
  function racketImage(r, drawOnly, eager) {
    if (r.image && !drawOnly) {
      return `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" loading="${eager ? "eager" : "lazy"}" decoding="async" referrerpolicy="no-referrer">`;
    }
    const [frame, grip] = r.colors || ["#888", "#333"];
    const s = Math.sqrt(r.headSize / 100);
    const cx = 200, cy = 60, rx = 64 * s, ry = 47 * s;
    const [mains, crosses] = r.pattern.split("x").map(Number);
    const clip = "rk" + (++svgSeq);
    const ix = rx - 5, iy = ry - 5;
    let strings = "";
    for (let i = 1; i <= mains; i++) { const y = cy - iy + (2 * iy * i) / (mains + 1); strings += `M${cx - ix} ${y.toFixed(1)}H${cx + ix}`; }
    for (let i = 1; i <= crosses; i++) { const x = cx - ix + (2 * ix * i) / (crosses + 1); strings += `M${x.toFixed(1)} ${cy - iy}V${cy + iy}`; }
    const a = (150 * Math.PI) / 180; // where the throat arms meet the hoop
    const tx = (cx + rx * Math.cos(a)).toFixed(1), ty1 = (cy - ry * Math.sin(a)).toFixed(1), ty2 = (cy + ry * Math.sin(a)).toFixed(1);
    return `<svg viewBox="0 0 300 120" role="img" aria-label="${esc(r.brand + " " + r.model)} illustration">
      <defs><clipPath id="${clip}"><ellipse cx="${cx}" cy="${cy}" rx="${ix}" ry="${iy}"/></clipPath></defs>
      <path d="${strings}" clip-path="url(#${clip})" stroke="var(--strings)" stroke-width="0.8" fill="none"/>
      <path d="M${tx} ${ty1}L96 56M${tx} ${ty2}L96 64" stroke="${frame}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 1.5}" ry="${ry - 1.5}" stroke="${frame}" stroke-width="7" fill="none"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 1.5}" ry="${ry - 1.5}" stroke="var(--frame-edge)" stroke-width="1" fill="none"/>
      <rect x="18" y="53" width="80" height="14" rx="3" fill="${grip}"/>
      <rect x="12" y="51" width="9" height="18" rx="2" fill="${frame}" stroke="var(--frame-edge)" stroke-width="1"/>
    </svg>`;
  }

  // Clickable picture box → opens the full-screen viewer.
  const picBox = (r, cls) =>
    `<div class="pic ${cls}" data-zoom="${esc(r.id)}" role="button" tabindex="0" aria-label="View ${esc(r.brand + " " + r.model)} full screen">${racketImage(r, false, cls === "small")}</div>`;

  // Browse picture: clicking the photo picks the racket for compare; the magnifier opens the full-screen viewer.
  const browsePic = (r, cls, on, full) => {
    const name = esc(r.brand + " " + r.model);
    return `<div class="pic-wrap">
      <button type="button" class="pic pick ${cls}" data-id="${esc(r.id)}" aria-pressed="${on}"
        aria-label="${on ? `Remove ${name} from compare` : `Add ${name} to compare`}"${!on && full ? ` disabled title="Up to 4 rackets"` : ""}>
        ${racketImage(r, false, cls === "small")}<span class="badge" aria-hidden="true">${on ? "✓" : "+"}</span>
      </button>
      <button type="button" class="zoom-btn" data-zoom="${esc(r.id)}" aria-label="View ${name} full screen" title="Zoom">
        <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14M5 7h4M7 5v4"/></svg>
      </button>
      <button type="button" class="zoom-btn similar-btn" data-similar="${esc(r.id)}" aria-label="Find rackets similar to ${name}" title="Find similar">
        <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="8" r="4.2"/><circle cx="10" cy="8" r="4.2"/></svg>
      </button>
    </div>`;
  };

  // ---------- Full-screen viewer ----------
  function openZoom(id) {
    const r = byId.get(id);
    if (!r) return;
    const keySpecs = ["headSize", "weight", "balance", "pattern"]
      .map(k => { const f = field(k); return `${icon(f.icon)}${esc(f.fmt(r))}`; }).join(" · ");
    $("zoomPic").className = "zoom-pic" + (r.image ? " photo" : "");
    $("zoomPic").innerHTML = r.image
      ? `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" referrerpolicy="no-referrer">`
      : racketImage(r, true);
    $("zoomTitle").innerHTML = `<span class="brand">${esc(r.brand)}</span>${esc(r.model)}`;
    $("zoomMeta").innerHTML = keySpecs;
    $("zoomSimilar").dataset.similar = r.id;
    $("zoom").showModal();
    zoomTo(1);
  }

  // Zoom inside the viewer: click/tap toggles, wheel and pinch zoom at the pointer, drag pans, buttons and +/−/0 keys.
  const ZMIN = 1, ZMAX = 5, ZSTEP = 1.5, ZTAP = 2.5;
  let zs = 1, zx = 0, zy = 0;
  const zoomEl = () => $("zoomPic").firstElementChild;
  function zoomApply() {
    const el = zoomEl(), box = $("zoomPic");
    if (!el) return;
    // Keep the picture covering the box: pan at most half of the extra size each way.
    const mx = (zs - 1) * el.offsetWidth / 2, my = (zs - 1) * el.offsetHeight / 2;
    zx = Math.max(-mx, Math.min(mx, zx));
    zy = Math.max(-my, Math.min(my, zy));
    el.style.transform = zs === 1 ? "" : `translate(${zx}px, ${zy}px) scale(${zs})`;
    box.classList.toggle("zoomed", zs > 1);
    $("zoomReset").textContent = Math.round(zs * 100) + "%";
    $("zoomOut").disabled = zs <= ZMIN;
    $("zoomIn").disabled = zs >= ZMAX;
  }
  // Zoom to scale s, keeping the screen point (px, py) — relative to the box centre — fixed.
  function zoomTo(s, px = 0, py = 0) {
    s = Math.max(ZMIN, Math.min(ZMAX, s));
    if (s === 1) { zx = zy = 0; }
    else { zx = px - (px - zx) * s / zs; zy = py - (py - zy) * s / zs; }
    zs = s;
    zoomApply();
  }
  function fromCentre(e) {
    const b = $("zoomPic").getBoundingClientRect();
    return [e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2];
  }
  const pointers = new Map();
  let dragged = false, pinchStart = null;
  $("zoomPic").addEventListener("pointerdown", e => {
    pointers.set(e.pointerId, e);
    $("zoomPic").setPointerCapture(e.pointerId);
    dragged = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: zs };
    }
  });
  $("zoomPic").addEventListener("pointermove", e => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    pointers.set(e.pointerId, e);
    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const [px, py] = fromCentre({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 });
      zoomTo(pinchStart.s * d / pinchStart.d, px, py);
      dragged = true;
    } else if (pointers.size === 1 && zs > 1) {
      const dx = e.clientX - prev.clientX, dy = e.clientY - prev.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 0) { zx += dx; zy += dy; zoomApply(); }
      if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
    }
  });
  const pointerUp = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = null; };
  $("zoomPic").addEventListener("pointerup", pointerUp);
  $("zoomPic").addEventListener("pointercancel", pointerUp);
  $("zoomPic").addEventListener("click", e => {
    if (dragged) { dragged = false; return; }
    const [px, py] = fromCentre(e);
    zoomTo(zs > 1 ? 1 : ZTAP, px, py);
  });
  $("zoomPic").addEventListener("wheel", e => {
    e.preventDefault();
    const [px, py] = fromCentre(e);
    zoomTo(zs * Math.exp(-e.deltaY * 0.002), px, py);
  }, { passive: false });
  $("zoomIn").addEventListener("click", () => zoomTo(zs * ZSTEP));
  $("zoomOut").addEventListener("click", () => zoomTo(zs / ZSTEP));
  $("zoomReset").addEventListener("click", () => zoomTo(1));
  $("zoom").addEventListener("keydown", e => {
    if (e.key === "+" || e.key === "=") zoomTo(zs * ZSTEP);
    else if (e.key === "-") zoomTo(zs / ZSTEP);
    else if (e.key === "0") zoomTo(1);
  });

  // ---------- Browse ----------
  [...new Set(data.map(r => r.brand))].sort().forEach(b => {
    $("brand").insertAdjacentHTML("beforeend", `<option>${esc(b)}</option>`);
  });

  $("rangeInputs").innerHTML = RANGE_FIELDS.map(rf => {
    const [lo, hi] = ranges[rf.key];
    const name = rf.f.label + (rf.unit ? ` (${rf.unit})` : "");
    return `<div class="range-field"><span class="range-label">${icon(rf.f.icon)}${esc(name)}</span>
      <input id="min-${rf.key}" type="number" inputmode="decimal" step="1" placeholder="${rangeVal(rf, lo)}" aria-label="${esc(name)} minimum">
      <span class="muted" aria-hidden="true">–</span>
      <input id="max-${rf.key}" type="number" inputmode="decimal" step="1" placeholder="${rangeVal(rf, hi)}" aria-label="${esc(name)} maximum"></div>`;
  }).join("");

  // Active min/max filters: [{ rf, min, max, lo, hi }]: min/max as typed, lo/hi as numbers with open ends at ±Infinity.
  function activeRanges() {
    return RANGE_FIELDS.map(rf => {
      const min = $("min-" + rf.key).value.trim(), max = $("max-" + rf.key).value.trim();
      if (min === "" && max === "") return null;
      return { rf, min, max, lo: min === "" ? -Infinity : +min, hi: max === "" ? Infinity : +max };
    }).filter(Boolean);
  }

  // The browse list for the current controls: { list, ref, hiddenNoSpec }.
  // ref: the similar-mode reference, kept out of `list` (shown first whatever the filters say).
  // hiddenNoSpec: rackets dropped by a min/max filter only because the brand doesn't publish that spec.
  function filtered(active) {
    const words = $("q").value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const brand = $("brand").value;
    const head = $("head").value;
    const sort = $("sort").value;
    const ref = similarId ? byId.get(similarId) : null;
    let hiddenNoSpec = 0;
    let list = data.filter(r => {
      if (brand && r.brand !== brand) return false;
      const text = `${r.brand} ${r.model}`.toLowerCase();
      if (!words.every(w => text.includes(w))) return false; // every word, any order
      if (head) {
        const [lo, hi] = head.split("-").map(Number);
        if (r.headSize < lo || r.headSize > hi) return false;
      }
      const vals = active.map(a => rangeVal(a.rf, a.rf.f.num(r)));
      if (active.some((a, i) => has(vals[i]) && (vals[i] < a.lo || vals[i] > a.hi))) return false;
      if (vals.some(v => !has(v))) { hiddenNoSpec++; return false; }
      return true;
    });
    if (ref) {
      const dist = new Map(list.map(r => [r.id, distance(r, ref)]));
      list = list.filter(r => r !== ref).sort((a, b) => dist.get(a.id) - dist.get(b.id));
      return { list, ref, hiddenNoSpec };
    }
    const cmp = sort === "brand" ? (a, b) => (a.brand + a.model).localeCompare(b.brand + b.model)
      : sort === "pattern" ? (a, b) => a.pattern.localeCompare(b.pattern, undefined, { numeric: true })
      : sort === "balance" ? (a, b) => balancePts(a) - balancePts(b) // by the points shown, which also depend on length
      : (a, b) => a[sort] - b[sort];
    const key = sort === "brand" ? "model" : sort;
    list.sort((a, b) => !has(a[key]) ? (has(b[key]) ? 1 : 0) : !has(b[key]) ? -1 : sortDir * cmp(a, b)); // unpublished values last
    return { list, ref, hiddenNoSpec };
  }

  // Sort direction: 1 ascending, -1 descending. List view's column headers toggle it; the Sort menu resets it.
  let sortDir = 1;
  function sortBy(key) {
    if ($("sort").value === key) sortDir = -sortDir;
    else { $("sort").value = key; sortDir = 1; similarId = null; }
    renderGrid();
  }

  // Browse view: "grid" (thumbnails) or "list" (one row per racket). Remembered per browser.
  const VIEWS = ["grid", "list", "map"];
  let view = "grid";
  try { const v = localStorage.getItem("view"); if (VIEWS.includes(v)) view = v; } catch {}

  // Under each name in similar mode: "Reference", or how the racket differs from it.
  const simNote = (r, ref) => !ref ? "" : r === ref ? `<div class="sim ref">Reference</div>`
    : `<div class="sim">${esc(simDiff(r, ref))}</div>`;
  const NONE = `<p class="muted">No rackets match.</p>`;

  function renderGrid() {
    const active = activeRanges();
    const { list: found, ref, hiddenNoSpec } = filtered(active);
    const list = ref ? [ref, ...found] : found;
    $("count").textContent = `${found.length} of ${data.length} rackets` + (ref ? " + reference" : "") +
      (hiddenNoSpec ? ` (${hiddenNoSpec} hidden: spec not published)` : "") + (view === "map" ? " · Click a dot to compare" : " · Click a photo to compare");
    $("moreCount").textContent = active.length ? ` (${active.length})` : "";
    if (ref) $("sort").value = "similar"; // the hidden option, so the menu reads "Most similar"
    $("similarBanner").hidden = !ref;
    if (ref) $("similarName").textContent = `${ref.brand} ${ref.model}`;
    writeBrowseHash(active);
    const full = selected.length >= MAX;
    $("grid").className = view;
    document.querySelectorAll(".view-toggle [data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === view));
    if (view === "list") return renderList(list, full, ref);
    if (view === "map") return renderMap(list, full, ref);
    $("grid").innerHTML = list.map(r => {
      const on = selected.includes(r.id);
      const rows = FIELDS.filter(f => CARD_FIELDS.includes(f.key))
        .map(f => `<dt>${icon(f.icon)}${f.label}</dt><dd>${esc(f.fmt(r))}</dd>`).join("");
      return `<article class="card${on ? " selected" : ""}">
        ${browsePic(r, "", on, full)}
        <div><div class="brand">${esc(r.brand)}</div><h3>${esc(r.model)}</h3>${simNote(r, ref)}</div>
        <dl class="specs">${rows}</dl>
      </article>`;
    }).join("") || NONE;
  }

  function renderList(list, full, ref) {
    const fields = FIELDS.filter(f => CARD_FIELDS.includes(f.key));
    if (!list.length) { $("grid").innerHTML = NONE; return; }
    const sort = $("sort").value;
    const th = (key, text) => {
      const on = sort === key, arrow = on ? (sortDir > 0 ? "▲" : "▼") : "";
      return `<button type="button" class="sort-head${on ? " on" : ""}" data-sort="${key}" title="Sort by ${esc(text)}"${
        on ? ` aria-label="Sorted by ${esc(text)}, ${sortDir > 0 ? "ascending" : "descending"}"` : ""}>${esc(text)}${on ? `\u2060<span class="arrow" aria-hidden="true">${arrow}</span>` : ""}</button>`;
    };
    const head = `<div class="list-head"><span></span>${th("brand", "Racket")}<div class="row-specs">${
      fields.map(f => th(f.key, f.label)).join("")}</div></div>`;
    $("grid").innerHTML = head + list.map(r => {
      const on = selected.includes(r.id);
      const specs = fields.map(f => `<div class="spec" data-label="${esc(f.label)}">${esc(f.fmt(r))}</div>`).join("");
      return `<article class="row${on ? " selected" : ""}">
        ${browsePic(r, "small", on, full)}
        <div class="name"><div class="brand">${esc(r.brand)}</div><h3>${esc(r.model)}</h3>${simNote(r, ref)}</div>
        <div class="row-specs">${specs}</div>
      </article>`;
    }).join("");
  }

  // ---------- Spec map (scatter of two specs) ----------
  // Axes cover every racket's range (not just the filtered ones), so dots keep their place as you filter.
  const MAP_AXES = {
    weight: "Weight (g, unstrung)", swingweight: "Swing weight (strung)", balance: "Balance (pts head-light, unstrung)",
    stiffness: "Stiffness (RA)", headSize: "Head size (sq in)", length: "Length (in)",
  };
  let mapX = "weight", mapY = "swingweight";
  function niceTicks(lo, hi, n) {
    const raw = (hi - lo) / n, mag = 10 ** Math.floor(Math.log10(raw)), e = raw / mag;
    const step = mag * (e < 1.5 ? 1 : e < 3 ? 2 : e < 7 ? 5 : 10);
    const ticks = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(+v.toFixed(6));
    return ticks;
  }
  const axisSelect = (axis, cur) => `<label>${axis.toUpperCase()} <select data-axis="${axis}" aria-label="${axis === "x" ? "Horizontal" : "Vertical"} axis">${
    Object.keys(MAP_AXES).map(k => `<option value="${k}"${k === cur ? " selected" : ""}>${esc(field(k).label)}</option>`).join("")}</select></label>`;

  function renderMap(list, full, ref) {
    const fx = field(mapX), fy = field(mapY);
    const shown = list.filter(r => has(fx.num(r)) && has(fy.num(r)));
    const W = Math.max(300, $("grid").clientWidth), H = Math.round(Math.min(560, Math.max(320, W * 0.6)));
    const narrow = W < 500;
    const m = { l: narrow ? 46 : 58, r: 14, t: 14, b: 46 };
    const dom = k => { const [lo, hi] = ranges[k]; const pad = (hi - lo) * 0.06 || 1; return [lo - pad, hi + pad]; };
    const [x0, x1] = dom(mapX), [y0, y1] = dom(mapY);
    const sx = v => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r);
    const sy = v => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
    const tickTxt = v => +v.toFixed(2);
    const xt = niceTicks(x0, x1, narrow ? 4 : 7), yt = niceTicks(y0, y1, 6);
    let g = xt.map(v => `<line class="grid-line" x1="${sx(v)}" x2="${sx(v)}" y1="${m.t}" y2="${H - m.b}"/><text class="tick" x="${sx(v)}" y="${H - m.b + 16}" text-anchor="middle">${tickTxt(v)}</text>`).join("")
      + yt.map(v => `<line class="grid-line" x1="${m.l}" x2="${W - m.r}" y1="${sy(v)}" y2="${sy(v)}"/><text class="tick" x="${m.l - 8}" y="${sy(v) + 4}" text-anchor="end">${tickTxt(v)}</text>`).join("")
      + `<text class="axis-title" x="${(m.l + W - m.r) / 2}" y="${H - 8}" text-anchor="middle">${esc(MAP_AXES[mapX])}</text>`
      + `<text class="axis-title" transform="translate(13 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">${esc(MAP_AXES[mapY])}</text>`;

    // Rackets with the same two values would hide each other: fan them out in a small ring.
    const pos = new Map(), groups = new Map();
    shown.forEach(r => {
      const k = `${fx.num(r).toFixed(3)}|${fy.num(r).toFixed(3)}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    });
    groups.forEach(rs => rs.forEach((r, i) => {
      const rad = rs.length > 1 ? Math.min(10, 3 + rs.length) : 0, a = (2 * Math.PI * i) / rs.length - Math.PI / 2;
      pos.set(r.id, [sx(fx.num(r)) + rad * Math.cos(a), sy(fy.num(r)) + rad * Math.sin(a)]);
    }));

    const rank = r => selected.includes(r.id) || r === ref ? 1 : 0;
    const dots = [...shown].sort((a, b) => rank(a) - rank(b)).map(r => {
      const [x, y] = pos.get(r.id), i = selected.indexOf(r.id), on = i >= 0;
      const name = `${r.brand} ${r.model}`;
      const cls = "dot" + (on ? " on" : "") + (r === ref ? " ref" : "") + (!on && full ? " full" : "");
      let label = "";
      if (on || r === ref) {
        const right = x < W - 170;
        label = `<text class="dot-label" x="${x + (right ? 10 : -10)}" y="${y + 4}" text-anchor="${right ? "start" : "end"}">${on ? LETTERS[i] + " · " : ""}${esc(r.model)}</text>`;
      }
      return `<g class="${cls}" data-dot="${esc(r.id)}" tabindex="0" role="button" aria-pressed="${on}"${!on && full ? ' aria-disabled="true"' : ""}
        aria-label="${esc(`${name}: ${fx.label} ${fx.fmt(r)}, ${fy.label} ${fy.fmt(r)}. ${on ? "Remove from" : "Add to"} compare`)}">
        <circle class="hit" cx="${x}" cy="${y}" r="12"/>${r === ref ? `<circle class="ring" cx="${x}" cy="${y}" r="9"/>` : ""}
        <circle class="mark" cx="${x}" cy="${y}" r="${on ? 6 : 4.5}"/>${on ? `<text class="dot-letter" x="${x}" y="${y + 3}" text-anchor="middle">${LETTERS[i]}</text>` : ""}${label}</g>`;
    }).join("");

    const missing = list.length - shown.length;
    const legend = `<span class="key"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="mark" cx="6" cy="6" r="4"/></svg>Racket</span>`
      + `<span class="key on"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="mark" cx="6" cy="6" r="5"/></svg>Picked for compare</span>`
      + (ref ? `<span class="key ref"><svg viewBox="0 0 20 20" aria-hidden="true"><circle class="ring" cx="10" cy="10" r="8"/><circle class="mark" cx="10" cy="10" r="4"/></svg>Reference</span>` : "");
    $("grid").innerHTML = `<div class="map-bar">${axisSelect("x", mapX)}${axisSelect("y", mapY)}<div class="map-legend">${legend}</div></div>
      <div class="map-plot"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(`${fy.label} against ${fx.label}`)}">
        <g aria-hidden="true">${g}</g>${dots}</svg><div id="mapTip" class="map-tip" role="tooltip" hidden></div></div>
      ${missing ? `<p class="muted map-note">${missing} racket${missing > 1 ? "s" : ""} not shown: ${esc(fx.label.toLowerCase())} or ${esc(fy.label.toLowerCase())} not published.</p>` : ""}
      ${list.length ? "" : NONE}`;
  }

  let tipDot = null; // the dot the tooltip is showing, so moving within one dot doesn't rebuild it
  function showTip(g) {
    const tip = $("mapTip"), r = byId.get(g?.dataset.dot);
    if (!tip || (g && g === tipDot)) return;
    tipDot = g;
    if (!r) { tip.hidden = true; return; }
    const fx = field(mapX), fy = field(mapY), on = selected.includes(r.id);
    tip.innerHTML = `<span class="brand">${esc(r.brand)}</span><strong>${esc(r.model)}</strong>
      <span>${esc(fx.label)}: ${esc(fx.fmt(r))}</span><span>${esc(fy.label)}: ${esc(fy.fmt(r))}</span>
      <span class="muted">${on ? "Click to remove from compare" : g.classList.contains("full") ? "Up to 4 rackets" : "Click to add to compare"}</span>`;
    tip.hidden = false;
    const c = g.querySelector(".mark"), box = tip.parentElement;
    const x = +c.getAttribute("cx"), y = +c.getAttribute("cy");
    const left = Math.min(Math.max(0, x - tip.offsetWidth / 2), box.clientWidth - tip.offsetWidth);
    tip.style.left = left + "px";
    tip.style.top = (y - tip.offsetHeight - 14 < 0 ? y + 16 : y - tip.offsetHeight - 14) + "px";
  }

  function renderTray() {
    $("tray").hidden = selected.length === 0 || !$("compare").hidden;
    $("trayItems").innerHTML = selected.map(id => {
      const r = byId.get(id);
      return `<span class="chip">${esc(r.brand)} ${esc(r.model)}<button data-remove="${esc(id)}" aria-label="Remove">×</button></span>`;
    }).join("");
    $("go").disabled = selected.length < 2;
    $("go").textContent = selected.length < 2 ? "Pick at least 2" : `Compare ${selected.length}`;
  }

  function toggle(id) {
    const i = selected.indexOf(id);
    if (i >= 0) selected.splice(i, 1);
    else if (selected.length < MAX) selected.push(id);
    sync();
  }

  // ---------- Compare ----------
  // Columns are labelled A–D; each value shows its difference from A and a dot for
  // where it sits among all rackets (min/max printed under the row label).
  function renderTable() {
    const rs = selected.map(id => byId.get(id));
    const a = rs[0];
    const diffOnly = $("diffOnly").checked;
    const head = `<thead><tr><th class="corner"><span class="muted">Specs</span></th>${rs.map((r, i) =>
      `<th>${picBox(r, "small")}<span class="letter">${LETTERS[i]}</span><span class="brand">${esc(r.brand)}</span><span class="model">${esc(r.model)}</span><button class="remove" data-remove="${esc(r.id)}" aria-label="Remove ${esc(r.brand + " " + r.model)}">×</button></th>`
    ).join("")}</tr></thead>`;

    const row = f => {
      const vals = rs.map(f.fmt);
      const subs = rs.map(r => f.sub ? f.sub(r) : "");
      const differs = new Set(vals.map((v, i) => v + subs[i])).size > 1;
      if (diffOnly && !differs) return "";
      const comparable = !f.group || new Set(rs.filter(r => has(f.num(r))).map(f.group)).size <= 1;
      const [lo, hi] = f.num ? ranges[f.key] : [0, 0];
      const scaleTxt = v => f.scale ? f.scale(v) : `${+v.toFixed(1)}${f.unit || ""}`;
      // Highest / lowest among the selected rackets (ties all tagged); none when they're all equal.
      const tags = rs.map(() => "");
      if (f.extremes && comparable) {
        const nums = rs.map(r => has(f.num(r)) ? +f.num(r).toFixed(3) : null);
        const known = nums.filter(has);
        const mx = Math.max(...known), mn = Math.min(...known);
        if (known.length >= 2 && mx > mn) nums.forEach((n, i) => { tags[i] = n === mx ? f.extremes[0] : n === mn ? f.extremes[1] : ""; });
      }
      const range = f.num && hi > lo ? `<span class="range">All rackets: ${esc(scaleTxt(lo))} – ${esc(scaleTxt(hi))}</span>` : "";
      const cells = rs.map((r, i) => {
        let html = `<div class="val">${esc(vals[i])}</div>`;
        if (subs[i]) html += `<div class="sub">${esc(subs[i])}</div>`;
        if (f.delta && has(f.num(r)) && has(f.num(a)) && comparable) {
          // Column A gets an empty line so every column's dot sits at the same height.
          const d = i === 0 ? "" : vals[i] + subs[i] === vals[0] + subs[0] ? "same as A" : (f.delta(r, a) || "same pts, different cm") + " vs A";
          html += `<div class="delta">${esc(d) || "&nbsp;"}</div>`;
        }
        // Every column gets the tag line when any does, so the dots stay level.
        if (tags.some(Boolean)) html += `<div class="tag-line">${tags[i] ? `<span class="tag">${esc(tags[i])}</span>` : "&nbsp;"}</div>`;
        if (f.num && has(f.num(r)) && comparable && hi > lo) {
          const pct = (100 * (f.num(r) - lo)) / (hi - lo);
          html += `<div class="track" aria-hidden="true"><span style="left:${pct.toFixed(1)}%"></span></div>`;
        }
        return `<td>${html}</td>`;
      }).join("");
      return `<tr class="${differs ? "" : "same"}"><th scope="row">${icon(f.icon)}${f.label}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}${range}</th>${cells}</tr>`;
    };

    const body = TABLE_GROUPS.map(g => {
      const rows = g.keys.map(k => row(field(k))).join("");
      return rows ? `<tr class="group"><th colspan="${rs.length + 1}" scope="colgroup">${g.name}</th></tr>${rows}` : "";
    }).join("");

    $("table").dataset.cols = rs.length;
    $("table").innerHTML = head + `<tbody>${body || `<tr><td colspan="${rs.length + 1}" class="muted">No differences.</td></tr>`}</tbody>`;
  }

  // ---------- Routing ----------
  // #compare=id1,id2 shows the compare table. Any other hash is the browse view's state
  // (#q=…&brand=…&sort=…&weight=290~310…), kept up to date as you filter, so a browse link is shareable too.
  let browseHash = ""; // last browse state, so leaving compare returns to it

  function readBrowseHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    const setSelect = (id, v) => { $(id).value = v; if ($(id).selectedIndex < 0 || $(id).selectedOptions[0].hidden) $(id).selectedIndex = 0; };
    $("q").value = p.get("q") || "";
    setSelect("brand", p.get("brand") || "");
    setSelect("head", p.get("head") || "");
    setSelect("sort", p.get("sort") || "brand");
    similarId = byId.has(p.get("similar")) ? p.get("similar") : null;
    sortDir = p.get("dir") === "desc" ? -1 : 1;
    const v = p.get("view");
    if (VIEWS.includes(v)) view = v;
    mapX = MAP_AXES[p.get("x")] ? p.get("x") : "weight";
    mapY = MAP_AXES[p.get("y")] ? p.get("y") : "swingweight";
    RANGE_FIELDS.forEach(rf => {
      const [lo = "", hi = ""] = (p.get(rf.key) || "").split("~");
      $("min-" + rf.key).value = lo !== "" && isFinite(lo) ? lo : "";
      $("max-" + rf.key).value = hi !== "" && isFinite(hi) ? hi : "";
    });
    if (activeRanges().length) $("more").open = true;
  }

  function writeBrowseHash(active) {
    const p = new URLSearchParams();
    const q = $("q").value.trim(), sort = $("sort").value;
    if (q) p.set("q", q);
    if ($("brand").value) p.set("brand", $("brand").value);
    if ($("head").value) p.set("head", $("head").value);
    if (similarId) p.set("similar", similarId);
    else {
      if (sort !== "brand") p.set("sort", sort);
      if (sortDir < 0) p.set("dir", "desc");
    }
    if (view !== "grid") p.set("view", view);
    if (view === "map" && mapX !== "weight") p.set("x", mapX);
    if (view === "map" && mapY !== "swingweight") p.set("y", mapY);
    active.forEach(({ rf, min, max }) => p.set(rf.key, min + "~" + max));
    browseHash = p.toString() ? "#" + p : "";
    if (location.hash !== browseHash) history.replaceState(null, "", browseHash || location.pathname + location.search);
  }

  const goBrowse = () => { location.hash = browseHash; };

  // Sort the browse list by closeness to racket `id` (a new history entry, so Back undoes it).
  function showSimilar(id) {
    const p = new URLSearchParams(browseHash.slice(1));
    p.delete("sort");
    p.delete("dir");
    p.set("similar", id);
    if ($("zoom").open) $("zoom").close();
    location.hash = p.toString();
    window.scrollTo(0, 0);
  }

  function readHash() {
    const m = location.hash.match(/^#compare=(.*)$/);
    if (m) selected = [...new Set(m[1].split(",").map(decodeURIComponent))].filter(id => byId.has(id)).slice(0, MAX);
    const showCompare = !!m && selected.length >= 2;
    if (showCompare) { // rewrite the URL to what's actually shown (deduped, unknown ids dropped, max 4)
      const canon = "#compare=" + selected.map(encodeURIComponent).join(",");
      if (location.hash !== canon) history.replaceState(null, "", canon);
    } else if (!m) readBrowseHash();
    $("compare").hidden = !showCompare;
    $("browse").hidden = showCompare;
    render();
  }

  function sync() {
    if (!$("compare").hidden) {
      if (selected.length < 2) { goBrowse(); return; }
      history.replaceState(null, "", "#compare=" + selected.map(encodeURIComponent).join(","));
    }
    render();
  }

  function render() {
    if ($("compare").hidden) renderGrid(); else renderTable();
    renderTray();
  }

  // ---------- Events ----------
  ["q", "brand", "head"].forEach(id => $(id).addEventListener("input", renderGrid));
  $("rangeInputs").addEventListener("input", renderGrid);
  $("resetRanges").addEventListener("click", () => {
    $("rangeInputs").querySelectorAll("input").forEach(i => { i.value = ""; });
    renderGrid();
  });
  $("sort").addEventListener("input", () => { sortDir = 1; similarId = null; renderGrid(); });
  $("clearSimilar").addEventListener("click", () => { similarId = null; $("sort").value = "brand"; sortDir = 1; renderGrid(); });
  document.querySelectorAll(".view-toggle [data-view]").forEach(b => b.addEventListener("click", () => {
    view = b.dataset.view;
    try { localStorage.setItem("view", view); } catch {}
    renderGrid();
  }));
  document.addEventListener("click", e => {
    const p = e.target.closest("[data-zoom]");
    if (p) openZoom(p.dataset.zoom);
    const s = e.target.closest("[data-similar]");
    if (s) showSimilar(s.dataset.similar);
  });
  document.addEventListener("keydown", e => {
    const p = e.target.closest && e.target.closest("[data-zoom]");
    if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openZoom(p.dataset.zoom); }
  });
  $("zoomClose").addEventListener("click", () => $("zoom").close());
  // Click on the backdrop (the dialog itself, outside its content) closes it. Esc is built in.
  $("zoom").addEventListener("click", e => { if (e.target === $("zoom")) $("zoom").close(); });
  const toggleDot = g => {
    if (g.classList.contains("full")) return showTip(g);
    const id = g.dataset.dot;
    toggle(id);
    const again = $("grid").querySelector(`[data-dot="${CSS.escape(id)}"]`); // the re-render replaces the dot
    if (again) { again.focus(); showTip(again); } // focus() usually shows it already; showTip skips a repeat
  };
  $("grid").addEventListener("change", e => {
    const s = e.target.closest("select[data-axis]");
    if (!s) return;
    if (s.dataset.axis === "x") mapX = s.value; else mapY = s.value;
    renderGrid();
    $("grid").querySelector(`select[data-axis="${s.dataset.axis}"]`).focus();
  });
  $("grid").addEventListener("keydown", e => {
    const g = e.target.closest && e.target.closest("[data-dot]");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleDot(g); }
  });
  $("grid").addEventListener("pointerover", e => { const g = e.target.closest("[data-dot]"); if (g) showTip(g); });
  $("grid").addEventListener("pointerout", e => { if (e.target.closest("[data-dot]") && !e.relatedTarget?.closest?.("[data-dot]")) showTip(null); });
  $("grid").addEventListener("focusin", e => { const g = e.target.closest("[data-dot]"); if (g) showTip(g); });
  $("grid").addEventListener("focusout", () => showTip(null));
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (view === "map" && $("compare").hidden) renderGrid(); }, 150);
  });
  $("grid").addEventListener("click", e => {
    const dot = e.target.closest("[data-dot]");
    if (dot) return toggleDot(dot);
    const h = e.target.closest("button[data-sort]");
    if (h) return sortBy(h.dataset.sort);
    const b = e.target.closest("button[data-id]");
    if (!b) return;
    const refocus = document.activeElement === b; // the re-render replaces the button
    toggle(b.dataset.id);
    if (refocus) $("grid").querySelector(`.pick[data-id="${CSS.escape(b.dataset.id)}"]`)?.focus();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("button[data-remove]");
    if (b) toggle(b.dataset.remove);
  });
  $("go").addEventListener("click", () => {
    location.hash = "compare=" + selected.map(encodeURIComponent).join(",");
    window.scrollTo(0, 0);
  });
  $("clear").addEventListener("click", () => { selected = []; sync(); });
  async function copyHref(b) {
    try {
      await navigator.clipboard.writeText(location.href);
      b.textContent = "Copied ✓";
      setTimeout(() => { b.textContent = "Copy link"; }, 1500);
    } catch {
      prompt("Copy this link", location.href); // no clipboard access (e.g. file://)
    }
  }
  ["copyLink", "copyBrowse"].forEach(id => $(id).addEventListener("click", () => copyHref($(id))));
  $("back").addEventListener("click", goBrowse);
  $("diffOnly").addEventListener("change", renderTable);
  // "Compact" hides photos, hints and extras so the table fits on one screen. Remembered per browser.
  const setDataOnly = on => { $("dataOnly").checked = on; $("compare").classList.toggle("data-only", on); };
  try { setDataOnly(localStorage.getItem("dataOnly") === "1"); } catch {}
  $("dataOnly").addEventListener("change", () => {
    setDataOnly($("dataOnly").checked);
    try { localStorage.setItem("dataOnly", $("dataOnly").checked ? "1" : "0"); } catch {}
  });
  window.addEventListener("hashchange", readHash);
  // Photo failed (moved, hotlink-blocked, offline) → fall back to the drawn racket.
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.id) return;
    const pic = img.closest(".pic, .zoom-pic");
    if (pic) img.outerHTML = racketImage(byId.get(img.dataset.id), true); // keeps the pick badge
  }, true);

  readHash();
})();
