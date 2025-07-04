"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

// Función para generar slug desde la URL del producto
const generateSlug = (url: string): string => {
  if (!url) return 'producto-no-disponible'
  
  // Si es una URL completa, extraer la parte del path
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    // Extraer el slug del path /products/[slug]
    const match = path.match(/\/products\/([^?]+)/)
    return match ? match[1] : 'producto-no-disponible'
  } catch {
    // Si no es una URL válida, asumir que es un path relativo
    const match = url.match(/\/products\/([^?]+)/)
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
  const productSlug = generateSlug(product.url || '')
  return (
    <Link href={`/producto/${productSlug}`} className="block h-full">
      <div
        className={`group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[420px] ${className}`}
      >
        <div className="relative overflow-hidden p-4 flex items-center justify-center min-h-[220px]">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={240}
            height={240}
            className="max-w-full max-h-56 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {product.isOnSale && (
            <div className="absolute top-3 left-3 bg-brand-500 text-white px-2 py-1 rounded-full text-xs">
              OFERTA
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <p className="text-sm text-brand-600 font-medium font-roboto">{product.band}</p>
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
