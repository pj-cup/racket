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
    // num: the widest point ("23/26/23" → 26, "21.5→20.5" → 21.5), for the min/max filter and the compare track.
    { key: "beam", icon: "triangle-right", label: "Beam",       unit: " mm", hint: "Thicker = more power, less feel",
      num: r => { const ns = String(r.beam ?? "").match(/\d+(\.\d+)?/g); return ns ? Math.max(...ns.map(Number)) : null; } },
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
    { key: "beam", name: "Beam (widest, mm)" },
  ].map(rf => {
    const f = field(rf.key), unit = rf.unit ?? (f.unit || "").trim();
    return { ...rf, f, unit, name: rf.name || f.label + (unit ? ` (${unit})` : "") };
  });
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

  // Generations: rackets sharing a `line`, oldest first (unknown year last). Only lines with 2+ rackets on the site.
  const lines = new Map();
  data.filter(r => r.line).forEach(r => { if (!lines.has(r.line)) lines.set(r.line, []); lines.get(r.line).push(r); });
  lines.forEach((rs, k) => rs.length < 2 ? lines.delete(k) : rs.sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity)));
  const lineOf = r => lines.get(r.line) || null;
  // Latest: no other generation has a later year. A racket without a year is never hidden.
  const isLatest = r => { const g = lineOf(r); return !g || !has(r.year) || g.every(o => !has(o.year) || o.year <= r.year); };
  // Generation button label: the year, then what the model name adds to the line ("2026 Laver Cup", "2023 V14", "2016").
  // The model name stands in when it adds nothing and the year is unknown.
  const genLabel = r => {
    const yr = has(r.year) ? String(r.year) : "";
    let ed = r.model.startsWith(r.line) ? r.model.slice(r.line.length) : r.model;
    if (yr) ed = ed.replace(`(${yr})`, "").replace(yr, "");
    ed = ed.replace(/\s+/g, " ").trim();
    return [yr, ed].filter(Boolean).join(" ") || r.model;
  };
  // "Gen 2/4" under the name; compares the line, oldest first (the newest MAX if there are more).
  const genNote = r => {
    const g = lineOf(r);
    if (!g) return "";
    const what = `Generation ${g.indexOf(r) + 1} of ${g.length}. Compare all generations`;
    return `<button type="button" class="gen-link" data-generations="${esc(r.id)}" title="${what}" aria-label="${what}">Gen ${g.indexOf(r) + 1}/${g.length}</button>`;
  };


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
  // The open photo is `zoom=<id>` in the URL hash, on top of the browse or compare hash, so it's a shareable link.
  // Opening adds a history entry (Back closes it); stepping between generations replaces it.
  let zoomPushed = false; // this page pushed the current zoom entry, so closing can go Back to remove it
  const zoomParam = () => new URLSearchParams(location.hash.slice(1)).get("zoom");
  const stripZoom = h => h.replace(/([#&])zoom=[^&]*&?/, "$1").replace(/[#&]$/, "");
  const addZoom = (h, id) => (h ? h + "&" : "#") + "zoom=" + encodeURIComponent(id);
  const keepZoom = h => byId.has(zoomParam()) ? addZoom(stripZoom(h), zoomParam()) : h; // for rewrites of the base hash
  const setUrl = h => h || location.pathname + location.search;

  function openZoom(id, fromHash = false) {
    const r = byId.get(id);
    if (!r) return;
    if (!fromHash) {
      const h = addZoom(stripZoom(location.hash), id);
      if (location.hash !== h) {
        if ($("zoom").open) history.replaceState(null, "", h);
        else { history.pushState(null, "", h); zoomPushed = true; }
      }
    }
    const keySpecs = ["headSize", "weight", "balance", "pattern"]
      .map(k => { const f = field(k); return `${icon(f.icon)}${esc(f.fmt(r))}`; }).join(" · ");
    $("zoomPic").className = "zoom-pic" + (r.image ? " photo" : "");
    $("zoomPic").innerHTML = r.image
      ? `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" referrerpolicy="no-referrer">`
      : racketImage(r, true);
    $("zoomTitle").innerHTML = `<span class="brand">${esc(r.brand)}</span>${esc(r.model)}`;
    $("zoomMeta").innerHTML = keySpecs;
    $("zoomSimilar").dataset.similar = r.id;
    $("zoomCustomize").dataset.customize = r.id;
    const g = lineOf(r);
    $("zoomGens").hidden = !g;
    if (g)$("zoomGens").innerHTML = `<span title="Use ← and → to step through generations">Generations:</span>${g.map(o => `<button type="button" data-zoom="${esc(o.id)}"${
      o === r ? ' aria-current="true"' : ""} title="${esc(o.model)}">${esc(genLabel(o))}</button>`).join("")
      }<button type="button" class="zoom-similar" data-generations="${esc(r.id)}">Compare generations</button>`;
    if (!$("zoom").open) $("zoom").showModal();
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
    // ← / → step to the previous / next generation (oldest first), stopping at either end.
    else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const r = byId.get($("zoomSimilar").dataset.similar), g = r && lineOf(r);
      if (!g) return;
      const o = g[g.indexOf(r) + (e.key === "ArrowLeft" ? -1 : 1)];
      e.preventDefault();
      if (o) openZoom(o.id);
    }
  });

  // ---------- Browse ----------
  [...new Set(data.map(r => r.brand))].sort().forEach(b => {
    $("brand").insertAdjacentHTML("beforeend", `<option>${esc(b)}</option>`);
  });
  // Pattern and length menus ("More filters"): every value on the site, with how many rackets have it.
  const countBy = key => data.reduce((m, r) => has(r[key]) ? m.set(r[key], (m.get(r[key]) || 0) + 1) : m, new Map());
  [...countBy("pattern")].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).forEach(([v, n]) => {
    $("pattern").insertAdjacentHTML("beforeend", `<option value="${esc(v)}">${esc(v)} (${n})</option>`);
  });
  [...countBy("length")].sort((a, b) => a[0] - b[0]).forEach(([v, n]) => {
    $("length").insertAdjacentHTML("beforeend", `<option value="${v}">${v} in (${n})</option>`);
  });

  // Each min/max filter is a two-handle slider over every racket's range. A handle at its end of the track
  // means "no limit" on that side, so rackets past the current extremes (and future ones) aren't cut off.
  RANGE_FIELDS.forEach(rf => {
    const vals = data.map(r => rangeVal(rf, rf.f.num(r))).filter(has);
    rf.step = vals.every(Number.isInteger) ? 1 : 0.5;
    rf.bounds = [Math.floor(Math.min(...vals) / rf.step) * rf.step, Math.ceil(Math.max(...vals) / rf.step) * rf.step];
    // Histogram behind the slider: how many rackets at each value, in at most ~24 bars, over every racket.
    const [lo, hi] = rf.bounds;
    rf.binW = rf.step * Math.ceil(((hi - lo) / rf.step + 1) / 24);
    rf.bins = [];
    vals.forEach(v => {
      const j = Math.floor((v - lo) / rf.binW + 1e-9);
      rf.bins[j] = (rf.bins[j] || 0) + 1;
    });
  });
  // One bar per bin, 1000 units = the slider's travel; data-a/data-b: the bin's first and last value.
  const histSvg = rf => {
    const [lo, hi] = rf.bounds, span = hi - lo, top = Math.max(...rf.bins.filter(Boolean));
    const bars = rf.bins.map((c, j) => {
      if (!c) return "";
      const a = lo + j * rf.binW, b = Math.min(hi, a + rf.binW - rf.step);
      const x0 = ((a - lo - rf.step / 2) / span) * 1000, x1 = ((b - lo + rf.step / 2) / span) * 1000, h = Math.max(1.5, (c / top) * 24);
      const label = `${c} racket${c > 1 ? "s" : ""} at ${a === b ? a : `${a}–${b}`}${rf.unit ? " " + rf.unit : ""}`;
      return `<rect data-a="${a}" data-b="${b}" x="${x0.toFixed(1)}" width="${(x1 - x0).toFixed(1)}" y="${(24 - h).toFixed(1)}" height="${h.toFixed(1)}"><title>${esc(label)}</title></rect>`;
    }).join("");
    return `<svg id="hist-${rf.key}" class="hist" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  };
  $("rangeInputs").innerHTML = RANGE_FIELDS.map(rf => {
    const [lo, hi] = rf.bounds;
    const name = rf.name;
    const slider = (end, v) => `<input id="${end}-${rf.key}" type="range" min="${lo}" max="${hi}" step="${rf.step}" value="${v}" aria-label="${esc(name)} ${end}imum">`;
    return `<div class="range-field"><div class="range-label"><span>${icon(rf.f.icon)}${esc(name)}</span><output id="out-${rf.key}" class="range-out"></output></div>
      ${histSvg(rf)}<div id="dual-${rf.key}" class="dual">${slider("min", lo)}${slider("max", hi)}</div></div>`;
  }).join("");
  const setRange = (rf, min, max) => {
    $("min-" + rf.key).value = has(min) && isFinite(min) ? min : rf.bounds[0];
    $("max-" + rf.key).value = has(max) && isFinite(max) ? max : rf.bounds[1];
  };

  // Finder presets: starting points that only set sliders and the sort, so a preset is an ordinary browse link.
  // ranges: { key: [min, max] } with null for an open end. Search, brand and head size are left as they are.
  const PRESETS = [
    { id: "arm", label: "Arm-friendly", ranges: { stiffness: [null, 62] }, sort: "stiffness", dir: 1, order: "softest first" },
    { id: "quick", label: "Maneuverable", ranges: { swingweight: [null, 315], balance: [6, null] }, sort: "swingweight", dir: 1, order: "lowest swing weight first" },
    { id: "stable", label: "Stable & solid", ranges: { weight: [310, null], swingweight: [325, null] }, sort: "swingweight", dir: -1, order: "highest swing weight first" },
    { id: "light", label: "Lightweight", ranges: { weight: [null, 295] }, sort: "weight", dir: 1, order: "lightest first" },
  ];
  // "Stiffness ≤ 62 RA, softest first": the exact numbers a preset sets.
  const presetNote = p => Object.entries(p.ranges).map(([k, [lo, hi]], i) => {
    const rf = RANGE_FIELDS.find(x => x.key === k), u = rf.unit ? " " + rf.unit : "";
    return `${i ? rf.f.label.toLowerCase() : rf.f.label} ${has(lo) && has(hi) ? `${lo}–${hi}` : has(lo) ? `≥ ${lo}` : `≤ ${hi}`}${u}`;
  }).join(" and ") + ", " + p.order;
  $("presets").innerHTML = `<span class="muted">Start from:</span>` + PRESETS.map(p =>
    `<button type="button" class="preset" data-preset="${p.id}" aria-pressed="false" title="${esc(presetNote(p))}">${esc(p.label)}</button>`).join("");
  // The preset the current sliders and sort match exactly, if any (no state of its own).
  const presetOn = active => PRESETS.find(p => !similarId && $("sort").value === p.sort && sortDir === p.dir &&
    active.length === Object.keys(p.ranges).length && active.every(({ rf, lo, hi }) => {
      const want = p.ranges[rf.key];
      return want && lo === (want[0] ?? -Infinity) && hi === (want[1] ?? Infinity);
    }));
  function applyPreset(p) {
    RANGE_FIELDS.forEach(rf => setRange(rf, ...(p?.ranges[rf.key] || [null, null])));
    $("sort").value = p ? p.sort : "brand";
    sortDir = p ? p.dir : 1;
    similarId = null;
    renderGrid();
  }

  // Active min/max filters: [{ rf, min, max, lo, hi }]: min/max as hash text ("" = open end), lo/hi as numbers (±Infinity).
  function activeRanges() {
    return RANGE_FIELDS.map(rf => {
      const a = +$("min-" + rf.key).value, b = +$("max-" + rf.key).value, [lo, hi] = rf.bounds;
      if (a <= lo && b >= hi) return null;
      return { rf, min: a > lo ? String(a) : "", max: b < hi ? String(b) : "", lo: a > lo ? a : -Infinity, hi: b < hi ? b : Infinity };
    }).filter(Boolean);
  }
  // Slider readout and the filled part of the track.
  function paintRange(rf) {
    const a = +$("min-" + rf.key).value, b = +$("max-" + rf.key).value, [lo, hi] = rf.bounds;
    const dual = $("dual-" + rf.key);
    dual.style.setProperty("--a", (a - lo) / (hi - lo));
    dual.style.setProperty("--b", (b - lo) / (hi - lo));
    $("min-" + rf.key).style.zIndex = a === b && a > (lo + hi) / 2 ? 2 : ""; // both at the top end: keep the min handle grabbable
    $("out-" + rf.key).textContent = a <= lo && b >= hi ? "Any" : `${a} – ${b}`;
    $("hist-" + rf.key).querySelectorAll("rect").forEach(r => r.classList.toggle("in", +r.dataset.b >= a && +r.dataset.a <= b));
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
    const latest = $("latestOnly").checked;
    const pattern = $("pattern").value, length = $("length").value;
    let hiddenNoSpec = 0;
    let list = data.filter(r => {
      if (brand && r.brand !== brand) return false;
      const text = `${r.brand} ${r.model}`.toLowerCase();
      if (!words.every(w => text.includes(w))) return false; // every word, any order
      if (latest && !isLatest(r)) return false;
      if (pattern && r.pattern !== pattern) return false;
      if (length && r.length !== +length) return false;
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
  const VIEWS = ["grid", "list", "map", "lines"];
  let view = "grid";
  try { const v = localStorage.getItem("view"); if (VIEWS.includes(v)) view = v; } catch {}

  // Under each name in similar mode: "Reference", or how the racket differs from it.
  const simNote = (r, ref) => !ref ? "" : r === ref ? `<div class="sim ref">Reference</div>`
    : `<div class="sim">${esc(simDiff(r, ref))}</div>`;
  const NONE = `<p class="muted">No rackets match.</p>`;

  // Spec bar on cards and list rows: where this racket sits between the lowest and highest on the site.
  // In similar mode a hollow tick marks the reference racket's value on the same bar.
  const pctOf = (f, v) => { const [lo, hi] = ranges[f.key]; return Math.max(0, Math.min(100, (100 * (v - lo)) / (hi - lo))); }; // a customized build can pass the ends
  const miniBar = (f, r, ref) => {
    if (!f.num || !has(f.num(r))) return "";
    const [lo, hi] = ranges[f.key];
    if (!(hi > lo)) return "";
    const refMark = ref && ref !== r && has(f.num(ref)) ? `<b style="left:${pctOf(f, f.num(ref)).toFixed(1)}%"></b>` : "";
    return `<span class="mini" aria-hidden="true">${refMark}<i style="left:${pctOf(f, f.num(r)).toFixed(1)}%"></i></span>`;
  };

  function renderGrid() {
    const active = activeRanges();
    const { list: found, ref, hiddenNoSpec } = filtered(active);
    const list = ref ? [ref, ...found] : found;
    $("count").textContent = `${found.length} of ${data.length} rackets` + (ref ? " + reference" : "") +
      (hiddenNoSpec ? ` (${hiddenNoSpec} hidden: spec not published)` : "") + (view === "map" ? " · Click a dot to compare" : view === "lines" ? " · Click a line to compare" : " · Click a photo to compare");
    const nMore = active.length + $("latestOnly").checked + !!$("pattern").value + !!$("length").value;
    $("moreCount").textContent = nMore ? ` (${nMore})` : "";
    RANGE_FIELDS.forEach(paintRange);
    const preset = presetOn(active);
    document.querySelectorAll("#presets [data-preset]").forEach(b => b.setAttribute("aria-pressed", b.dataset.preset === preset?.id));
    $("presetNote").hidden = !preset;
    if (preset) $("presetNote").textContent = presetNote(preset);
    if (ref) $("sort").value = "similar"; // the hidden option, so the menu reads "Most similar"
    $("similarBanner").hidden = !ref;
    if (ref) $("similarName").textContent = `${ref.brand} ${ref.model}`;
    writeBrowseHash(active);
    const full = selected.length >= MAX;
    $("grid").className = view;
    document.querySelectorAll(".view-toggle [data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === view));
    if (view === "list") return renderList(list, full, ref);
    if (view === "map") return renderMap(list, full, ref);
    if (view === "lines") return renderLines(list, full, ref);
    $("grid").innerHTML = list.map(r => {
      const on = selected.includes(r.id);
      const rows = FIELDS.filter(f => CARD_FIELDS.includes(f.key))
        .map(f => `<dt>${icon(f.icon)}${f.label}</dt><dd><span>${esc(f.fmt(r))}</span>${miniBar(f, r, ref)}</dd>`).join("");
      return `<article class="card${on ? " selected" : ""}">
        ${browsePic(r, "", on, full)}
        <div><div class="brand">${esc(r.brand)}</div><h3>${esc(r.model)}</h3>${genNote(r)}${simNote(r, ref)}</div>
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
      const specs = fields.map(f => `<div class="spec" data-label="${esc(f.label)}">${esc(f.fmt(r))}${miniBar(f, r, ref)}</div>`).join("");
      return `<article class="row${on ? " selected" : ""}">
        ${browsePic(r, "small", on, full)}
        <div class="name"><div class="brand">${esc(r.brand)}</div><h3>${esc(r.model)}</h3>${genNote(r)}${simNote(r, ref)}</div>
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
  const NEAR_N = 5; // spokes to this many closest matches in similar mode

  // Color by brand (map and lines views). Only the three biggest brands get a hue; the rest share "Other" gray.
  // Dots overlap freely on a scatter, so every pair of hues must stay apart: three validated hues is the cap.
  // hlBrand: one brand group shown at full strength, the rest faded (kept for context, unlike the Brand filter).
  const BRAND_HUES = ["Wilson", "Head", "Babolat"];
  const HL_GROUPS = [...BRAND_HUES, "Other"];
  let colorBy = "none", hlBrand = null;
  const brandGroup = r => BRAND_HUES.includes(r.brand) ? r.brand : "Other";
  // " b1" … " b3" (" b0" = Other) and " dim" when another group is highlighted; "" when not coloring by brand.
  const brandCls = r => colorBy !== "brand" ? ""
    : ` b${BRAND_HUES.indexOf(r.brand) + 1}` + (hlBrand && brandGroup(r) !== hlBrand ? " dim" : "");
  const colorControls = () => {
    const sel = `<label>Color <select data-color aria-label="Color by">${[["none", "None"], ["brand", "Brand"]].map(([v, t]) =>
      `<option value="${v}"${v === colorBy ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
    if (colorBy !== "brand") return { sel, keys: "" };
    const keys = HL_GROUPS.map((b, i) => {
      const n = data.filter(r => brandGroup(r) === b).length;
      return `<button type="button" class="key hl-key b${(i + 1) % 4}${hlBrand && hlBrand !== b ? " dim" : ""}" data-hl="${esc(b)}" aria-pressed="${hlBrand === b}"
        title="${hlBrand === b ? "Show all brands" : `Highlight ${esc(b)}`}"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="mark" cx="6" cy="6" r="4.5"/></svg>${esc(b)} <span class="muted">${n}</span></button>`;
    }).join("");
    return { sel, keys };
  };

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

    // Generation paths: each line's shown generations with a year, oldest to newest, an arrowhead on every step.
    // A generation without a year is left out (its place in the order is never guessed). Steps too short to see
    // (e.g. a cosmetic edition on the same frame) are skipped.
    let genPaths = "";
    lines.forEach(gen => {
      const rs = gen.filter(r => has(r.year) && pos.has(r.id));
      const cls = "gen-path" + (colorBy === "brand" ? brandCls(rs[0] || {}) : "");
      for (let i = 1; i < rs.length; i++) {
        const [x0, y0] = pos.get(rs[i - 1].id), [x1, y1] = pos.get(rs[i].id);
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len < 22) continue;
        const ux = (x1 - x0) / len, uy = (y1 - y0) / len, a = [x0 + ux * 7, y0 + uy * 7], b = [x1 - ux * 8, y1 - uy * 8];
        const head = [[b[0], b[1]], [b[0] - ux * 7 - uy * 4, b[1] - uy * 7 + ux * 4], [b[0] - ux * 7 + uy * 4, b[1] - uy * 7 - ux * 4]];
        const f = v => v.toFixed(1);
        genPaths += `<g class="${cls}"><path d="M${f(a[0])} ${f(a[1])}L${f(b[0] - ux * 5)} ${f(b[1] - uy * 5)}"/><polygon points="${head.map(p => p.map(f).join(" ")).join(" ")}"/></g>`;
      }
    });

    // Find similar: spokes from the reference to its closest matches (the list is already sorted by closeness).
    // The ranking uses five specs, so a close match that sits far away here differs on these two.
    const near = ref && pos.has(ref.id) ? list.filter(r => r !== ref).slice(0, NEAR_N) : [];
    const [rx, ry] = near.length ? pos.get(ref.id) : [0, 0];
    const spokes = near.map((r, k) => {
      if (!pos.has(r.id)) return "";
      const [x, y] = pos.get(r.id);
      return `<line class="spoke" x1="${rx}" y1="${ry}" x2="${x}" y2="${y}"/>`;
    }).join("");

    const rank = r => selected.includes(r.id) || r === ref ? 2 : near.includes(r) ? 1 : 0;
    const dots = [...shown].sort((a, b) => rank(a) - rank(b)).map(r => {
      const [x, y] = pos.get(r.id), i = selected.indexOf(r.id), on = i >= 0, k = on ? -1 : near.indexOf(r);
      const name = `${r.brand} ${r.model}`;
      const cls = "dot" + (on ? " on" : "") + (r === ref ? " ref" : "") + (k >= 0 ? " near" : "") + (!on && full ? " full" : "") + brandCls(r);
      let label = "";
      if (on || r === ref) {
        const right = x < W - 170;
        label = `<text class="dot-label" x="${x + (right ? 10 : -10)}" y="${y + 4}" text-anchor="${right ? "start" : "end"}">${on ? LETTERS[i] + " · " : ""}${esc(r.model)}</text>`;
      }
      return `<g class="${cls}" data-dot="${esc(r.id)}" tabindex="0" role="button" aria-pressed="${on}"${!on && full ? ' aria-disabled="true"' : ""}
        aria-label="${esc(`${name}: ${fx.label} ${fx.fmt(r)}, ${fy.label} ${fy.fmt(r)}.${near.includes(r) ? ` Number ${near.indexOf(r) + 1} closest to the reference.` : ""} ${on ? "Remove from" : "Add to"} compare`)}">
        <circle class="hit" cx="${x}" cy="${y}" r="12"/>${r === ref ? `<circle class="ring" cx="${x}" cy="${y}" r="9"/>` : ""}
        <circle class="mark" cx="${x}" cy="${y}" r="${on || k >= 0 ? 6.5 : 4.5}"/>${on ? `<text class="dot-letter" x="${x}" y="${y + 3}" text-anchor="middle">${LETTERS[i]}</text>`
          : k >= 0 ? `<text class="near-num" x="${x}" y="${y + 3}" text-anchor="middle">${k + 1}</text>` : ""}${label}</g>`;
    }).join("");

    const missing = list.length - shown.length;
    const { sel, keys } = colorControls();
    const legend = keys + (colorBy === "brand" ? "" : `<span class="key"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="mark" cx="6" cy="6" r="4"/></svg>Racket</span>`)
      + `<span class="key on"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="mark" cx="6" cy="6" r="5"/></svg>Picked for compare</span>`
      + (ref ? `<span class="key ref"><svg viewBox="0 0 20 20" aria-hidden="true"><circle class="ring" cx="10" cy="10" r="8"/><circle class="mark" cx="10" cy="10" r="4"/></svg>Reference</span>` : "")
      + (spokes ? `<span class="key"><svg viewBox="0 0 20 12" aria-hidden="true"><line class="spoke" x1="2" y1="10" x2="18" y2="2"/></svg>${near.length} closest, numbered</span>` : "")
      + (genPaths ? `<span class="key gen"><svg viewBox="0 0 20 12" aria-hidden="true"><path d="M2 6h11"/><polygon points="18 6 11 2 11 10"/></svg>Generations, oldest to newest</span>` : "");
    $("grid").innerHTML = `<div class="map-bar">${axisSelect("x", mapX)}${axisSelect("y", mapY)}${sel}<div class="map-legend">${legend}</div></div>
      <div class="map-plot"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(`${fy.label} against ${fx.label}`)}">
        <g aria-hidden="true">${g}${genPaths}${spokes}</g>${dots}</svg><div id="mapTip" class="map-tip" role="tooltip" hidden></div></div>
      ${missing ? `<p class="muted map-note">${missing} racket${missing > 1 ? "s" : ""} not shown: ${esc(fx.label.toLowerCase())} or ${esc(fy.label.toLowerCase())} not published.</p>` : ""}
      ${list.length ? "" : NONE}`;
  }

  // ---------- Spec lines (parallel coordinates) ----------
  // One vertical axis per spec, one line per racket across them, so trade-offs over every spec show at once.
  // Axes cover every racket's range, like the map. An unpublished spec breaks the line (never filled in).
  const LINE_UNITS = { headSize: "sq in", weight: "g", balance: "pts HL", swingweight: "strung", stiffness: "RA" };
  function renderLines(list, full, ref) {
    const fs = SIM_KEYS.map(field), n = fs.length;
    const W = Math.max(300, $("grid").clientWidth), narrow = W < 560;
    const H = Math.round(Math.min(480, Math.max(340, W * 0.5)));
    const m = { l: 44, r: narrow ? 30 : 150, t: 46, b: 16 };
    const ax = i => m.l + (i * (W - m.l - m.r)) / (n - 1);
    const doms = fs.map(f => { const [lo, hi] = ranges[f.key]; const pad = (hi - lo) * 0.06 || 1; return [lo - pad, hi + pad]; });
    const sy = (i, v) => { const [lo, hi] = doms[i]; return H - m.b - ((v - lo) / (hi - lo)) * (H - m.t - m.b); };
    const active = activeRanges();

    let labels = "";
    const g = fs.map((f, i) => {
      const x = ax(i), [lo, hi] = doms[i];
      // The kept range of an active slider filter, as a band on its axis. Balance filters on whole pts: ± 0.5.
      const a = active.find(a => a.rf.key === f.key), half = a?.rf.round ? 0.5 : 0;
      const band = a ? (() => {
        const top = sy(i, Math.min(hi, a.hi + half)), bot = sy(i, Math.max(lo, a.lo - half));
        return `<rect class="pc-band" x="${x - 6}" y="${top.toFixed(1)}" width="12" height="${(bot - top).toFixed(1)}" rx="3"/>`;
      })() : "";
      const tv = niceTicks(lo, hi, narrow ? 3 : 5);
      // Tick labels go over the lines (drawn after them), with a surface halo so they stay readable.
      labels += tv.map(v => `<text class="tick" x="${x - 6}" y="${sy(i, v) + 4}" text-anchor="end">${+v.toFixed(2)}</text>`).join("")
        + `<text class="axis-title" x="${x}" y="${m.t - 24}" text-anchor="middle">${esc(f.label)}</text>
        <text class="tick" x="${x}" y="${m.t - 10}" text-anchor="middle">${esc(LINE_UNITS[f.key])}</text>`;
      return `${band}<line class="pc-axis" x1="${x}" x2="${x}" y1="${m.t}" y2="${H - m.b}"/>`
        + tv.map(v => `<line class="pc-tick" x1="${x - 3}" x2="${x}" y1="${sy(i, v)}" y2="${sy(i, v)}"/>`).join("");
    }).join("");

    const pathOf = r => {
      let d = "", pen = false, last = null, mid = null;
      fs.forEach((f, i) => {
        const v = f.num(r);
        if (has(v)) {
          const x = ax(i), y = sy(i, v);
          d += `${pen ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
          last = [x, y];
          if (!mid || i <= (n - 1) / 2) mid = [x, y]; // tooltip anchor: the middle axis, or the nearest before it
        }
        pen = has(v);
      });
      return { d, last, mid };
    };
    const shown = list.filter(r => fs.filter(f => has(f.num(r))).length >= 2);
    // Draw order: plain, then the highlighted brand, the reference, and picked rackets on top.
    const rank = r => selected.includes(r.id) ? 3 : r === ref ? 2 : hlBrand && colorBy === "brand" && brandGroup(r) === hlBrand ? 1 : 0;
    const paths = [...shown].sort((a, b) => rank(a) - rank(b)).map(r => {
      const { d, last, mid } = pathOf(r), i = selected.indexOf(r.id), on = i >= 0;
      const cls = "pc" + (on ? " on" : "") + (r === ref ? " ref" : "") + (!on && full ? " full" : "") + brandCls(r);
      let end = "";
      if (on) {
        end = `<circle class="pc-end" cx="${last[0]}" cy="${last[1]}" r="8"/><text class="dot-letter" x="${last[0]}" y="${last[1] + 3.5}" text-anchor="middle">${LETTERS[i]}</text>`;
        if (!narrow) end += `<text class="dot-label" x="${last[0] + 14}" y="${last[1] + 4}">${esc(r.model)}</text>`;
      } else if (r === ref && !narrow) end = `<text class="dot-label" x="${last[0] + 10}" y="${last[1] + 4}">${esc(r.model)}</text>`;
      const specs = fs.map(f => `${f.label} ${f.fmt(r)}`).join(", ");
      return `<g class="${cls}" data-dot="${esc(r.id)}" data-tx="${mid[0].toFixed(1)}" data-ty="${mid[1].toFixed(1)}" tabindex="0" role="button" aria-pressed="${on}"${!on && full ? ' aria-disabled="true"' : ""}
        aria-label="${esc(`${r.brand} ${r.model}: ${specs}. ${on ? "Remove from" : "Add to"} compare`)}"><path class="hit" d="${d}"/><path class="pc-line" d="${d}"/>${end}</g>`;
    }).join("");

    const missing = list.length - shown.length;
    const { sel, keys } = colorControls();
    const legend = keys + (colorBy === "brand" ? "" : `<span class="key"><svg viewBox="0 0 16 12" aria-hidden="true"><path class="pc-line" d="M1 9 8 3l7 4"/></svg>Racket</span>`)
      + `<span class="key on"><svg viewBox="0 0 16 12" aria-hidden="true"><path class="pc-line" d="M1 9 8 3l7 4"/></svg>Picked for compare</span>`
      + (ref ? `<span class="key ref"><svg viewBox="0 0 16 12" aria-hidden="true"><path class="pc-line" d="M1 9 8 3l7 4"/></svg>Reference</span>` : "")
      + (active.length ? `<span class="key"><svg viewBox="0 0 12 12" aria-hidden="true"><rect class="pc-band" x="3" y="0" width="6" height="12" rx="2"/></svg>Filter range</span>` : "");
    $("grid").innerHTML = `<div class="map-bar">${sel}<div class="map-legend">${legend}</div></div>
      <div class="map-plot lines-plot"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Every racket's specs, one line per racket">
        <g aria-hidden="true">${g}</g>${paths}<g class="pc-labels" aria-hidden="true">${labels}</g></svg><div id="mapTip" class="map-tip" role="tooltip" hidden></div></div>
      ${missing ? `<p class="muted map-note">${missing} racket${missing > 1 ? "s" : ""} not shown: fewer than 2 of these specs published.</p>` : ""}
      ${list.length ? "" : NONE}`;
  }

  let tipDot = null; // the dot the tooltip is showing, so moving within one dot doesn't rebuild it
  function showTip(g) {
    const tip = $("mapTip"), r = byId.get(g?.dataset.dot);
    if (!tip || (g && g === tipDot)) return;
    tipDot = g;
    if (!r) { tip.hidden = true; return; }
    const on = selected.includes(r.id);
    const fs = view === "lines" ? SIM_KEYS.map(field) : [field(mapX), field(mapY)];
    tip.innerHTML = `<span class="brand">${esc(r.brand)}</span><strong>${esc(r.model)}</strong>
      ${fs.map(f => `<span>${esc(f.label)}: ${esc(f.fmt(r))}</span>`).join("")}
      <span class="muted">${on ? "Click to remove from compare" : g.classList.contains("full") ? "Up to 4 rackets" : "Click to add to compare"}</span>`;
    tip.hidden = false;
    // Anchor: the dot's centre on the map; a point on the line (data-tx/ty) in the lines view.
    const c = g.querySelector(".mark"), box = tip.parentElement;
    const x = g.dataset.tx ? +g.dataset.tx : +c.getAttribute("cx"), y = g.dataset.ty ? +g.dataset.ty : +c.getAttribute("cy");
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
    const g = lineOf(a), sameLine = g && rs.every(r => r.line === a.line);
    $("compareTitle").textContent = sameLine ? `Generations of ${a.brand} ${a.line}` : "Compare";
    const head = `<thead><tr><th class="corner"><span class="muted">Specs</span></th>${rs.map((r, i) =>
      `<th>${picBox(r, "small")}<span class="letter">${LETTERS[i]}</span><span class="brand">${esc(r.brand)}</span><span class="model">${esc(r.model)}</span>${
        sameLine && has(r.year) ? `<span class="year">${r.year}</span>` : ""}<button type="button" class="customize-link" data-customize="${esc(r.id)}">Customize</button><button class="remove" data-remove="${esc(r.id)}" aria-label="Remove ${esc(r.brand + " " + r.model)}">×</button></th>`
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
    renderCharts(rs);
  }

  const renderCharts = rs => { renderProfile(rs); renderTrends(rs); };

  // ---------- Spec profile above the compare table ----------
  // One row per spec, each spanning every racket's range: faint ticks for all rackets (where the field clusters),
  // a lettered marker per compared racket, and a thin line joining each racket's markers down the rows.
  // Each row has its own scale, so hovering a marker gives the real value.
  function renderProfile(rs) {
    const W = Math.max(280, $("profile").clientWidth || $("compare").clientWidth) - 2, narrow = W < 520; // - 2: the border
    const fs = SIM_KEYS.map(field), rowH = 62;
    const m = { l: narrow ? 92 : 120, r: 16, t: 10, b: 4 }, H = m.t + fs.length * rowH + m.b;
    const sx = (f, v) => { const [lo, hi] = ranges[f.key]; return m.l + (hi > lo ? (v - lo) / (hi - lo) : 0.5) * (W - m.l - m.r); };
    const cy = j => m.t + j * rowH + 24;
    // Markers closer than 14px in a row would cover each other: stack each such cluster vertically, centred on the row.
    const offs = fs.map(f => {
      const o = rs.map(() => 0);
      const xs = rs.map((r, i) => ({ i, x: has(f.num(r)) ? sx(f, f.num(r)) : null })).filter(p => p.x !== null).sort((a, b) => a.x - b.x || a.i - b.i);
      for (let k = 0; k < xs.length;) {
        let e = k + 1;
        while (e < xs.length && xs[e].x - xs[e - 1].x < 14) e++;
        const c = xs.slice(k, e).sort((a, b) => a.i - b.i);
        c.forEach((p, q) => { o[p.i] = (q - (c.length - 1) / 2) * 13; });
        k = e;
      }
      return o;
    });
    const off = (i, j) => offs[j][i];
    const scaleTxt = (f, v) => f.scale ? f.scale(v) : `${+v.toFixed(1)}${f.unit || ""}`;
    const rows = fs.map((f, j) => {
      const y = cy(j), [lo, hi] = ranges[f.key];
      const rug = data.map(f.num).filter(has).map(v => `<line class="rug" x1="${sx(f, v).toFixed(1)}" x2="${sx(f, v).toFixed(1)}" y1="${y - 5}" y2="${y + 5}"/>`).join("");
      return `<text class="row-label" x="12" y="${y + 4}">${esc(f.label)}</text>
        <line class="pf-track" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/>${rug}
        <text class="tick" x="${m.l}" y="${y + 34}">${esc(scaleTxt(f, lo))}</text>
        <text class="tick" x="${W - m.r}" y="${y + 34}" text-anchor="end">${esc(scaleTxt(f, hi))}</text>`;
    }).join("");
    const racketLine = (r, i) => {
      let d = "", pen = false;
      fs.forEach((f, j) => {
        const v = f.num(r);
        if (has(v)) d += `${pen ? "L" : "M"}${sx(f, v).toFixed(1)} ${(cy(j) + off(i, j)).toFixed(1)}`;
        pen = has(v);
      });
      const marks = fs.map((f, j) => {
        const v = f.num(r);
        if (!has(v)) return "";
        const x = sx(f, v), y = cy(j) + off(i, j);
        return `<g class="pick-mark"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5"/><text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle">${LETTERS[i]}</text><title>${esc(`${LETTERS[i]} · ${r.brand} ${r.model}: ${f.label} ${f.fmt(r)}`)}</title></g>`;
      }).join("");
      return `<g class="pf-racket"><path class="pf-line" d="${d}"/>${marks}</g>`;
    };
    const summary = rs.map((r, i) => `${LETTERS[i]} ${r.brand} ${r.model}: ` + fs.map(f => `${f.label} ${f.fmt(r)}`).join(", ")).join("; ");
    $("profile").innerHTML = `<div class="charts-head"><h3>Spec profile</h3><span class="muted">Where each racket sits among all ${data.length}. Faint ticks: every racket on the site.</span></div>
      <div class="profile"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(summary)}">${rows}${rs.map(racketLine).join("")}</svg></div>`;
  }

  // ---------- Generation charts above the compare table ----------
  // Comparing generations of one line: how each spec changed, one small chart per spec. Otherwise nothing.
  // Charted like the sliders (RANGE_FIELDS): same title and unit, and balance in whole pts, as the table shows it.
  const TREND_FIELDS = ["weight", "balance", "swingweight", "stiffness"].map(k => RANGE_FIELDS.find(rf => rf.key === k));

  function renderTrends(rs) {
    const a = rs[0], g = lineOf(a), sameLine = g && rs.every(r => r.line === a.line);
    const W = Math.max(280, $("trends").clientWidth || $("compare").clientWidth);
    $("trends").innerHTML = sameLine ? trendCharts(g, rs, W) : "";
  }

  function trendCharts(g, rs, W) {
    const n = g.length, colsN = W >= 760 ? 4 : W >= 420 ? 2 : 1, gap = 12;
    const cw = Math.floor((W - gap * (colsN - 1)) / colsN) - 2, ch = 168; // - 2: the card border
    const m = { l: 10, r: 10, t: 22, b: 30 };
    const sx = i => m.l + ((i + 0.5) / n) * (cw - m.l - m.r);
    const charts = TREND_FIELDS.map(rf => {
      const f = rf.f, pts = g.map((r, i) => ({ r, i, v: rangeVal(rf, f.num(r)) })), known = pts.filter(p => has(p.v));
      if (!known.length) return "";
      const lo = Math.min(...known.map(p => p.v)), hi = Math.max(...known.map(p => p.v));
      const pad = (hi - lo) * 0.25 || Math.max(1, Math.abs(hi) * 0.02);
      const sy = v => m.t + (1 - (v - (lo - pad)) / (hi - lo + 2 * pad)) * (ch - m.t - m.b);
      // A spec a generation doesn't publish breaks the line; the gap is never filled in.
      let path = "", pen = false;
      pts.forEach(p => {
        if (has(p.v)) path += `${pen ? "L" : "M"}${sx(p.i).toFixed(1)} ${sy(p.v).toFixed(1)}`;
        pen = has(p.v);
      });
      const dots = pts.map(p => {
        const x = sx(p.i), li = rs.indexOf(p.r), on = li >= 0;
        const lbl = `<text class="tick" x="${x}" y="${ch - 10}" text-anchor="middle">${esc(has(p.r.year) ? String(p.r.year) : "—")}</text>`;
        if (!has(p.v)) return lbl + `<text class="na" x="${x}" y="${(m.t + ch - m.b) / 2}" text-anchor="middle">${NA}</text>`;
        const y = sy(p.v), title = `<title>${esc(`${p.r.brand} ${p.r.model}: ${f.fmt(p.r)}`)}</title>`;
        return lbl + `<text class="val" x="${x}" y="${y - 12}" text-anchor="middle">${+p.v.toFixed(1)}</text>`
          + (on ? `<g class="pick-mark"><circle cx="${x}" cy="${y}" r="8"/><text x="${x}" y="${y + 3.5}" text-anchor="middle">${LETTERS[li]}</text>${title}</g>`
                : `<g class="gen-dot"><circle cx="${x}" cy="${y}" r="4.5"/>${title}</g>`);
      }).join("");
      const summary = `${rf.name} by generation: ` + pts.map(p => `${p.r.model} ${f.fmt(p.r)}`).join(", ");
      return `<figure class="trend"><figcaption>${icon(f.icon)}${esc(rf.name)}</figcaption>
        <svg width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}" role="img" aria-label="${esc(summary)}">
        <path class="trend-line" d="${path}"/>${dots}</svg></figure>`;
    }).join("");
    const shown = rs.length < n ? ` Lettered dots are the ${rs.length} in the table; the other${n - rs.length > 1 ? "s are" : " is"} shown faint.` : "";
    return `<div class="charts-head"><h3>How the ${esc(g[0].brand + " " + g[0].line)} changed</h3><span class="muted">All ${n} generations on the site, oldest first.${shown}</span></div>
      <div class="trends" style="--cols:${colsN}">${charts}</div>`;
  }


  // ---------- Customize (lead tape / grip weight) ----------
  // #custom=<id>&add=3@67.5,2@5: grams @ cm from the butt cap. Point-mass estimates on the racket's own specs:
  //   weight' = W + Σm · balance' = (W·B + Σ m·d) / weight' · swing weight' = SW + Σ m·(d − 10)² / 1000
  // (swing weight is taken about an axis 10 cm from the butt, in kg·cm²). Weight and balance stay unstrung and swing
  // weight strung: added mass shifts each by the same amount either way. An unpublished spec stays unpublished.
  const ADD_MAX = 4, GRAMS_MAX = 50;
  let customId = null, adds = [];
  const lengthCm = r => r.length * 2.54;
  const half = v => Math.round(v * 2) / 2;
  // Quick positions on the frame: rough spots, labelled as such (the exact spot differs by frame).
  const spots = r => {
    const L = lengthCm(r);
    return [["Handle", 5], ["Throat", half(L / 2)], ["3 & 9", half(L - 17)], ["12 o'clock", half(L - 1)]];
  };
  const swAdd = a => (a.g * (a.d - 10) ** 2) / 1000;
  function buildOf(r) {
    const m = adds.reduce((t, a) => t + a.g, 0);
    const weight = has(r.weight) ? r.weight + m : null;
    const balance = has(r.weight) && has(r.balance) ? (r.weight * r.balance + adds.reduce((t, a) => t + a.g * a.d, 0)) / weight : null;
    const swingweight = has(r.swingweight) ? +(r.swingweight + adds.reduce((t, a) => t + swAdd(a), 0)).toFixed(1) : null;
    return { ...r, id: "build", model: r.model + " (customized)", weight: has(weight) ? +weight.toFixed(1) : null, balance, swingweight };
  }
  function readCustomHash(id) {
    const r = byId.get(id), L = lengthCm(r);
    const p = new URLSearchParams(location.hash.slice(1));
    const raw = p.get("add");
    adds = raw === null ? [{ g: 4, d: spots(r)[2][1] }] // no add= at all: a starting point, 4 g at 3 & 9
      : raw.split(",").map(s => s.split("@").map(Number))
        .filter(([g, d]) => g > 0 && g <= GRAMS_MAX && d >= 0 && d <= L).slice(0, ADD_MAX).map(([g, d]) => ({ g, d }));
    customId = id;
  }
  function writeCustomHash() {
    const h = "#custom=" + encodeURIComponent(customId) + (adds.length ? "&add=" + adds.map(a => `${a.g}@${a.d}`).join(",") : "");
    const url = keepZoom(h);
    if (location.hash !== url) history.replaceState(null, "", url);
  }
  function openCustom(id) {
    closeZoomQuiet();
    location.hash = "custom=" + encodeURIComponent(id);
    window.scrollTo(0, 0);
  }
  // Full render: the editor rows too (on load, add/remove, picks). Typing only calls updateCustom, so focus stays put.
  function renderCustom() {
    const r = byId.get(customId), L = lengthCm(r);
    $("customTitle").textContent = `Customize ${r.brand} ${r.model}`;
    $("customPic").innerHTML = picBox(r, "small");
    $("customAdds").innerHTML = adds.map((a, i) => `<div class="add-row" data-i="${i}">
        <label class="add-g">Grams <input type="number" min="0.5" max="${GRAMS_MAX}" step="0.5" value="${a.g}" data-k="g"></label>
        <label class="add-d"><span>Position <output data-out="d"></output></span>
          <input type="range" min="0" max="${half(L)}" step="0.5" value="${a.d}" data-k="d" aria-label="Position, cm from the butt cap"></label>
        <div class="add-spots" role="group" aria-label="Quick positions">${spots(r).map(([name, d]) =>
          `<button type="button" data-spot="${d}" title="About ${d} cm from the butt cap">${esc(name)}</button>`).join("")}</div>
        <span class="add-sw muted" data-out="sw"></span>
        <button type="button" class="remove" data-del="${i}" aria-label="Remove this weight">×</button>
      </div>`).join("") || `<p class="muted">No weight added: these are the stock specs.</p>`;
    $("customAdd").disabled = adds.length >= ADD_MAX;
    updateCustom();
  }
  function updateCustom() {
    const r = byId.get(customId), b = buildOf(r);
    $("customAdds").querySelectorAll(".add-row").forEach(row => {
      const a = adds[+row.dataset.i];
      row.querySelector('[data-out="d"]').textContent = `${a.d} cm`;
      row.querySelector('[data-out="sw"]').textContent = has(r.swingweight) ? `+${swAdd(a).toFixed(1)} SW` : "";
      row.querySelectorAll("[data-spot]").forEach(s => s.setAttribute("aria-pressed", +s.dataset.spot === a.d));
    });
    const rows = ["weight", "balance", "swingweight"].map(field).map(f => {
      const sub = x => f.sub ? f.sub(x) : "";
      let change = "";
      if (has(f.num(r)) && has(f.num(b))) {
        change = f.delta(b, r);
        if (f.key === "balance") change = [change, Math.abs(b.balance - r.balance) >= 0.05 ? signed(b.balance - r.balance, " cm") : ""].filter(Boolean).join(", ");
        if (f.key === "swingweight" || f.key === "weight") change = b[f.key] === r[f.key] ? "" : change;
      }
      return `<tr><th scope="row">${icon(f.icon)}${f.label}<span class="hint">${esc(f.hint.split(".")[0])}</span></th>
        <td><div class="val">${esc(f.fmt(r))}</div>${sub(r) ? `<div class="sub">${esc(sub(r))}</div>` : ""}</td>
        <td><div class="val">${esc(f.fmt(b))}</div>${sub(b) ? `<div class="sub">${esc(sub(b))}</div>` : ""}${miniBar(f, b, r)}</td>
        <td class="delta">${esc(change || (has(f.num(r)) ? "same" : "not published"))}</td></tr>`;
    }).join("");
    $("customResult").innerHTML = `<table class="custom-table"><thead><tr><th class="corner"></th><th>Stock</th><th>Customized</th><th>Change</th></tr></thead><tbody>${rows}</tbody></table>`;

    // Closest stock rackets to the build, on the five "Find similar" specs.
    const full = selected.length >= MAX;
    const near = data.filter(o => o !== r).map(o => [o, distance(b, o)]).filter(([, d]) => isFinite(d))
      .sort((x, y) => x[1] - y[1]).slice(0, NEAR_N).map(([o]) => o);
    const fields = FIELDS.filter(f => CARD_FIELDS.includes(f.key));
    $("customNear").innerHTML = near.map(o => `<article class="row${selected.includes(o.id) ? " selected" : ""}">
        ${browsePic(o, "small", selected.includes(o.id), full)}
        <div class="name"><div class="brand">${esc(o.brand)}</div><h3>${esc(o.model)}</h3><div class="sim">${esc(simDiff(o, b))} vs your build</div>
          <button type="button" class="gen-link" data-pair="${esc(r.id)},${esc(o.id)}">Compare with the stock ${esc(r.model)}</button></div>
        <div class="row-specs">${fields.map(f => `<div class="spec" data-label="${esc(f.label)}">${esc(f.fmt(o))}${miniBar(f, o, b)}</div>`).join("")}</div>
      </article>`).join("") || `<p class="muted">Not enough published specs to compare.</p>`;
    writeCustomHash();
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
    $("latestOnly").checked = p.get("latest") === "1";
    setSelect("pattern", p.get("pattern") || "");
    setSelect("length", p.get("length") || "");
    sortDir = p.get("dir") === "desc" ? -1 : 1;
    const v = p.get("view");
    if (VIEWS.includes(v)) view = v;
    mapX = MAP_AXES[p.get("x")] ? p.get("x") : "weight";
    mapY = MAP_AXES[p.get("y")] ? p.get("y") : "swingweight";
    colorBy = p.get("color") === "brand" ? "brand" : "none";
    hlBrand = colorBy === "brand" && HL_GROUPS.includes(p.get("hl")) ? p.get("hl") : null;
    RANGE_FIELDS.forEach(rf => {
      const [lo = "", hi = ""] = (p.get(rf.key) || "").split("~");
      setRange(rf, lo === "" ? null : +lo, hi === "" ? null : +hi);
    });
    if (activeRanges().length || $("latestOnly").checked || $("pattern").value || $("length").value) $("more").open = true;
  }

  function writeBrowseHash(active) {
    const p = new URLSearchParams();
    const q = $("q").value.trim(), sort = $("sort").value;
    if (q) p.set("q", q);
    if ($("brand").value) p.set("brand", $("brand").value);
    if ($("head").value) p.set("head", $("head").value);
    if ($("latestOnly").checked) p.set("latest", "1");
    if ($("pattern").value) p.set("pattern", $("pattern").value);
    if ($("length").value) p.set("length", $("length").value);
    if (similarId) p.set("similar", similarId);
    else {
      if (sort !== "brand") p.set("sort", sort);
      if (sortDir < 0) p.set("dir", "desc");
    }
    if (view !== "grid") p.set("view", view);
    if (view === "map" && mapX !== "weight") p.set("x", mapX);
    if (view === "map" && mapY !== "swingweight") p.set("y", mapY);
    if ((view === "map" || view === "lines") && colorBy === "brand") {
      p.set("color", "brand");
      if (hlBrand) p.set("hl", hlBrand);
    }
    active.forEach(({ rf, min, max }) => p.set(rf.key, min + "~" + max));
    browseHash = p.toString() ? "#" + String(p).replace(/%7E/g, "~") : ""; // keep "295~310" readable
    const url = keepZoom(browseHash);
    if (location.hash !== url) history.replaceState(null, "", setUrl(url));
  }

  const goBrowse = () => { location.hash = browseHash; };
  // Close the photo before navigating elsewhere: drop zoom from the current entry instead of going Back.
  function closeZoomQuiet() {
    if (!$("zoom").open) return;
    zoomPushed = false;
    history.replaceState(null, "", setUrl(stripZoom(location.hash)));
    $("zoom").close();
  }

  // Compare a racket's whole line, oldest first, so column A is the first generation.
  function compareGenerations(id) {
    selected = lineOf(byId.get(id)).slice(-MAX).map(r => r.id);
    closeZoomQuiet();
    location.hash = "compare=" + selected.map(encodeURIComponent).join(",");
    window.scrollTo(0, 0);
  }

  // Sort the browse list by closeness to racket `id` (a new history entry, so Back undoes it).
  function showSimilar(id) {
    const p = new URLSearchParams(browseHash.slice(1));
    p.delete("sort");
    p.delete("dir");
    p.set("similar", id);
    closeZoomQuiet();
    location.hash = p.toString();
    window.scrollTo(0, 0);
  }

  function readHash() {
    const c = location.hash.match(/^#custom=([^&]*)/), cid = c && decodeURIComponent(c[1]);
    const showCustom = !!c && byId.has(cid);
    if (showCustom) readCustomHash(cid);
    const m = location.hash.match(/^#compare=([^&]*)/);
    if (m) selected = [...new Set(m[1].split(",").map(decodeURIComponent))].filter(id => byId.has(id)).slice(0, MAX);
    const showCompare = !!m && selected.length >= 2;
    if (showCompare) { // rewrite the URL to what's actually shown (deduped, unknown ids dropped, max 4)
      const canon = keepZoom("#compare=" + selected.map(encodeURIComponent).join(","));
      if (location.hash !== canon) history.replaceState(null, "", canon);
    } else if (!m && !showCustom) readBrowseHash();
    $("custom").hidden = !showCustom;
    $("compare").hidden = !showCompare;
    $("browse").hidden = showCompare || showCustom;
    render();
    syncZoom();
  }
  // Open or close the photo to match the hash (page load, Back/Forward, an edited URL).
  function syncZoom() {
    const z = zoomParam();
    if (byId.has(z)) { if (!$("zoom").open || $("zoomSimilar").dataset.similar !== z) openZoom(z, true); }
    else if ($("zoom").open) { zoomPushed = false; $("zoom").close(); }
  }

  function sync() {
    if (!$("compare").hidden) {
      if (selected.length < 2) { goBrowse(); return; }
      history.replaceState(null, "", keepZoom("#compare=" + selected.map(encodeURIComponent).join(",")));
    }
    render();
  }

  function render() {
    if (!$("custom").hidden) renderCustom();
    else if ($("compare").hidden) renderGrid(); else renderTable();
    renderTray();
  }

  // ---------- Events ----------
  ["q", "brand", "head", "pattern", "length"].forEach(id => $(id).addEventListener("input", renderGrid));
  $("rangeInputs").addEventListener("input", e => {
    const [end, key] = e.target.id.split("-"); // handles can't cross: the one being dragged stops at the other
    const other = $((end === "min" ? "max-" : "min-") + key);
    if (end === "min" ? +e.target.value > +other.value : +e.target.value < +other.value) e.target.value = other.value;
    renderGrid();
  });
  $("latestOnly").addEventListener("change", renderGrid);
  $("presets").addEventListener("click", e => { // clicking the pressed preset clears it
    const b = e.target.closest("[data-preset]");
    if (b) applyPreset(b.getAttribute("aria-pressed") === "true" ? null : PRESETS.find(p => p.id === b.dataset.preset));
  });
  $("resetRanges").addEventListener("click", () => {
    RANGE_FIELDS.forEach(rf => setRange(rf, null, null));
    $("latestOnly").checked = false;
    $("pattern").value = $("length").value = "";
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
    const gen = e.target.closest("[data-generations]");
    if (gen) compareGenerations(gen.dataset.generations);
    const cu = e.target.closest("[data-customize]");
    if (cu) openCustom(cu.dataset.customize);
  });
  document.addEventListener("keydown", e => {
    const p = e.target.closest && e.target.closest("[data-zoom]");
    if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openZoom(p.dataset.zoom); }
  });
  $("zoomClose").addEventListener("click", () => $("zoom").close());
  // However the photo closes (×, Esc, backdrop), take zoom out of the URL: Back if we added the entry, else rewrite it.
  $("zoom").addEventListener("close", () => {
    if (!zoomParam()) { zoomPushed = false; return; }
    if (zoomPushed) { zoomPushed = false; history.back(); }
    else history.replaceState(null, "", setUrl(stripZoom(location.hash)));
  });
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
    if (e.target.matches("select[data-color]")) {
      colorBy = e.target.value;
      hlBrand = null;
      renderGrid();
      return $("grid").querySelector("select[data-color]").focus();
    }
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
    resizeTimer = setTimeout(() => {
      if (!$("compare").hidden) renderCharts(selected.map(id => byId.get(id)));
      else if (view === "map" || view === "lines") renderGrid();
    }, 150);
  });
  $("grid").addEventListener("click", e => {
    const dot = e.target.closest("[data-dot]");
    if (dot) return toggleDot(dot);
    const hl = e.target.closest("button[data-hl]");
    if (hl) {
      hlBrand = hlBrand === hl.dataset.hl ? null : hl.dataset.hl;
      renderGrid();
      return $("grid").querySelector(`button[data-hl="${CSS.escape(hl.dataset.hl)}"]`)?.focus();
    }
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
  $("customBack").addEventListener("click", goBrowse);
  $("copyCustom").addEventListener("click", () => copyHref($("copyCustom")));
  $("customAdd").addEventListener("click", () => {
    if (adds.length >= ADD_MAX) return;
    adds.push({ g: 2, d: spots(byId.get(customId))[3][1] });
    renderCustom();
    $("customAdds").querySelector(".add-row:last-child input")?.focus();
  });
  $("customAdds").addEventListener("input", e => {
    const row = e.target.closest(".add-row"), k = e.target.dataset.k;
    if (!row || !k) return;
    const v = +e.target.value;
    if (k === "g" && !(v > 0 && v <= GRAMS_MAX)) return; // keep the last good value while typing
    adds[+row.dataset.i][k] = v;
    updateCustom();
  });
  $("customAdds").addEventListener("click", e => {
    const spot = e.target.closest("[data-spot]"), del = e.target.closest("[data-del]");
    if (spot) {
      const row = spot.closest(".add-row");
      adds[+row.dataset.i].d = +spot.dataset.spot;
      row.querySelector('[data-k="d"]').value = spot.dataset.spot;
      updateCustom();
    } else if (del) {
      adds.splice(+del.dataset.del, 1);
      renderCustom();
      $("customAdd").focus();
    }
  });
  $("customNear").addEventListener("click", e => {
    const pair = e.target.closest("[data-pair]");
    if (pair) { location.hash = "compare=" + pair.dataset.pair.split(",").map(encodeURIComponent).join(","); window.scrollTo(0, 0); return; }
    const b = e.target.closest("button[data-id]");
    if (b) toggle(b.dataset.id);
  });
  $("diffOnly").addEventListener("change", renderTable);
  // "Compact" hides photos, hints and extras so the table fits on one screen. Remembered per browser.
  const setDataOnly = on => { $("dataOnly").checked = on; $("compare").classList.toggle("data-only", on); };
  try { setDataOnly(localStorage.getItem("dataOnly") === "1"); } catch {}
  $("dataOnly").addEventListener("change", () => {
    setDataOnly($("dataOnly").checked);
    try { localStorage.setItem("dataOnly", $("dataOnly").checked ? "1" : "0"); } catch {}
  });
  window.addEventListener("hashchange", readHash);
  window.addEventListener("popstate", syncZoom); // Back/Forward between pushState entries
  // Photo failed (moved, hotlink-blocked, offline) → fall back to the drawn racket.
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.id) return;
    const pic = img.closest(".pic, .zoom-pic");
    if (pic) img.outerHTML = racketImage(byId.get(img.dataset.id), true); // keeps the pick badge
  }, true);

  readHash();
})();
