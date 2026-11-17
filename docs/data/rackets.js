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
  // ---- Babolat (babolat.com spec sheets) ----
  { id: "babolat-pure-aero-gen9", brand: "Babolat", model: "Pure Aero Gen9",
    headSize: 100, weight: 300, balance: 32.1, swingweight: 320, swingweightType: "strung", stiffness: 66, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#f2c400", "#1b1b1b"],
    image: "img/babolat-pure-aero-gen9.png" },
  { id: "babolat-pure-drive-gen11", brand: "Babolat", model: "Pure Drive Gen11",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 317, swingweightType: "strung", stiffness: 69, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#111827"],
    image: "img/babolat-pure-drive-gen11.png" },
  { id: "babolat-pure-strike-100-gen4", brand: "Babolat", model: "Pure Strike 100 Gen4",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 324, swingweightType: "strung", stiffness: 63, beam: "21/23/21", length: 27, pattern: "16x19",
    colors: ["#9aa0a8", "#d8382e"],
    image: "img/babolat-pure-strike-100-gen4.png" },

  // ---- Wilson (wilson.com listings; photos from Tennis Warehouse) ----
  { id: "wilson-pro-staff-97-v14", brand: "Wilson", model: "Pro Staff 97 V14",
    headSize: 97, weight: 315, balance: 31.0, swingweight: 332, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#2a2420", "#1a1a1a"],
    image: "img/wilson-pro-staff-97-v14.jpg" },
  { id: "wilson-blade-98-16x19-v10", brand: "Wilson", model: "Blade 98 16x19 V10",
    headSize: 98, weight: 305, balance: 32.0, swingweight: 322, swingweightType: "strung", stiffness: 61, beam: "21.5→20.5", length: 27, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"],
    image: "img/wilson-blade-98-16x19-v10.webp" },
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

  // ---- Tecnifibre (b2b.tecnifibre.com spec sheet; photo from Tennis Warehouse) ----
  { id: "tecnifibre-tf40-305-16m-v3", brand: "Tecnifibre", model: "TF-40 305 16M V3",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 320, swingweightType: "strung", stiffness: 64, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#e9e9e9", "#c0272d"],
    image: "img/tecnifibre-tf40-305-16m-v3.webp" },

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

  // ---- Mizuno (usa.mizuno.com spec tables; photos from Tennis Warehouse) ----
  { id: "mizuno-acrospeed-300", brand: "Mizuno", model: "Acrospeed 300",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 324, swingweightType: "strung", stiffness: 69, beam: "24/26/21.5/21", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#1a1a1a"],
    image: "img/mizuno-acrospeed-300.webp" },
  { id: "mizuno-acrostrike-305", brand: "Mizuno", model: "Acrostrike 305",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 325, swingweightType: "strung", stiffness: 63, beam: "21/23/22/22", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/mizuno-acrostrike-305.webp" }
];
