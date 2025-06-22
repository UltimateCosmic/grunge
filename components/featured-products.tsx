import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

const featuredProducts = [
  {
    id: 1,
    name: "Arctic Monkeys - AM Camiseta",
    band: "Arctic Monkeys",
    price: 29.99,
    originalPrice: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    isOnSale: true,
  },
  {
    id: 2,
    name: "The Strokes - Hoodie Oficial",
    band: "The Strokes",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 89,
    isOnSale: false,
  },
  {
    id: 3,
    name: "Radiohead - OK Computer Vinilo",
    band: "Radiohead",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5.0,
    reviews: 256,
    isOnSale: false,
  },
  {
    id: 4,
    name: "Tame Impala - Currents Poster",
    band: "Tame Impala",
    price: 19.99,
    originalPrice: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 67,
    isOnSale: true,
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-aton uppercase">
            Productos Destacados
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Los productos más populares de nuestras bandas favoritas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isOnSale && (
                  <div className="absolute top-3 left-3 bg-brand-500 text-white px-2 py-1 rounded-full text-xs">
                    OFERTA
                  </div>
                )}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-brand-600 font-medium">{product.band}</p>
                  <h3 className="text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl text-gray-900">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/productos">
            <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
