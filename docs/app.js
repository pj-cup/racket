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
    { key: "headSize", emoji: "🎯",  label: "Head size",  unit: " sq in", num: r => r.headSize,
      hint: "Bigger = more forgiving, less precise", extremes: ["Biggest", "Smallest"], delta: (r, a) => signed(r.headSize - a.headSize, " sq in") },
    { key: "weight", emoji: "🏋️",    label: "Weight",     unit: " g", num: r => r.weight,
      hint: "Unstrung. Heavier = more stable, more effort", extremes: ["Heaviest", "Lightest"], delta: (r, a) => signed(r.weight - a.weight, " g") },
    { key: "balance", emoji: "⚖️",   label: "Balance",    fmt: fmtBalance, num: r => balancePts(r), scale: v => ptsLabel(Math.round(v)),
      sub: r => has(r.balance) ? `${r.balance.toFixed(1)} cm` : "",
      hint: "Unstrung. More pts HL = quicker hands, less plow", extremes: ["Most HL", "Least HL"],
      delta: (r, a) => { const d = Math.round(balancePts(r)) - Math.round(balancePts(a)); return d === 0 ? "" : `${pts(Math.abs(d))} ${d > 0 ? "more" : "less"} HL`; } },
    // Every racket uses Tennis Warehouse strung swing weight, so they compare directly (group kept as a guard).
    { key: "swingweight", emoji: "💨", label: "Swing weight", fmt: r => has(r.swingweight) ? `${r.swingweight}` : NA,
      num: r => r.swingweight, group: r => r.swingweightType, extremes: ["Highest", "Lowest"],
      hint: "Strung. Higher = more power and stability, slower to swing", delta: (r, a) => signed(r.swingweight - a.swingweight, "") },
    { key: "stiffness", emoji: "💪", label: "Stiffness",  unit: " RA", num: r => r.stiffness,
      hint: "Higher = more power, less comfort", extremes: ["Stiffest", "Softest"], delta: (r, a) => signed(r.stiffness - a.stiffness, " RA") },
    { key: "pattern", emoji: "🕸️",   label: "String pattern", hint: "Open (16x19) = more spin; dense (18x20) = more control" },
    { key: "beam", emoji: "📐",      label: "Beam",       unit: " mm", hint: "Thicker = more power, less feel" },
    { key: "length", emoji: "📏",    label: "Length",     unit: " in", num: r => r.length, extremes: ["Longest", "Shortest"], delta: (r, a) => signed(r.length - a.length, " in") },
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

  let selected = [];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

  // ---------- Full-screen viewer ----------
  function openZoom(id) {
    const r = byId.get(id);
    if (!r) return;
    const keySpecs = ["headSize", "weight", "balance", "pattern"]
      .map(k => { const f = FIELDS.find(f => f.key === k); return `${f.emoji} ${f.fmt(r)}`; }).join(" · ");
    $("zoomPic").className = "zoom-pic" + (r.image ? " photo" : "");
    $("zoomPic").innerHTML = r.image
      ? `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" referrerpolicy="no-referrer">`
      : racketImage(r, true);
    $("zoomTitle").innerHTML = `<span class="brand">${esc(r.brand)}</span>${esc(r.model)}`;
    $("zoomMeta").innerHTML = `${esc(keySpecs)}`;
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

  function filtered() {
    const words = $("q").value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const brand = $("brand").value;
    const head = $("head").value;
    const sort = $("sort").value;
    let list = data.filter(r => {
      if (brand && r.brand !== brand) return false;
      const text = `${r.brand} ${r.model}`.toLowerCase();
      if (!words.every(w => text.includes(w))) return false; // every word, any order
      if (head) {
        const [lo, hi] = head.split("-").map(Number);
        if (r.headSize < lo || r.headSize > hi) return false;
      }
      return true;
    });
    list.sort((a, b) => sort === "brand"
      ? (a.brand + a.model).localeCompare(b.brand + b.model)
      : !has(a[sort]) ? 1 : !has(b[sort]) ? -1 : a[sort] - b[sort]); // unpublished values last
    return list;
  }

  function renderGrid() {
    const list = filtered();
    $("count").textContent = `${list.length} of ${data.length} rackets`;
    const full = selected.length >= MAX;
    $("grid").innerHTML = list.map(r => {
      const on = selected.includes(r.id);
      const rows = FIELDS.filter(f => CARD_FIELDS.includes(f.key))
        .map(f => `<dt>${f.emoji} ${f.label}</dt><dd>${esc(f.fmt(r))}</dd>`).join("");
      return `<article class="card${on ? " selected" : ""}">
        ${picBox(r, "")}
        <div><div class="brand">${esc(r.brand)}</div><h3>${esc(r.model)}</h3></div>
        <dl class="specs">${rows}</dl>
        <button class="btn ${on ? "on" : "ghost"}" data-id="${esc(r.id)}" ${!on && full ? "disabled title=\"Up to 4 rackets\"" : ""}>
          ${on ? "✓ Added to compare" : "+ Compare"}
        </button>
      </article>`;
    }).join("") || `<p class="muted">No rackets match.</p>`;
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
      return `<tr class="${differs ? "" : "same"}"><th scope="row"><span class="emo">${f.emoji} </span>${f.label}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}${range}</th>${cells}</tr>`;
    };

    const body = TABLE_GROUPS.map(g => {
      const rows = g.keys.map(k => row(FIELDS.find(f => f.key === k))).join("");
      return rows ? `<tr class="group"><th colspan="${rs.length + 1}" scope="colgroup">${g.name}</th></tr>${rows}` : "";
    }).join("");

    $("table").dataset.cols = rs.length;
    $("table").innerHTML = head + `<tbody>${body || `<tr><td colspan="${rs.length + 1}" class="muted">No differences.</td></tr>`}</tbody>`;
  }

  // ---------- Routing (#compare=id1,id2 is shareable) ----------
  function readHash() {
    const m = location.hash.match(/^#compare=(.*)$/);
    if (m) selected = [...new Set(m[1].split(",").map(decodeURIComponent))].filter(id => byId.has(id)).slice(0, MAX);
    const showCompare = !!m && selected.length >= 2;
    if (showCompare) { // rewrite the URL to what's actually shown (deduped, unknown ids dropped, max 4)
      const canon = "#compare=" + selected.map(encodeURIComponent).join(",");
      if (location.hash !== canon) history.replaceState(null, "", canon);
    }
    $("compare").hidden = !showCompare;
    $("browse").hidden = showCompare;
    render();
  }

  function sync() {
    if (!$("compare").hidden) {
      if (selected.length < 2) { location.hash = ""; return; }
      history.replaceState(null, "", "#compare=" + selected.map(encodeURIComponent).join(","));
    }
    render();
  }

  function render() {
    if ($("compare").hidden) renderGrid(); else renderTable();
    renderTray();
  }

  // ---------- Events ----------
  ["q", "brand", "head", "sort"].forEach(id => $(id).addEventListener("input", renderGrid));
  document.addEventListener("click", e => {
    const p = e.target.closest("[data-zoom]");
    if (p) openZoom(p.dataset.zoom);
  });
  document.addEventListener("keydown", e => {
    const p = e.target.closest && e.target.closest("[data-zoom]");
    if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openZoom(p.dataset.zoom); }
  });
  $("zoomClose").addEventListener("click", () => $("zoom").close());
  // Click on the backdrop (the dialog itself, outside its content) closes it. Esc is built in.
  $("zoom").addEventListener("click", e => { if (e.target === $("zoom")) $("zoom").close(); });
  $("grid").addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (b) toggle(b.dataset.id);
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
  $("copyLink").addEventListener("click", async () => {
    const b = $("copyLink");
    try {
      await navigator.clipboard.writeText(location.href);
      b.textContent = "Copied ✓";
      setTimeout(() => { b.textContent = "Copy link"; }, 1500);
    } catch {
      prompt("Copy this link", location.href); // no clipboard access (e.g. file://)
    }
  });
  $("back").addEventListener("click", () => { location.hash = ""; });
  $("diffOnly").addEventListener("change", renderTable);
  window.addEventListener("hashchange", readHash);
  // Photo failed (moved, hotlink-blocked, offline) → fall back to the drawn racket.
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.id) return;
    const pic = img.closest(".pic, .zoom-pic");
    if (pic) pic.innerHTML = racketImage(byId.get(img.dataset.id), true);
  }, true);

  readHash();
})();
