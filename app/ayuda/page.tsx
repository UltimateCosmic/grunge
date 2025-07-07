import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centro de Ayuda | Grunge",
  description: "Encuentra respuestas a tus preguntas frecuentes sobre compras, envíos, devoluciones y más en Grunge."
};

export default function AyudaPage() {
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
            className="text-5xl md:text-7xl font-bold font-aton uppercase"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Centro de Ayuda
          </h1>
          <p
            className="text-xl text-brand-100 max-w-2xl mx-auto font-roboto drop-shadow-sm"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Encuentra respuestas a tus preguntas frecuentes.
          </p>
        </div>
      </section>
      <main className="min-h-[60vh] py-12 px-4 md:px-0 max-w-2xl mx-auto">
        <div className="space-y-6 text-base text-black">
          <p>
            ¿Tienes dudas sobre tu compra, envíos, devoluciones o productos? Aquí encontrarás respuestas a las preguntas más frecuentes y recursos para ayudarte.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>¿Cómo puedo realizar una compra?</strong> Selecciona tus productos favoritos, agrégalos al carrito y sigue el proceso de pago seguro.</li>
            <li><strong>¿Cuáles son los métodos de pago aceptados?</strong> Aceptamos tarjetas de crédito, débito y pagos por Yape/Plin.</li>
            <li><strong>¿Puedo cambiar o devolver un producto?</strong> Sí, revisa nuestra sección de Envíos y Devoluciones para más detalles.</li>
            <li><strong>¿Cómo puedo rastrear mi pedido?</strong> Te enviaremos un correo con el número de seguimiento una vez que tu pedido sea despachado.</li>
            <li><strong>¿Tienen atención al cliente?</strong> Sí, escríbenos a <a href="mailto:info@grunge.com" className="underline hover:text-brand-500">info@grunge.com</a> o por WhatsApp.</li>
          </ul>
          <p>
            Si no encuentras la respuesta que buscas, contáctanos y te ayudaremos lo antes posible.
          </p>
        </div>
      </main>
    </>
  );
}
