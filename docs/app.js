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
    const p = Math.round(balancePts(r));
    return `${r.balance} cm (${p === 0 ? "even" : p > 0 ? p + " pts HL" : -p + " pts HH"})`;
  };

  const FIELDS = [
    { key: "headSize",  label: "Head size",  unit: " sq in", num: r => r.headSize },
    { key: "weight",    label: "Weight",     unit: " g", num: r => r.weight },
    { key: "balance",   label: "Balance",    fmt: fmtBalance, num: r => r.balance },
    // Strung and unstrung swing weights differ by ~20–30, so bars only compare like with like.
    { key: "swingweight", label: "Swing weight", fmt: r => has(r.swingweight) ? `${r.swingweight} (${r.swingweightType})` : NA,
      num: r => r.swingweight, group: r => r.swingweightType },
    { key: "stiffness", label: "Stiffness",  unit: " RA", num: r => r.stiffness },
    { key: "pattern",   label: "String pattern" },
    { key: "beam",      label: "Beam",       unit: " mm" },
    { key: "length",    label: "Length",     unit: " in", num: r => r.length },
  ];
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
  function racketImage(r, drawOnly) {
    if (r.image && !drawOnly) {
      return `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
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
    `<div class="pic ${cls}" data-zoom="${esc(r.id)}" role="button" tabindex="0" aria-label="View ${esc(r.brand + " " + r.model)} full screen">${racketImage(r)}</div>`;

  // ---------- Full-screen viewer ----------
  function openZoom(id) {
    const r = byId.get(id);
    if (!r) return;
    const keySpecs = ["headSize", "weight", "balance", "pattern"]
      .map(k => FIELDS.find(f => f.key === k).fmt(r)).join(" · ");
    $("zoomPic").className = "zoom-pic" + (r.image ? " photo" : "");
    $("zoomPic").innerHTML = r.image
      ? `<img src="${esc(r.image)}" alt="${esc(r.brand + " " + r.model)}" data-id="${esc(r.id)}" referrerpolicy="no-referrer">`
      : racketImage(r, true);
    $("zoomTitle").innerHTML = `<span class="brand">${esc(r.brand)}</span>${esc(r.model)}`;
    $("zoomMeta").innerHTML = `${esc(keySpecs)}`;
    $("zoom").showModal();
  }

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
        .map(f => `<dt>${f.label}</dt><dd>${esc(f.fmt(r))}</dd>`).join("");
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
  function renderTable() {
    const rs = selected.map(id => byId.get(id));
    const diffOnly = $("diffOnly").checked;
    const head = `<thead><tr><th></th>${rs.map(r =>
      `<th>${picBox(r, "small")}<span class="brand">${esc(r.brand)}</span>${esc(r.model)}<button class="remove" data-remove="${esc(r.id)}" aria-label="Remove">×</button></th>`
    ).join("")}</tr></thead>`;

    const body = FIELDS.map(f => {
      const vals = rs.map(f.fmt);
      const differs = new Set(vals).size > 1;
      if (diffOnly && !differs) return "";
      let cells;
      if (f.num) {
        const [lo, hi] = ranges[f.key];
        const nums = rs.map(f.num);
        const known = nums.filter(has);
        const max = Math.max(...known);
        const comparable = !f.group || new Set(rs.filter(r => has(f.num(r))).map(f.group)).size <= 1;
        cells = rs.map((r, i) => {
          if (!has(nums[i]) || !comparable) return `<td>${esc(vals[i])}</td>`;
          const pct = hi === lo ? 100 : 15 + 85 * (nums[i] - lo) / (hi - lo);
          const top = differs && known.length > 1 && nums[i] === max;
          return `<td class="${top ? "hi" : ""}">${esc(vals[i])}<div class="bar"><span style="width:${pct}%"></span></div></td>`;
        });
      } else {
        cells = vals.map(v => `<td>${esc(v)}</td>`);
      }
      return `<tr class="${differs ? "diff" : ""}"><th scope="row">${f.label}</th>${cells.join("")}</tr>`;
    }).join("");

    $("table").innerHTML = head + `<tbody>${body || `<tr><td class="muted">No differences.</td></tr>`}</tbody>`;
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
