"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { popularBands, bandFilters } from "@/data/popular-bands"

export default function PopularBands() {
  const router = useRouter()
  // Mapeo de nombre de banda a slug para query
  const bandSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl text-gray-900 mb-4 font-aton font-medium uppercase">Bandas Populares</h2>
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
                onClick={() => {
                  const filter = bandFilters[band.name] || band.name
                  router.push(`/productos?band=${encodeURIComponent(filter)}`)
                }}
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
                onClick={() => {
                  const filter = bandFilters[band.name] || band.name
                  router.push(`/productos?band=${encodeURIComponent(filter)}`)
                }}
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
