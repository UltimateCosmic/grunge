import { Suspense } from "react"
import ProductsGrid from "@/components/products-grid"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productos | Tienda Oficial de Merch",
  description: "Explora nuestra colección de merchandise oficial de las mejores bandas de rock, metal e indie",
}

export default function ProductsPage() {
  return (
    <>
      {/* Page Header con patrón grunge repetido */}
      <section className="relative bg-gradient-to-r from-brand-500 to-brand-600 text-white py-16 overflow-hidden">
        {/* Patrón SVG repetido con opacidad */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/rock-pattern.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '360px 360px',
            zIndex: 1,
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-6xl font-aton uppercase"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Nuestros Productos
          </h1>
          <p
            className="text-xl text-brand-100 max-w-2xl mx-auto font-roboto drop-shadow-sm"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Descubre el merch oficial de las mejores bandas de rock e indie
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando productos...</div>}>
        <ProductsGrid />
      </Suspense>
    </>
  )
}
