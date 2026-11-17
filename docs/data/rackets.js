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
    image: "img/wilson-blade-98-16x19-v10.jpg" },
  { id: "wilson-clash-100-v3", brand: "Wilson", model: "Clash 100 V3",
    // unstrung balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 292.5, balance: 31.0, swingweight: 308, swingweightType: "strung", stiffness: 54, beam: "24.5", length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-clash-100-v3.jpg" },
  { id: "wilson-clash-100-pro-v3", brand: "Wilson", model: "Clash 100 Pro V3",
    // unstrung weight/balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 305, balance: 31.0, swingweight: 327, swingweightType: "strung", stiffness: 57, beam: "24.5", length: 27, pattern: "16x20",
    colors: ["#c62828", "#1a1a1a"],
    image: "img/wilson-clash-100-pro-v3.jpg" },
  { id: "wilson-ultra-100-v5", brand: "Wilson", model: "Ultra 100 V5",
    // unstrung balance from retailer listings of Wilson's spec (wilson.com blocks automated access)
    headSize: 100, weight: 300, balance: 32.0, swingweight: 322, swingweightType: "strung", stiffness: 67, beam: "24/26.5/24.5", length: 27, pattern: "16x19",
    colors: ["#1e63b5", "#0f1f3a"],
    image: "img/wilson-ultra-100-v5.jpg" },

  // ---- Head (head.com listings; photos from Tennis Warehouse) ----
  { id: "head-speed-mp-2026", brand: "Head", model: "Speed MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 329, swingweightType: "strung", stiffness: 60, beam: "23", length: 27, pattern: "16x19",
    colors: ["#f0f0f0", "#1a1a1a"],
    image: "img/head-speed-mp-2026.jpg" },
  { id: "head-extreme-mp-2026", brand: "Head", model: "Extreme MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 318, swingweightType: "strung", stiffness: 67, beam: "23/26/21", length: 27, pattern: "16x19",
    colors: ["#b8d62a", "#1a1a1a"],
    image: "img/head-extreme-mp-2026.jpg" },
  { id: "head-radical-mp-2025", brand: "Head", model: "Radical MP 2025",
    headSize: 98, weight: 300, balance: 32.0, swingweight: 323, swingweightType: "strung", stiffness: 66, beam: "20/23/21", length: 27, pattern: "16x19",
    colors: ["#f07a1a", "#1d3b78"],
    image: "img/head-radical-mp-2025.jpg" },
  { id: "head-gravity-mp-2025", brand: "Head", model: "Gravity MP 2025",
    headSize: 100, weight: 295, balance: 32.5, swingweight: 323, swingweightType: "strung", stiffness: 57, beam: "22", length: 27, pattern: "16x20",
    colors: ["#d23c3c", "#1c5d8c"],
    image: "img/head-gravity-mp-2025.jpg" },
  { id: "head-prestige-mp-2023", brand: "Head", model: "Prestige MP 2023",
    headSize: 99, weight: 310, balance: 32.0, swingweight: 327, swingweightType: "strung", stiffness: 62, beam: "21.5", length: 27, pattern: "18x19",
    colors: ["#8e1b1b", "#1a1a1a"],
    image: "img/head-prestige-mp-2023.jpg" },

  // ---- Yonex (yonex.com spec sheets) ----
  { id: "yonex-ezone-98-8th", brand: "Yonex", model: "EZONE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 320, swingweightType: "strung", stiffness: 63, beam: "23.8/24.5/19.5", length: 27, pattern: "16x19",
    colors: ["#1d4fb8", "#f2f2f2"],
    image: "img/yonex-ezone-98-8th.jpg" },
  { id: "yonex-ezone-100-8th", brand: "Yonex", model: "EZONE 100 (8th gen)",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 315, swingweightType: "strung", stiffness: 68, beam: "24.5/26.5/23", length: 27, pattern: "16x19",
    colors: ["#1f4fc4", "#f2f2f2"],
    image: "img/yonex-ezone-100-8th.jpg" },
  { id: "yonex-vcore-98-8th", brand: "Yonex", model: "VCORE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 321, swingweightType: "strung", stiffness: 63, beam: "23/23.5/22", length: 27, pattern: "16x19",
    colors: ["#b3122e", "#1a1a1a"],
    image: "img/yonex-vcore-98-8th.jpg" },
  { id: "yonex-percept-97", brand: "Yonex", model: "Percept 97",
    headSize: 97, weight: 310, balance: 31.0, swingweight: 315, swingweightType: "strung", stiffness: 60, beam: "21/21/21", length: 27, pattern: "16x19",
    colors: ["#5b6b3a", "#1a1a1a"],
    image: "img/yonex-percept-97.png" },

  // ---- Tecnifibre (b2b.tecnifibre.com spec sheet; photo from Tennis Warehouse) ----
  { id: "tecnifibre-tf40-305-16m-v3", brand: "Tecnifibre", model: "TF-40 305 16M V3",
    headSize: 98, weight: 305, balance: 32.5, swingweight: 320, swingweightType: "strung", stiffness: 64, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#e9e9e9", "#c0272d"],
    image: "img/tecnifibre-tf40-305-16m-v3.jpg" },

  // ---- Dunlop (us.dunlopsports.com "2027 CX Series" spec table) ----
  { id: "dunlop-cx-200-2027", brand: "Dunlop", model: "CX 200 (2027)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 316, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-200-2027.jpg" }
];
