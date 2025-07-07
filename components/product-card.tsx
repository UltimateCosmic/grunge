"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useImage } from "@/hooks/use-image"

// Función para generar slug desde la URL del producto
const generateSlug = (url: string): string => {
  console.log('URL recibida en generateSlug:', url)
  
  if (!url) {
    console.log('URL vacía, retornando producto-no-disponible')
    return 'producto-no-disponible'
  }
  
  // Si es una URL completa, extraer la parte del path
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    console.log('Path extraído de URL completa:', path)
    // Extraer el slug del path /products/[slug]
    const match = path.match(/\/products\/([^?]+)/)
    console.log('Match encontrado:', match)
    return match ? match[1] : 'producto-no-disponible'
  } catch {
    console.log('URL no es completa, tratando como path relativo:', url)
    // Si no es una URL válida, asumir que es un path relativo
    const match = url.match(/\/products\/([^?]+)/)
    console.log('Match en path relativo:', match)
    return match ? match[1] : 'producto-no-disponible'
  }
}

// Función para formatear precio en soles
const formatPriceInPEN = (price: number): string => {
  return `S/. ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    band: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    isOnSale?: boolean;
    sizes?: string[];
    url?: string;
  };
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const imageHook = useImage({ 
    src: product.image || "/placeholder.svg",
    fallback: "/placeholder.svg"
  })
  
  console.log('ProductCard recibió producto:', product)
  console.log('URL del producto:', product.url)
  console.log('URL de imagen:', product.image)
  
  const productSlug = generateSlug(product.url || '')
  console.log('Slug generado:', productSlug)
  
  return (
    <Link href={`/producto/${productSlug}`} className="block h-full">
      <div
        className={`group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[420px] ${className}`}
      >
        <div className="relative overflow-hidden p-4 flex items-center justify-center min-h-[220px] bg-gray-50">
          {!imageHook.error ? (
            <>
              {imageHook.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  {imageHook.usingProxy && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                      Proxy
                    </div>
                  )}
                </div>
              )}
              <Image
                src={imageHook.src}
                alt={product.name}
                width={240}
                height={240}
                className="max-w-full max-h-56 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={imageHook.onError}
                onLoad={imageHook.onLoad}
                unoptimized={imageHook.usingProxy} // Solo desoptimizar si usa proxy
              />
            </>
          ) : (
            <div className="flex items-center justify-center w-60 h-56 bg-gray-200 rounded-lg">
              <div className="text-center p-4">
                <div className="text-gray-400 text-sm mb-2">Imagen no disponible</div>
                <div className="text-xs text-gray-300 line-clamp-2">{product.name}</div>
              </div>
            </div>
          )}
          {product.isOnSale && (
            <div className="absolute top-3 left-3 bg-brand-500 text-white px-2 py-1 rounded-full text-xs z-20">
              OFERTA
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <Link
              href={`/productos?banda=${encodeURIComponent(product.band)}`}
              className="text-sm text-brand-600 font-medium font-roboto hover:underline hover:text-brand-700 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {product.band}
            </Link>
            <h3 className="text-lg text-gray-900 transition-colors font-roboto">
              {product.name}
            </h3>
          </div>
          {Array.isArray(product.sizes) && product.sizes.length > 0 &&
            !(product.sizes.length === 1 && product.sizes[0] === "Default Title") && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1 font-roboto">Tallas disponibles:</p>
              <div className="flex flex-wrap gap-1">
                {product.sizes.filter((size: any) => typeof size === "string").map((size: string) => (
                  <span key={size} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-roboto">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-semibold font-roboto ${product.isOnSale ? "text-primary" : "text-gray-900"}`}>
                {formatPriceInPEN(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through font-roboto">
                  {formatPriceInPEN(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
