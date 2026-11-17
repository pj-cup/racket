// Racket spec data — current models (checked Nov 2026). Loaded as a plain script so the site also works from file://.
//
// Units: headSize sq in · weight g (unstrung) · balance cm (unstrung) · stiffness RA · beam mm · length in.
// swingweight kg·cm², with swingweightType "unstrung" | "strung" (brands publish different ones — not directly comparable).
// null = the brand doesn't publish it (shown as "—"); never guessed.
//
// image:  "img/<file>" relative to docs/ (official product photo, saved locally). Without it (or if it fails) an SVG is drawn.
// colors: [frame, grip] for the drawn SVG only.
window.RACKETS = [
  // ---- Babolat (babolat.com spec sheets) ----
  { id: "babolat-pure-aero-gen9", brand: "Babolat", model: "Pure Aero Gen9",
    headSize: 100, weight: 300, balance: 32.1, swingweight: 290, swingweightType: "unstrung", stiffness: 69, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#f2c400", "#1b1b1b"],
    image: "img/babolat-pure-aero-gen9.png" },
  { id: "babolat-pure-drive-gen11", brand: "Babolat", model: "Pure Drive Gen11",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 290, swingweightType: "unstrung", stiffness: 72, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#111827"],
    image: "img/babolat-pure-drive-gen11.png" },
  { id: "babolat-pure-strike-100-gen4", brand: "Babolat", model: "Pure Strike 100 Gen4",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 295, swingweightType: "unstrung", stiffness: 68, beam: "21/23/21", length: 27, pattern: "16x19",
    colors: ["#9aa0a8", "#d8382e"],
    image: "img/babolat-pure-strike-100-gen4.png" },

  // ---- Wilson (wilson.com listings; site blocks automated access, so no photos yet) ----
  { id: "wilson-pro-staff-97-v14", brand: "Wilson", model: "Pro Staff 97 V14",
    headSize: 97, weight: 315, balance: 31.0, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "16x19",
    colors: ["#2a2420", "#1a1a1a"] },
  { id: "wilson-blade-98-16x19-v10", brand: "Wilson", model: "Blade 98 16x19 V10",
    headSize: 98, weight: 305, balance: 32.0, swingweight: 330, swingweightType: "strung", stiffness: 60, beam: "21.5→20.5", length: 27, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"] },
  { id: "wilson-clash-100-v3", brand: "Wilson", model: "Clash 100 V3",
    // swingweight/stiffness from Wilson's US Open 2026 edition listing (same frame, different paint)
    headSize: 100, weight: 292.5, balance: null, swingweight: 304, swingweightType: "strung", stiffness: 51, beam: null, length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"] },
  { id: "wilson-ultra-100-v5", brand: "Wilson", model: "Ultra 100 V5",
    headSize: 100, weight: 300, balance: null, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "16x19",
    colors: ["#1e63b5", "#0f1f3a"] },

  // ---- Head (head.com listings; site blocks automated access, so no photos yet) ----
  { id: "head-speed-mp-2026", brand: "Head", model: "Speed MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "23", length: 27, pattern: "16x19",
    colors: ["#f0f0f0", "#1a1a1a"] },
  { id: "head-extreme-mp-2026", brand: "Head", model: "Extreme MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "23/26/21", length: 27, pattern: "16x19",
    colors: ["#b8d62a", "#1a1a1a"] },
  { id: "head-radical-mp-2025", brand: "Head", model: "Radical MP 2025",
    headSize: 98, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "20/23/21", length: 27, pattern: "16x19",
    colors: ["#f07a1a", "#1d3b78"] },
  { id: "head-gravity-mp-2025", brand: "Head", model: "Gravity MP 2025",
    headSize: 100, weight: 295, balance: 32.5, swingweight: null, swingweightType: null, stiffness: null, beam: "22", length: 27, pattern: "16x20",
    colors: ["#d23c3c", "#1c5d8c"] },
  { id: "head-prestige-mp-2023", brand: "Head", model: "Prestige MP 2023",
    headSize: 99, weight: 310, balance: null, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "18x19",
    colors: ["#8e1b1b", "#1a1a1a"] },

  // ---- Yonex (yonex.com spec sheets) ----
  { id: "yonex-ezone-98-8th", brand: "Yonex", model: "EZONE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: null, swingweightType: null, stiffness: null, beam: "23.8/24.5/19.5", length: 27, pattern: "16x19",
    colors: ["#1d4fb8", "#0c1f4a"],
    image: "img/yonex-ezone-98-8th.jpg" },
  { id: "yonex-vcore-98-8th", brand: "Yonex", model: "VCORE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: null, swingweightType: null, stiffness: null, beam: "23/23.5/22", length: 27, pattern: "16x19",
    colors: ["#b3122e", "#1a1a1a"],
    image: "img/yonex-vcore-98-8th.jpg" },
  { id: "yonex-percept-97", brand: "Yonex", model: "Percept 97",
    headSize: 97, weight: 310, balance: 31.0, swingweight: null, swingweightType: null, stiffness: null, beam: "21/21/21", length: 27, pattern: "16x19",
    colors: ["#5b6b3a", "#1a1a1a"],
    image: "img/yonex-percept-97.png" },

  // ---- Tecnifibre (b2b.tecnifibre.com spec sheet; only close-up photos available) ----
  { id: "tecnifibre-tf40-305-16m-v3", brand: "Tecnifibre", model: "TF-40 305 16M V3",
    headSize: 98, weight: 305, balance: 32.5, swingweight: null, swingweightType: null, stiffness: null, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#e9e9e9", "#c0272d"] },

  // ---- Dunlop (us.dunlopsports.com "2027 CX Series" spec table) ----
  // Exception: Dunlop doesn't publish swingweight/stiffness, so those two are Tennis Warehouse's
  // strung measurements: https://www.tennis-warehouse.com/Dunlop_CX_200_16x19_2027_Racquet/descpage-DCX216.html
  { id: "dunlop-cx-200-2027", brand: "Dunlop", model: "CX 200 (2027)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: 316, swingweightType: "strung", stiffness: 66, beam: "21.5", length: 27, pattern: "16x19",
    colors: ["#d0202a", "#1b1b1b"],
    image: "img/dunlop-cx-200-2027.jpg" }
];
