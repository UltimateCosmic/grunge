"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { mapProduct } from "@/lib/map-product"

// Función para convertir dólares a soles (igual que en products-grid.tsx)
const USD_TO_PEN_RATE = 3.55;

// Función para convertir dólares a soles
const convertToPEN = (usdPrice: number): number => {
  return Math.round(usdPrice * USD_TO_PEN_RATE);
};

// Función para formatear precio en soles
const formatPriceInPEN = (price: number): string => {
  return `S/ ${price.toLocaleString('es-PE')}`;
};

// Endpoint global de búsqueda Findify (el mismo que en products-grid.tsx)
const API_SEARCH = "https://api-v3.findify.io/v3/search/" +
  "?user%5Buid%5D=2BFa9WflrlWkujYL" +
  "&user%5Bsid%5D=Qe4lb3rBazBvmjwo" +
  "&user%5Bpersist%5D=true" +
  "&user%5Bexist%5D=true" +
  "&t_client=1751442362499" +
  "&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f" +
  "&slot=findify-search" +
  "&max_count=24" // Limitamos a 24 productos para hacer la selección aleatoria

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para seleccionar 4 productos aleatorios del conjunto
  const getRandomProducts = (products: any[], count: number) => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(API_SEARCH)
      .then((res) => res.json())
      .then((json) => {
        const mapped = json.items.map(mapProduct);
        setFeaturedProducts(getRandomProducts(mapped, 4));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl text-gray-900 mb-4 font-medium font-aton uppercase">
            Productos Destacados
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Una selección aleatoria de nuestros mejores productos
          </p>
        </div>

        {isLoading ? (
          // Skeleton loader mientras carga
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse p-4 flex items-center justify-center"></div>
                <div className="p-4">
                  <div className="h-4 w-1/4 bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-6 w-2/3 bg-gray-200 animate-pulse mb-3"></div>
                  <div className="h-6 w-1/3 bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

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
