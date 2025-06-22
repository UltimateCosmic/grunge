import Image from "next/image"
import Link from "next/link"
import { Shirt, Package, Disc, Headphones, Star, Gift } from "lucide-react"

const productTypes = [
  {
    id: 1,
    name: "Camisetas",
    icon: Shirt,
    productCount: 156,
    image: "/placeholder.svg?height=200&width=300",
    description: "Camisetas oficiales de todas las bandas",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Hoodies",
    icon: Package,
    productCount: 89,
    image: "/placeholder.svg?height=200&width=300",
    description: "Sudaderas con capucha de calidad premium",
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Discos",
    icon: Disc,
    productCount: 234,
    image: "/placeholder.svg?height=200&width=300",
    description: "Vinilos, CDs y ediciones especiales",
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "Accesorios",
    icon: Headphones,
    productCount: 67,
    image: "/placeholder.svg?height=200&width=300",
    description: "Gorras, pins, pulseras y más",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Posters",
    icon: Star,
    productCount: 123,
    image: "/placeholder.svg?height=200&width=300",
    description: "Posters oficiales y arte exclusivo",
    color: "bg-pink-500",
  },
  {
    id: 6,
    name: "Ediciones Limitadas",
    icon: Gift,
    productCount: 34,
    image: "/placeholder.svg?height=200&width=300",
    description: "Productos exclusivos y coleccionables",
    color: "bg-red-500",
  },
]

export default function ProductTypesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tipos de Producto</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que buscas en nuestra amplia selección
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Link key={type.id} href={`/productos/tipo/${type.name.toLowerCase()}`}>
                <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={type.image || "/placeholder.svg"}
                      alt={type.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                    {/* Icon Overlay */}
                    <div className={`absolute top-4 right-4 ${type.color} p-3 rounded-full text-white shadow-lg`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {type.name}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {type.productCount}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>

                    {/* Call to Action */}
                    <div className="mt-4 flex items-center text-red-600 font-medium text-sm group-hover:text-red-700 transition-colors">
                      <span>Ver productos</span>
                      <svg
                        className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Productos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-gray-600">Bandas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">10k+</div>
              <div className="text-gray-600">Clientes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">4.9</div>
              <div className="text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
