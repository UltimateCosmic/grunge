"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"

const popularBands = [
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

export default function PopularBands() {
  const router = useRouter()
  // Mapeo de nombre de banda a slug para query
  const bandSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-aton uppercase">Bandas Populares</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre el merch oficial de las bandas más icónicas del rock e indie
          </p>
        </div>

        {/* Scrolling logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-12 items-center">
            {/* First set */}
            {popularBands.map((band, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 max-h-24 flex items-center p-[10px] cursor-pointer"
                onClick={() => router.push(`/productos?banda=${bandSlug(band.name)}`)}
                title={`Ver productos de ${band.name}`}
              >
                <Image
                  src={band.logo}
                  alt={band.name}
                  width={170}
                  height={78}
                  className="object-contain max-h-24"
                  quality={100}
                  unoptimized={band.name === "Guns N' Roses"}
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {popularBands.map((band, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 max-h-24 flex items-center p-[10px] cursor-pointer"
                onClick={() => router.push(`/productos?banda=${bandSlug(band.name)}`)}
                title={`Ver productos de ${band.name}`}
              >
                <Image
                  src={band.logo}
                  alt={band.name}
                  width={170}
                  height={78}
                  className="object-contain max-h-32"
                  quality={100}
                  unoptimized={band.name === "Guns N' Roses"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <button className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-lg transition-colors">
            Ver Todas las Bandas
          </button>
        </div>
      </div>
    </section>
  )
}
