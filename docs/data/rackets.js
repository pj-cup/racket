// Racket spec data — current models (checked Nov 2026). Loaded as a plain script so the site also works from file://.
//
// Units: headSize sq in · weight g (unstrung) · balance cm (unstrung) · stiffness RA · beam mm · length in.
// swingweight kg·cm², with swingweightType "unstrung" | "strung" (brands publish different ones — not directly comparable).
// null = the brand doesn't publish it (shown as "—"); never guessed.
//
// source: official product page the specs come from (photos link there too).
// image:  official product photo (brand CDN), or "img/<file>" relative to docs/. Without it (or if it fails) an SVG is drawn.
// colors: [frame, grip] for the drawn SVG only.
window.RACKETS = [
  // ---- Babolat (babolat.com spec sheets) ----
  { id: "babolat-pure-aero-gen9", brand: "Babolat", model: "Pure Aero Gen9",
    headSize: 100, weight: 300, balance: 32.1, swingweight: 290, swingweightType: "unstrung", stiffness: 69, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#f2c400", "#1b1b1b"],
    source: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html",
    image: "https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_600,h_600/v1739969375/Product_Media/2026/Tennis/RACQUETS/Expert/101569-PURE_AERO_GEN9-100-1-Face.png" },
  { id: "babolat-pure-drive-gen11", brand: "Babolat", model: "Pure Drive Gen11",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 290, swingweightType: "unstrung", stiffness: 72, beam: "23/26/23", length: 27, pattern: "16x19",
    colors: ["#1f5fbf", "#111827"],
    source: "https://www.babolat.com/us/pure-drive-gen11-unstrung/100-101552.html",
    image: "https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_600,h_600/v1707748921/Product_Media/2025/Tennis/Racquets/Expert/101552-PD_GEN11_STRUNG-100-1-Face.png" },
  { id: "babolat-pure-strike-100-gen4", brand: "Babolat", model: "Pure Strike 100 Gen4",
    headSize: 100, weight: 300, balance: 32.0, swingweight: 295, swingweightType: "unstrung", stiffness: 68, beam: "21/23/21", length: 27, pattern: "16x19",
    colors: ["#9aa0a8", "#d8382e"],
    source: "https://www.babolat.com/us/pure-strike-100-gen4-unstrung/101579.html",
    image: "https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_600,h_600/v1730726196/Product_Media/2025/Tennis/Racquets/Expert/101579-PS_100_CARBON_GREY-3018-1-Face.png" },

  // ---- Wilson (wilson.com listings; site blocks automated access, so no photos yet) ----
  { id: "wilson-pro-staff-97-v14", brand: "Wilson", model: "Pro Staff 97 V14",
    headSize: 97, weight: 315, balance: 31.0, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "16x19",
    colors: ["#2a2420", "#1a1a1a"],
    source: "https://nz.wilson.com/products/pro-staff-97-v14-tennis-racket" },
  { id: "wilson-blade-98-16x19-v10", brand: "Wilson", model: "Blade 98 16x19 V10",
    headSize: 98, weight: 305, balance: 32.0, swingweight: 330, swingweightType: "strung", stiffness: 60, beam: "21.5→20.5", length: 27, pattern: "16x19",
    colors: ["#3f6b3a", "#1a1a1a"],
    source: "https://www.wilson.com/en-us/products/blade-98-16x19-v10-tennis-racket-wr20780" },
  { id: "wilson-clash-100-v3", brand: "Wilson", model: "Clash 100 V3",
    // swingweight/stiffness from Wilson's US Open 2026 edition listing (same frame, different paint)
    headSize: 100, weight: 292.5, balance: null, swingweight: 304, swingweightType: "strung", stiffness: 51, beam: null, length: 27, pattern: "16x19",
    colors: ["#c62828", "#1a1a1a"],
    source: "https://www.wilson.com/en-us/products/clash-100-v3-tennis-racket-wr17280" },
  { id: "wilson-ultra-100-v5", brand: "Wilson", model: "Ultra 100 V5",
    headSize: 100, weight: 300, balance: null, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "16x19",
    colors: ["#1e63b5", "#0f1f3a"],
    source: "https://www.wilson.com/en-us/products/ultra-100-v5-tennis-racket-wr17880" },

  // ---- Head (head.com listings; site blocks automated access, so no photos yet) ----
  { id: "head-speed-mp-2026", brand: "Head", model: "Speed MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "23", length: 27, pattern: "16x19",
    colors: ["#f0f0f0", "#1a1a1a"],
    source: "https://www.head.com/en_US/product/speed-mp-2026-232026" },
  { id: "head-extreme-mp-2026", brand: "Head", model: "Extreme MP 2026",
    headSize: 100, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "23/26/21", length: 27, pattern: "16x19",
    colors: ["#b8d62a", "#1a1a1a"],
    source: "https://www.head.com/en_US/product/extreme-mp-2026-233316" },
  { id: "head-radical-mp-2025", brand: "Head", model: "Radical MP 2025",
    headSize: 98, weight: 300, balance: 32.0, swingweight: null, swingweightType: null, stiffness: null, beam: "20/23/21", length: 27, pattern: "16x19",
    colors: ["#f07a1a", "#1d3b78"],
    source: "https://www.head.com/en_US/product/radical-mp-2025-231015" },
  { id: "head-gravity-mp-2025", brand: "Head", model: "Gravity MP 2025",
    headSize: 100, weight: 295, balance: 32.5, swingweight: null, swingweightType: null, stiffness: null, beam: "22", length: 27, pattern: "16x20",
    colors: ["#d23c3c", "#1c5d8c"],
    source: "https://www.head.com/en_US/product/gravity-mp-2025-231125" },
  { id: "head-prestige-mp-2023", brand: "Head", model: "Prestige MP 2023",
    headSize: 99, weight: 310, balance: null, swingweight: null, swingweightType: null, stiffness: null, beam: null, length: 27, pattern: "18x19",
    colors: ["#8e1b1b", "#1a1a1a"],
    source: "https://www.head.com/product/prestige-mp-2023-236123" },

  // ---- Yonex (yonex.com spec sheets) ----
  { id: "yonex-ezone-98-8th", brand: "Yonex", model: "EZONE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: null, swingweightType: null, stiffness: null, beam: "23.8/24.5/19.5", length: 27, pattern: "16x19",
    colors: ["#1d4fb8", "#0c1f4a"],
    source: "https://www.yonex.com/tennis/racquets/ez98",
    image: "https://www.yonex.com/media/catalog/product/a/l/all_08ez98_839-1.jpg" },
  { id: "yonex-vcore-98-8th", brand: "Yonex", model: "VCORE 98 (8th gen)",
    headSize: 98, weight: 305, balance: 31.5, swingweight: null, swingweightType: null, stiffness: null, beam: "23/23.5/22", length: 27, pattern: "16x19",
    colors: ["#b3122e", "#1a1a1a"],
    source: "https://www.yonex.com/tennis/racquets/08vc98",
    image: "https://www.yonex.com/media/catalog/product/a/l/all_08vc98_338-1.jpg" },
  { id: "yonex-percept-97", brand: "Yonex", model: "Percept 97",
    headSize: 97, weight: 310, balance: 31.0, swingweight: null, swingweightType: null, stiffness: null, beam: "21/21/21", length: 27, pattern: "16x19",
    colors: ["#5b6b3a", "#1a1a1a"],
    source: "https://www.yonex.com/tennis/racquets/percept-97",
    image: "https://www.yonex.com/media/catalog/product/a/l/all_01pe97_472-1_1.png?quality=80&fit=bounds&height=819&width=600" },

  // ---- Tecnifibre (b2b.tecnifibre.com spec sheet; only close-up photos available) ----
  { id: "tecnifibre-tf40-305-16m-v3", brand: "Tecnifibre", model: "TF-40 305 16M V3",
    headSize: 98, weight: 305, balance: 32.5, swingweight: null, swingweightType: null, stiffness: null, beam: "21.7", length: 27, pattern: "16x19",
    colors: ["#e9e9e9", "#c0272d"],
    source: "https://www.tecnifibre.com/en/products/tf-40-305-16m-v3" }
];
