"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ShoppingCart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

const bands = [
  "Arctic Monkeys",
  "The Strokes",
  "Radiohead",
  "Tame Impala",
  "Foo Fighters",
  "Red Hot Chili Peppers",
  "Pearl Jam",
  "Nirvana",
]

const productTypes = ["Camisetas", "Hoodies", "Discos", "Accesorios", "Posters", "Ediciones Limitadas"]

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

const allProducts = [
  {
    id: 1,
    name: "Arctic Monkeys - AM Camiseta",
    band: "Arctic Monkeys",
    type: "Camisetas",
    price: 29.99,
    originalPrice: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    isOnSale: true,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "The Strokes - Hoodie Oficial",
    band: "The Strokes",
    type: "Hoodies",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 89,
    isOnSale: false,
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    id: 3,
    name: "Radiohead - OK Computer Vinilo",
    band: "Radiohead",
    type: "Discos",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5.0,
    reviews: 256,
    isOnSale: false,
    sizes: [],
  },
  {
    id: 4,
    name: "Tame Impala - Currents Poster",
    band: "Tame Impala",
    type: "Posters",
    price: 19.99,
    originalPrice: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 67,
    isOnSale: true,
    sizes: [],
  },
  {
    id: 5,
    name: "Foo Fighters - Logo Camiseta",
    band: "Foo Fighters",
    type: "Camisetas",
    price: 27.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 143,
    isOnSale: false,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 6,
    name: "RHCP - Californication Hoodie",
    band: "Red Hot Chili Peppers",
    type: "Hoodies",
    price: 65.99,
    originalPrice: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 98,
    isOnSale: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 7,
    name: "Pearl Jam - Ten Vinilo Edición Limitada",
    band: "Pearl Jam",
    type: "Ediciones Limitadas",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5.0,
    reviews: 45,
    isOnSale: false,
    sizes: [],
  },
  {
    id: 8,
    name: "Nirvana - Nevermind Gorra",
    band: "Nirvana",
    type: "Accesorios",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 78,
    isOnSale: false,
    sizes: ["Única"],
  },
]

export default function ProductsGrid() {
  const [selectedBands, setSelectedBands] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = allProducts.filter((product) => {
    const bandMatch = selectedBands.length === 0 || selectedBands.includes(product.band)
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type)
    const sizeMatch =
      selectedSizes.length === 0 ||
      (product.sizes.length > 0 && selectedSizes.some((size) => product.sizes.includes(size))) ||
      product.sizes.length === 0
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]

    return bandMatch && typeMatch && sizeMatch && priceMatch
  })

  const handleBandChange = (band: string, checked: boolean) => {
    if (checked) {
      setSelectedBands([...selectedBands, band])
    } else {
      setSelectedBands(selectedBands.filter((b) => b !== band))
    }
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes([...selectedSizes, size])
    } else {
      setSelectedSizes(selectedSizes.filter((s) => s !== size))
    }
  }

  const clearAllFilters = () => {
    setSelectedBands([])
    setSelectedTypes([])
    setSelectedSizes([])
    setPriceRange([0, 100])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>

        {/* Filters Sidebar */}
        <div className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-gray-900 font-aton uppercase">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-brand-600 hover:text-brand-700"
              >
                Limpiar
              </Button>
            </div>

            {/* Bandas Filter */}
            <div className="mb-6">
              <h4 className="text-gray-900 mb-3 font-aton uppercase text-sm">Bandas</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bands.map((band) => (
                  <div key={band} className="flex items-center space-x-2">
                    <Checkbox
                      id={`band-${band}`}
                      checked={selectedBands.includes(band)}
                      onCheckedChange={(checked) => handleBandChange(band, checked as boolean)}
                      className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                    />
                    <label htmlFor={`band-${band}`} className="text-sm text-gray-700 cursor-pointer font-roboto">
                      {band}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipo de Producto Filter */}
            <div className="mb-6">
              <h4 className="text-gray-900 mb-3 font-aton uppercase text-sm">Tipo de Producto</h4>
              <div className="space-y-2">
                {productTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                      className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                    />
                    <label htmlFor={`type-${type}`} className="text-sm text-gray-700 cursor-pointer font-roboto">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tamaño Filter */}
            <div className="mb-6">
              <h4 className="text-gray-900 mb-3 font-aton uppercase text-sm">Tamaño</h4>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                      className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                    />
                    <label htmlFor={`size-${size}`} className="text-sm text-gray-700 cursor-pointer font-roboto">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Precio Filter */}
            <div className="mb-6">
              <h4 className="text-gray-900 mb-3 font-aton uppercase text-sm">Precio</h4>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 font-roboto">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl text-gray-900 font-aton uppercase">
                Productos ({filteredProducts.length})
              </h2>
              <p className="text-gray-600 font-roboto">Encuentra el merch perfecto para ti</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
                    <div className="absolute top-3 left-3 bg-brand-500 text-white px-2 py-1 rounded-full text-xs ">
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
                    <p className="text-sm text-brand-600 font-medium font-roboto">{product.band}</p>
                    <h3 className="text-lg text-gray-900 group-hover:text-brand-600 transition-colors font-roboto">
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
                    <span className="text-sm text-gray-600 ml-2 font-roboto">({product.reviews})</span>
                  </div>

                  {product.sizes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1 font-roboto">Tallas disponibles:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size) => (
                          <span key={size} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-roboto">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl text-gray-900 font-roboto">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through font-roboto">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-roboto">
                No se encontraron productos con los filtros seleccionados.
              </p>
              <Button onClick={clearAllFilters} className="mt-4 bg-brand-500 hover:bg-brand-600 text-white">
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
