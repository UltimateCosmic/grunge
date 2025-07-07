import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-gray-800 overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/grunge-logo.png" alt="Grunge Logo" className="w-20 object-contain invert" />
            </Link>
            <p className="text-gray-400 text-sm">
              Tu tienda oficial de merch de las mejores bandas de rock e indie. Productos auténticos y de calidad
              premium.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-aton uppercase text-2xl">Enlaces Rápidos</h3>
            <div className="space-y-2">
              <Link href="/productos" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Productos
              </Link>
              <Link href="/conciertos" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Próximos Conciertos
              </Link>
              <Link href="/nosotros" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Nosotros
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-white font-aton uppercase text-2xl">Atención al Cliente</h3>
            <div className="space-y-2">
              <Link href="/ayuda" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Centro de Ayuda
              </Link>
              <Link href="/envios" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Envíos y Devoluciones
              </Link>
              <Link href="/tallas" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Guía de Tallas
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-aton uppercase text-2xl">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-brand-500" />
                <span>info@grunge.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-brand-500" />
                <span>+51 987 654 321</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span>Jr. de La Unión 1234 · Lima, Perú</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Grunge. Todos los derechos reservados. <br />
            Creado por Johan Amador <a href="https://cosmodev.me" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">@cosmodev</a>
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacidad" className="text-gray-400 hover:text-white transition-colors text-sm">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-gray-400 hover:text-white transition-colors text-sm">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
      {/* Marca de agua: calavera reflejada */}
      <img
        src="/grunge-skull.png"
        alt="Grunge Skull Watermark"
        className="pointer-events-none select-none absolute top-1/2 right-[-100px] w-60 md:w-[400px] opacity-20 invert scale-x-[-1] z-0 translate-y-[-60%]"
        style={{ maxWidth: 'none', maxHeight: '120%', objectFit: 'contain' }}
      />
    </footer>
  )
}
