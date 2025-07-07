import Link from "next/link";
import { Mail, Phone, MapPin, BadgeCheck, Smile, Users } from "lucide-react";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            className="text-5xl md:text-7xl font-bold font-aton uppercase"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
            >
            Sobre Nosotros
            </h1>
            <p
            className="text-xl text-brand-100 max-w-2xl mx-auto font-roboto drop-shadow-sm"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
            >
            Conoce la historia, valores y pasión detrás de Grunge.
            </p>
        </div>
      </section>

      {/* Sección sobre el negocio con imagen decorativa */}
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 flex justify-center">
          <div className="rounded-3xl shadow-2xl w-full max-w-2xl bg-black flex items-center justify-center" style={{minHeight:'180px'}}>
            <img
              src="/jiron-long.png"
              alt="Jirón de La Unión Lima"
              className="rounded-3xl object-cover w-full h-full invert"
            />
          </div>
        </div>
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-aton mb-4 text-brand-600">Grunge: Más que una tienda, una experiencia</h2>
            <p className="text-lg text-gray-700 mb-3">
            En Grunge, la música es nuestro motor y la comunidad nuestro corazón. Somos el punto de encuentro para fans del rock, el indie y la cultura alternativa en Lima y todo el Perú.
            </p>
            <p className="text-lg text-gray-700 mb-3">
            Ofrecemos solo merch oficial y productos exclusivos, seleccionados con pasión y autenticidad. Nuestra tienda física en el Jirón de la Unión es un espacio para descubrir, compartir y vivir la experiencia Grunge: atención personalizada, eventos, lanzamientos y mucho más.
            </p>
            <p className="text-lg text-gray-700">
            Únete a la familia Grunge y lleva tu fanatismo al siguiente nivel. Te esperamos con la mejor vibra y el mejor merch.
            </p>
        </div>
      </section>

      {/* Ventajas de Grunge */}
      <section className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
          <span className="text-brand-500 mb-2">
            <BadgeCheck className="w-10 h-10" />
          </span>
          <h3 className="font-bold text-lg mb-1">Merch 100% Oficial</h3>
          <p className="text-gray-600 text-sm">Solo productos originales y licenciados, directo de las bandas y sellos.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
          <span className="text-brand-500 mb-2">
            <Smile className="w-10 h-10" />
          </span>
          <h3 className="font-bold text-lg mb-1">Atención Personalizada</h3>
          <p className="text-gray-600 text-sm">Te asesoramos en cada compra y resolvemos tus dudas rápido y con buena onda.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
          <span className="text-brand-500 mb-2">
            <Users className="w-10 h-10" />
          </span>
          <h3 className="font-bold text-lg mb-1">Comunidad & Eventos</h3>
          <p className="text-gray-600 text-sm">Eventos, lanzamientos y experiencias para fans. ¡Sé parte de la familia Grunge!</p>
        </div>
      </section>

      {/* Testimonios */}
      <section className="container mx-auto px-4 py-10">
        <h3 className="text-2xl md:text-3xl font-aton text-brand-600 mb-8 text-center">Lo que dicen nuestros clientes</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-700 italic mb-3">“El mejor lugar para conseguir merch original. ¡La atención es increíble y siempre hay novedades!”</p>
            <span className="font-bold text-brand-500">— Andrea R.</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-700 italic mb-3">“Compré una polera de Arctic Monkeys y llegó rapidísimo. Todo original y de calidad.”</p>
            <span className="font-bold text-brand-500">— Luis M.</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-700 italic mb-3">“Me encanta la tienda física, siempre hay buena música y el staff es súper amable.”</p>
            <span className="font-bold text-brand-500">— Camila S.</span>
          </div>
        </div>
      </section>

      {/* Mapa de ubicación */}
      <section className="container mx-auto px-4 py-10">
        <h3 className="text-2xl md:text-3xl font-aton text-brand-600 mb-6 text-center">¿Dónde estamos?</h3>
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 max-w-4xl mx-auto">
            <iframe
            src="https://www.google.com/maps?q=Jirón+de+la+Unión,+Lima+15001&output=embed"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Grunge"
            ></iframe>
        </div>
      </section>
    </div>
  );
}
