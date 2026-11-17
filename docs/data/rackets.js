// Racket spec data — current models (checked Nov 2026). Loaded as a plain script so the site also works from file://.
//
// Units: headSize sq in · weight g (unstrung) · balance cm (unstrung) · stiffness RA · beam mm · length in.
// stiffness RA: always Tennis Warehouse's measurement (same lab as swingweight), for every racket.
// beam: from the brand, or Tennis Warehouse where the brand doesn't publish it (a physical width, same either way).
// balance: unstrung, from the brand (or a retailer listing of the brand's spec). Never Tennis Warehouse's strung balance.
// swingweight kg·cm²: always Tennis Warehouse's strung measurement (one lab, so every racket compares directly);
//   swingweightType is always "strung". Source per racket: tennis-warehouse.com product page or playtest review.
// Other specs come from the brand. null = not published anywhere comparable (shown as "—"); never guessed.
//
// image:  "img/<racket-id>.<ext>" relative to docs/ (product photo, saved locally). Without it (or if it fails) an SVG is drawn.
// colors: [frame, grip] for the drawn SVG only.
window.RACKETS = [
  // ---- Babolat (babolat.com spec sheets; photos from Tennis Warehouse) ----
  { id: "babolat-pure-aero-gen9", brand: "Babolat", model: "Pure Aero Gen9",
    headSize: 100, weight: 300, balance: 32.1, swingweight: 320, swingweightType: "strung", stiffness: 66, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#f2c400", "#1b1b1b"],
    image: "img/babolat-pure-aero-gen9.webp" },
  { id: "babolat-pure-drive-gen11", brand: "Babolat", model: "Pure Drive Gen11",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 317, swingweightType: "strung", stiffness: 69, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#111827"],
    image: "img/babolat-pure-drive-gen11.webp" },
  { id: "babolat-pure-strike-100-gen4", brand: "Babolat", model: "Pure Strike 100 Gen4",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 324, swingweightType: "strung", stiffness: 63, beam: "21/23/21", length: 27, pattern: "16x19",
    colors: ["#9aa0a8", "#d8382e"],
    image: "img/babolat-pure-strike-100-gen4.jpg" },
  { id: "babolat-pure-aero-98-gen9", brand: "Babolat", model: "Pure Aero 98 Gen9",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 322, swingweightType: "strung", stiffness: 66, beam: "21/23/22", length: 27, pattern: "16x20",
    colors: ["#f2c400", "#3a3d42"],
    image: "img/babolat-pure-aero-98-gen9.webp" },
  { id: "babolat-pure-drive-98-gen11", brand: "Babolat", model: "Pure Drive 98 Gen11",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 326, swingweightType: "strung", stiffness: 69, beam: "21/23/22", length: 27, pattern: "16x20",
    colors: ["#1f5fbf", "#111827"],
    image: "img/babolat-pure-drive-98-gen11.webp" },
  { id: "babolat-pure-strike-97-gen4", brand: "Babolat", model: "Pure Strike 97 Gen4",
    // swingweight/stiffness from the Tennis Warehouse playtest review (PS97Sreview); the product page is no longer listed
    headSize: 97, weight: 310, balance: 31.0, swingweight: 321, swingweightType: "strung", stiffness: 63, beam: "21/22/21", length: 27, pattern: "16x20",
    colors: ["#9aa0a8", "#d8382e"],
    image: "img/babolat-pure-strike-97-gen4.jpg" },
  { id: "babolat-pure-strike-98-18x20-gen4", brand: "Babolat", model: "Pure Strike 98 18x20 Gen4",
    headSize: 98, weight: 305, balance: 32.0, swingweight: 332, swingweightType: "strung", stiffness: 63, beam: "21/23/21", length: 27, pattern: "18x20",
    colors: ["#6b7078", "#1a1a1a"],
    image: "img/babolat-pure-strike-98-18x20-gen4.webp" },
  { id: "babolat-pure-drive-plus-gen11", brand: "Babolat", model: "Pure Drive Plus Gen11",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 325, swingweightType: "strung", stiffness: 69, beam: "23/26/23", length: 27.5, pattern: "16x19",
    colors: ["#1f5fbf", "#111827"],
    image: "img/babolat-pure-drive-plus-gen11.webp" },
  { id: "babolat-pure-aero-plus-gen9", brand: "Babolat", model: "Pure Aero Plus Gen9",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 330, swingweightType: "strung", stiffness: 65, beam: "23/26/23", length: 27.5, pattern: "16x19",
    colors: ["#f2c400", "#1b1b1b"],
    image: "img/babolat-pure-aero-plus-gen9.webp" },

  // ---- Wilson (wilson.com listings; photos from Tennis Warehouse) ----
  { id: "wilson-pro-staff-97-v14", brand: "Wilson", model: "Pro Staff 97 V14",
    headSize: 97, weight: 315, balance: 31.0, swingweight: 332, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#2a2420", "#1a1a1a"],
    image: "img/wilson-pro-staff-97-v14.jpg" },
  { id: "wilson-blade-98-16x19-v10", brand: "Wilson", model: "Blade 98 16x19 V10",
    headSize: 98, weight: 305, balance: 32.0, swingweight: 322, swingweightType: "strung", stiffness: 61, beam: "21.5→20.5", length: 27, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"],
    image: "img/wilson-blade-98-16x19-v10.webp" },
  { id: "wilson-blade-98-18x20-v10", brand: "Wilson", model: "Blade 98 18x20 V10",
    // unstrung weight/balance from Wilson's spec (nz.wilson.com); beam from Tennis Warehouse
    headSize: 98, weight: 305, balance: 32.0, swingweight: 325, swingweightType: "strung", stiffness: 61, beam: "21.5/21.5/20.5", length: 27, pattern: "18x20",
    colors: ["#3f6b3a", "#1a1a1a"],
    image: "img/wilson-blade-98-18x20-v10.webp" },
  { id: "wilson-clash-100-v3", brand: "Wilson", model: "Clash 100 V3",
    // unstrung balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 292.5, balance: 31.0, swingweight: 308, swingweightType: "strung", stiffness: 54, beam: "24.5", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-clash-100-v3.webp" },
  { id: "wilson-clash-100-pro-v3", brand: "Wilson", model: "Clash 100 Pro V3",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 305, balance: 31.0, swingweight: 327, swingweightType: "strung", stiffness: 57, beam: "24.5", length: 27, pattern: "16x20",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-clash-100-pro-v3.webp" },
  { id: "wilson-ultra-100-v5", brand: "Wilson", model: "Ultra 100 V5",
    // unstrung balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 300, balance: 32.0, swingweight: 322, swingweightType: "strung", stiffness: 67, beam: "24/26.5/24.5", length: 27, pattern: "16x19",
    colors: ["#1e63b5", "#0f1f3a"],
    image: "img/wilson-ultra-100-v5.webp" },
  { id: "wilson-ultra-99-pro-v5", brand: "Wilson", model: "Ultra 99 Pro V5",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 99, weight: 305, balance: 32.5, swingweight: 330, swingweightType: "strung", stiffness: 69, beam: "22/23.5/21.5", length: 27, pattern: "16x18",
    colors: ["#1e63b5", "#0f1f3a"],
    image: "img/wilson-ultra-99-pro-v5.webp" },
  { id: "wilson-rf-01-pro", brand: "Wilson", model: "RF 01 Pro",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 98, weight: 320, balance: 31.5, swingweight: 331, swingweightType: "strung", stiffness: 67, beam: "23.2/23/22", length: 27, pattern: "16x19",
    colors: ["#1a1a1a", "#1a1a1a"],
    image: "img/wilson-rf-01-pro.webp" },
  { id: "wilson-blade-100-v10", brand: "Wilson", model: "Blade 100 V10",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 100, weight: 300, balance: 32.0, swingweight: 319, swingweightType: "strung", stiffness: 61, beam: "22", length: 27, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"],
    image: "img/wilson-blade-100-v10.webp" },
  { id: "wilson-defyer-98-pro", brand: "Wilson", model: "Defyer 98 Pro",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 98, weight: 305, balance: 31.5, swingweight: 319, swingweightType: "strung", stiffness: 64, beam: "22/23.5/22", length: 27, pattern: "16x20",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-defyer-98-pro.webp" },
  { id: "wilson-defyer-100", brand: "Wilson", model: "Defyer 100",
    // unstrung weight/balance from Wilson's spec (sg.wilson.com); beam from Tennis Warehouse
    headSize: 100, weight: 300, balance: 31.5, swingweight: 326, swingweightType: "strung", stiffness: 66, beam: "23.8/25/23", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-defyer-100.webp" },
  { id: "wilson-pro-staff-x-v14", brand: "Wilson", model: "Pro Staff X V14",
    // unstrung weight/balance and beam from retailer listings of Wilson's spec (wilson.com blocks automated access);
    // swingweight/stiffness from the Tennis Warehouse playtest review (W97VXreview); the product page is no longer listed
    headSize: 100, weight: 315, balance: 31.0, swingweight: 322, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#2a2420", "#1a1a1a"],
    image: "img/wilson-pro-staff-x-v14.jpg" },
  { id: "wilson-clash-100l-v3", brand: "Wilson", model: "Clash 100L V3",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 100, weight: 280, balance: 31.5, swingweight: 301, swingweightType: "strung", stiffness: 54, beam: "24.5", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-clash-100l-v3.webp" },
  { id: "wilson-blade-104-v10", brand: "Wilson", model: "Blade 104 V10",
    // unstrung weight/balance from Wilson's spec (wilson.com listing, via search; wilson.com blocks automated access); beam from Tennis Warehouse
    headSize: 104, weight: 290, balance: 32.0, swingweight: 315, swingweightType: "strung", stiffness: 64, beam: "22", length: 27.5, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"],
    image: "img/wilson-blade-104-v10.webp" },

  // ---- Head (head.com listings; photos from Tennis Warehouse) ----
  { id: "head-speed-mp-2026", brand: "Head", model: "Speed MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 329, swingweightType: "strung", stiffness: 60, beam: "23", length: 27, pattern: "16x19",
    colors: ["#f0f0f0", "#1a1a1a"],
    image: "img/head-speed-mp-2026.webp" },
  { id: "head-speed-mp-legend-2025", brand: "Head", model: "Speed MP Legend 2025",
    // unstrung weight/balance and beam from retailer listings of Head's spec (head.com blocks automated access)
    headSize: 100, weight: 300, balance: 32.0, swingweight: 329, swingweightType: "strung", stiffness: 60, beam: "23", length: 27, pattern: "16x19",
    colors: ["#1a1a1a", "#1a1a1a"],
    image: "img/head-speed-mp-legend-2025.webp" },
  { id: "head-extreme-mp-2026", brand: "Head", model: "Extreme MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 318, swingweightType: "strung", stiffness: 67, beam: "23/26/21", length: 27, pattern: "16x19",
    colors: ["#b8d62a", "#1a1a1a"],
    image: "img/head-extreme-mp-2026.webp" },
  { id: "head-radical-mp-2025", brand: "Head", model: "Radical MP 2025",
    headSize: 98, weight: 300, balance: 32.0, swingweight: 323, swingweightType: "strung", stiffness: 66, beam: "20/23/21", length: 27, pattern: "16x19",
    colors: ["#f07a1a", "#1d3b78"],
    image: "img/head-radical-mp-2025.webp" },
  { id: "head-gravity-mp-2025", brand: "Head", model: "Gravity MP 2025",
    headSize: 100, weight: 295, balance: 32.5, swingweight: 323, swingweightType: "strung", stiffness: 57, beam: "22", length: 27, pattern: "16x20",
    colors: ["#d23c3c", "#1c5d8c"],
    image: "img/head-gravity-mp-2025.webp" },
  { id: "head-prestige-mp-2023", brand: "Head", model: "Prestige MP 2023",
    headSize: 99, weight: 310, balance: 32.0, swingweight: 327, swingweightType: "strung", stiffness: 62, beam: "21.5", length: 27, pattern: "18x19",
    colors: ["#8e1b1b", "#1a1a1a"],
    image: "img/head-prestige-mp-2023.jpg" },
  { id: "head-squared", brand: "Head", model: "Squared",
    // weight/balance/beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 100, weight: 295, balance: 29.5, swingweight: 291, swingweightType: "strung", stiffness: 60, beam: "23/25/24", length: 27, pattern: "16x18",
    colors: ["#b8bcc2", "#1a1a1a"],
    image: "img/head-squared.webp" },
  { id: "head-boom-mp-2026", brand: "Head", model: "Boom MP 2026",
    // unstrung weight/balance/beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 100, weight: 295, balance: 31.5, swingweight: 316, swingweightType: "strung", stiffness: 61, beam: "24", length: 27, pattern: "16x19",
    colors: ["#e8644a", "#1a1a1a"],
    image: "img/head-boom-mp-2026.webp" },
  { id: "head-speed-pro-2026", brand: "Head", model: "Speed Pro 2026",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 100, weight: 310, balance: 31.0, swingweight: 328, swingweightType: "strung", stiffness: 61, beam: "23", length: 27, pattern: "18x20",
    colors: ["#f0f0f0", "#1a1a1a"],
    image: "img/head-speed-pro-2026.webp" },
  { id: "head-extreme-pro-2026", brand: "Head", model: "Extreme Pro 2026",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 98, weight: 305, balance: 31.5, swingweight: 319, swingweightType: "strung", stiffness: 64, beam: "22/23/21", length: 27, pattern: "16x19",
    colors: ["#b8d62a", "#1a1a1a"],
    image: "img/head-extreme-pro-2026.webp" },
  { id: "head-radical-pro-2025", brand: "Head", model: "Radical Pro 2025",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 98, weight: 315, balance: 31.5, swingweight: 329, swingweightType: "strung", stiffness: 65, beam: "20/21.5/21", length: 27, pattern: "16x19",
    colors: ["#f07a1a", "#1d3b78"],
    image: "img/head-radical-pro-2025.webp" },
  { id: "head-gravity-pro-2025", brand: "Head", model: "Gravity Pro 2025",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access);
    // a few retailers list 315 mm balance, but most (incl. Tennis Warehouse Europe) list 310 mm
    headSize: 100, weight: 315, balance: 31.0, swingweight: 329, swingweightType: "strung", stiffness: 59, beam: "20", length: 27, pattern: "18x20",
    colors: ["#1c5d8c", "#1a1a1a"],
    image: "img/head-gravity-pro-2025.webp" },
  { id: "head-boom-pro-2026", brand: "Head", model: "Boom Pro 2026",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 98, weight: 310, balance: 31.0, swingweight: 325, swingweightType: "strung", stiffness: 64, beam: "22/22/21.5", length: 27, pattern: "16x19",
    colors: ["#e8644a", "#1a1a1a"],
    image: "img/head-boom-pro-2026.webp" },
  { id: "head-prestige-pro-2023", brand: "Head", model: "Prestige Pro 2023",
    // unstrung weight/balance and beam from Head's spec via retailer listings (head.com blocks automated access)
    headSize: 98, weight: 320, balance: 31.0, swingweight: 324, swingweightType: "strung", stiffness: 58, beam: "20", length: 27, pattern: "18x20",
    colors: ["#8e1b1b", "#1a1a1a"],
    image: "img/head-prestige-pro-2023.webp" },

  // ---- Yonex (yonex.com spec sheets; photos from Tennis Warehouse) ----
  { id: "yonex-ezone-98-8th", brand: "Yonex", model: "EZONE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 320, swingweightType: "strung", stiffness: 63, beam: "23.8/24.5/19.5", length: 27, pattern: "16x19",
    colors: ["#1d4fb8", "#f2f2f2"],
    image: "img/yonex-ezone-98-8th.webp" },
  { id: "yonex-ezone-100-8th", brand: "Yonex", model: "EZONE 100 (8th gen)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 315, swingweightType: "strung", stiffness: 68, beam: "24.5/26.5/23", length: 27, pattern: "16x19",
    colors: ["#1f4fc4", "#f2f2f2"],
    image: "img/yonex-ezone-100-8th.webp" },
  { id: "yonex-vcore-98-8th", brand: "Yonex", model: "VCORE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 321, swingweightType: "strung", stiffness: 63, beam: "23/23.5/22", length: 27, pattern: "16x19",
    colors: ["#b3122e", "#1a1a1a"],
    image: "img/yonex-vcore-98-8th.webp" },
  { id: "yonex-vcore-100-8th", brand: "Yonex", model: "VCORE 100 (8th gen)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 325, swingweightType: "strung", stiffness: 65, beam: "24/26/23", length: 27, pattern: "16x19",
    colors: ["#b3122e", "#1a1a1a"],
    image: "img/yonex-vcore-100-8th.webp" },
  { id: "yonex-percept-100", brand: "Yonex", model: "Percept 100",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 318, swingweightType: "strung", stiffness: 66, beam: "23/23/23", length: 27, pattern: "16x19",
    colors: ["#5b6b3a", "#1a1a1a"],
    image: "img/yonex-percept-100.jpg" },
  { id: "yonex-ezone-98-tour-8th", brand: "Yonex", model: "EZONE 98 Tour (8th gen)",
    headSize: 98, weight: 315, balance: 32.0, swingweight: 335, swingweightType: "strung", stiffness: 62, beam: "23.8/24.5/19.5", length: 27, pattern: "16x19",
    colors: ["#1d4fb8", "#f2f2f2"],
    image: "img/yonex-ezone-98-tour-8th.webp" },
  { id: "yonex-vcore-95-8th", brand: "Yonex", model: "VCORE 95 (8th gen)",
    headSize: 95, weight: 310, balance: 31.0, swingweight: 323, swingweightType: "strung", stiffness: 62, beam: "22/22/22", length: 27, pattern: "16x20",
    colors: ["#b3122e", "#1a1a1a"],
    image: "img/yonex-vcore-95-8th.webp" },
  { id: "yonex-percept-97d", brand: "Yonex", model: "Percept 97D",
    // swingweight/stiffness from the Tennis Warehouse playtest review (PERC9Dreview); the product page is no longer listed
    headSize: 97, weight: 320, balance: 31.0, swingweight: 329, swingweightType: "strung", stiffness: 62, beam: "21/21/21", length: 27, pattern: "18x20",
    colors: ["#5b6b3a", "#1a1a1a"],
    image: "img/yonex-percept-97d.jpg" },
  { id: "yonex-percept-97", brand: "Yonex", model: "Percept 97",
    headSize: 97, weight: 310, balance: 31.0, swingweight: 315, swingweightType: "strung", stiffness: 60, beam: "21/21/21", length: 27, pattern: "16x19",
    colors: ["#5b6b3a", "#1a1a1a"],
    image: "img/yonex-percept-97.jpg" },
  { id: "yonex-muse-98", brand: "Yonex", model: "MUSE 98",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 314, swingweightType: "strung", stiffness: 57, beam: "24/24/18", length: 27, pattern: "16x18",
    colors: ["#c9ccd1", "#1a1a1a"],
    image: "img/yonex-muse-98.webp" },
  { id: "yonex-muse-100", brand: "Yonex", model: "MUSE 100",
    headSize: 100, weight: 295, balance: 32.0, swingweight: 311, swingweightType: "strung", stiffness: 55, beam: "24.5/24.5/18", length: 27, pattern: "16x18",
    colors: ["#c9ccd1", "#1a1a1a"],
    image: "img/yonex-muse-100.webp" },

  // ---- Solinco (Solinco's spec via retailer listings — solincosports.com blocks automated access; photos from Tennis Warehouse) ----
  { id: "solinco-whiteout-305-v2", brand: "Solinco", model: "Whiteout 305 v2",
    // beam from Tennis Warehouse
    headSize: 98, weight: 305, balance: 32.0, swingweight: 328, swingweightType: "strung", stiffness: 65, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#f0f0f0", "#1a1a1a"],
    image: "img/solinco-whiteout-305-v2.webp" },
  { id: "solinco-blackout-300-v2", brand: "Solinco", model: "Blackout 300 v2",
    headSize: 100, weight: 300, balance: 31.5, swingweight: 317, swingweightType: "strung", stiffness: 66, beam: "23.5/26/23", length: 27, pattern: "16x19",
    colors: ["#1a1a1a", "#1a1a1a"],
    image: "img/solinco-blackout-300-v2.webp" },

  // ---- Tecnifibre (b2b.tecnifibre.com spec sheets; photos from Tennis Warehouse) ----
  { id: "tecnifibre-tf40-305-16m-v3", brand: "Tecnifibre", model: "TF-40 305 16M V3",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 320, swingweightType: "strung", stiffness: 64, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#e9e9e9", "#c0272d"],
    image: "img/tecnifibre-tf40-305-16m-v3.webp" },
  { id: "tecnifibre-tfight-305s", brand: "Tecnifibre", model: "TFight 305S",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 324, swingweightType: "strung", stiffness: 63, beam: "22.5/23/22.5", length: 27, pattern: "18x19",
    colors: ["#f0f0f0", "#c0272d"],
    image: "img/tecnifibre-tfight-305s.webp" },

  // ---- Dunlop (us.dunlopsports.com spec tables: "2027 CX Series", SX 300, FX 500; photos from Tennis Warehouse) ----
  { id: "dunlop-cx-200-2027", brand: "Dunlop", model: "CX 200 (2027)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 316, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-200-2027.webp" },
  { id: "dunlop-sx-300-2025", brand: "Dunlop", model: "SX 300 (2025)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 318, swingweightType: "strung", stiffness: 69, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1a9e9a", "#e8d61a"],
    image: "img/dunlop-sx-300-2025.webp" },
  { id: "dunlop-fx-500-2026", brand: "Dunlop", model: "FX 500 (2026)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 320, swingweightType: "strung", stiffness: 68, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#1a1a1a"],
    image: "img/dunlop-fx-500-2026.webp" },
  { id: "dunlop-cx-400-2027", brand: "Dunlop", model: "CX 400 (2027)",
    headSize: 100, weight: 285, balance: 33.0, swingweight: 314, swingweightType: "strung", stiffness: 69, beam: "24", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-400-2027.webp" },
  { id: "dunlop-cx-400-tour-2027", brand: "Dunlop", model: "CX 400 Tour (2027)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 315, swingweightType: "strung", stiffness: 67, beam: "23", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-400-tour-2027.webp" },
  { id: "dunlop-fx-500-tour-2026", brand: "Dunlop", model: "FX 500 Tour (2026)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 322, swingweightType: "strung", stiffness: 65, beam: "21/23/21", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#1a1a1a"],
    image: "img/dunlop-fx-500-tour-2026.webp" },

  // ---- Mizuno (usa.mizuno.com spec tables; photos from Tennis Warehouse) ----
  { id: "mizuno-acrospeed-300", brand: "Mizuno", model: "Acrospeed 300",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 324, swingweightType: "strung", stiffness: 69, beam: "24/26/21.5/21", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#1a1a1a"],
    image: "img/mizuno-acrospeed-300.webp" },
  { id: "mizuno-acrostrike-305", brand: "Mizuno", model: "Acrostrike 305",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 325, swingweightType: "strung", stiffness: 63, beam: "21/23/22/22", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/mizuno-acrostrike-305.webp" },

  // ---- Prince (Prince's spec via retailer listings; photos from Tennis Warehouse) ----
  { id: "prince-phantom-100x-305-2024", brand: "Prince", model: "Phantom 100X 305 (2024)",
    // beam from Tennis Warehouse
    headSize: 100, weight: 305, balance: 31.5, swingweight: 320, swingweightType: "strung", stiffness: 59, beam: "22/20.5/18", length: 27, pattern: "16x18",
    colors: ["#1a1a1a", "#1a1a1a"],
    image: "img/prince-phantom-100x-305-2024.webp" },
  { id: "prince-tour-100-310-2026", brand: "Prince", model: "Tour 100 310 (2026)",
    // beam from Tennis Warehouse; one retailer lists 31 cm balance, but 31.5 cm is the figure given with the 2026 spec
    headSize: 100, weight: 310, balance: 31.5, swingweight: 321, swingweightType: "strung", stiffness: 63, beam: "22/23/20", length: 27, pattern: "16x18",
    colors: ["#f0f0f0", "#e8641a"],
    image: "img/prince-tour-100-310-2026.webp" },

  // ---- Volkl (Volkl's spec via retailer listings; photo from Tennis Warehouse) ----
  { id: "volkl-vostra-v8-300", brand: "Volkl", model: "Vostra V8 300g",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 323, swingweightType: "strung", stiffness: 67, beam: "22/24/22", length: 27, pattern: "16x18",
    colors: ["#1a1a1a", "#c62828"],
    image: "img/volkl-vostra-v8-300.webp" }
];
