import Image from "next/image"
import Link from "next/link"

const bands = [
  {
    id: 1,
    name: "Arctic Monkeys",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 24,
    description: "Indie rock británico",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: 2,
    name: "The Strokes",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 18,
    description: "Rock alternativo de NYC",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: 3,
    name: "Radiohead",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 32,
    description: "Rock experimental",
    color: "from-green-500 to-green-700",
  },
  {
    id: 4,
    name: "Tame Impala",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 15,
    description: "Psychedelic pop",
    color: "from-pink-500 to-pink-700",
  },
  {
    id: 5,
    name: "Foo Fighters",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 28,
    description: "Rock alternativo",
    color: "from-orange-500 to-orange-700",
  },
  {
    id: 6,
    name: "Red Hot Chili Peppers",
    logo: "/placeholder.svg?height=120&width=180",
    productCount: 21,
    description: "Funk rock",
    color: "from-red-500 to-red-700",
  },
]

export default function BandsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explora por Banda</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Encuentra el merch oficial de tus bandas favoritas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bands.map((band) => (
            <Link key={band.id} href={`/productos/banda/${band.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${band.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative p-6 text-center">
                  <div className="mb-4">
                    <div className="w-32 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <Image
                        src={band.logo || "/placeholder.svg"}
                        alt={`${band.name} logo`}
                        width={180}
                        height={120}
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {band.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3">{band.description}</p>

                  <div className="flex items-center justify-center space-x-2">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {band.productCount} productos
                    </span>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500 rounded-xl transition-colors duration-300" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">¿No encuentras tu banda favorita?</p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Solicitar Banda
          </button>
        </div>
      </div>
    </section>
  )
}
