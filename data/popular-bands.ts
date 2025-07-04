// Data y filtros para bandas populares

export interface PopularBand {
  name: string;
  logo: string;
}

export const popularBands: PopularBand[] = [
  { name: "The Beatles", logo: "/popular-bands/Beatles_170x100.avif" },
  { name: "Black Sabbath", logo: "/popular-bands/Black-Sabbath_170x100.avif" },
  { name: "Bring Me The Horizon", logo: "/popular-bands/BMTH_170x100.webp" },
  { name: "Eminem", logo: "/popular-bands/Eminem_170x100.avif" },
  { name: "Grateful Dead", logo: "/popular-bands/Grateful-Dead_170x100.avif" },
  { name: "Guns N' Roses", logo: "/popular-bands/Guns-N-Roses_170x100.webp" },
  { name: "Iron Maiden", logo: "/popular-bands/Iron-Maiden_170x100.avif" },
  { name: "Led Zeppelin", logo: "/popular-bands/Led-Zeppelin_170x100.avif" },
  { name: "Metallica", logo: "/popular-bands/Metallica_170x100.webp" },
  { name: "Misfits", logo: "/popular-bands/misfits_170x100.avif" },
  { name: "Pantera", logo: "/popular-bands/pantera_170x100.avif" },
  { name: "Pink Floyd", logo: "/popular-bands/Pink_Floyd_170x100.avif" },
  { name: "Ramones", logo: "/popular-bands/Ramones_170x100.avif" },
  { name: "The Rolling Stones", logo: "/popular-bands/Rolling-Stones_170x100.webp" },
  { name: "Slayer", logo: "/popular-bands/Slayer_170x100.avif" },
  { name: "Slipknot", logo: "/popular-bands/Slipknot_170x100.avif" },
  { name: "Tool", logo: "/popular-bands/Tool_170x100.avif" },
  { name: "Van Halen", logo: "/popular-bands/Van-Halen_170x100.avif" },
]

export const bandFilters: Record<string, string> = {
  "The Beatles": "Beatles",
  "Black Sabbath": "Black Sabbath",
  "Bring Me The Horizon": "Bring Me The Horizon",
  "Eminem": "Eminem",
  "Grateful Dead": "Grateful Dead",
  "Guns N' Roses": "Guns N Roses",
  "Iron Maiden": "Iron Maiden",
  "Led Zeppelin": "Led Zeppelin",
  "Metallica": "Metallica",
  "Misfits": "Misfits",
  "Pantera": "Pantera",
  "Pink Floyd": "Pink Floyd",
  "Ramones": "Ramones",
  "The Rolling Stones": "Rolling Stones",
  "Slayer": "Slayer",
  "Slipknot": "Slipknot",
  "Tool": "Tool",
  "Van Halen": "Van Halen",
}
