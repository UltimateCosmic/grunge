import Link from "next/link"
import { ShoppingCart, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-0"> {/* Quitamos padding izquierdo */}
        <div className="flex items-center h-16">
          {/* Logo a la izquierda, ancho fijo */}
          <div className="flex-shrink-0 w-40 flex items-center justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/grunge-logo.png"
                alt="RockMerch Logo"
                className="w-20 h-20 invert object-contain"
              />
            </Link>
          </div>

          {/* Navigation centrado */}
          <nav className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-gray-300 hover:text-white transition-colors">
                Productos
              </Link>
              <Link href="/ofertas" className="text-gray-300 hover:text-white transition-colors">
                Ofertas
              </Link>
              <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                Contacto
              </Link>
            </div>
          </nav>

          {/* Right side a la derecha, mismo ancho que logo */}
          <div className="flex items-center space-x-4 justify-end flex-shrink-0 w-40">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
