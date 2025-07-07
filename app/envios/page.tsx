import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | Grunge",
  description: "Información sobre políticas de envío, tiempos de entrega y devoluciones en Grunge."
};

export default function EnviosPage() {
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
            Envíos y Devoluciones
          </h1>
          <p
            className="text-xl text-brand-100 max-w-2xl mx-auto font-roboto drop-shadow-sm"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Conoce nuestras políticas de entrega y cambios.
          </p>
        </div>
      </section>
      <main className="min-h-[60vh] py-12 px-4 md:px-0 max-w-2xl mx-auto">
        <div className="space-y-6 text-base text-black">
          <h2 className="text-xl font-semibold text-black">Política de Envíos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Realizamos envíos a todo el Perú.</li>
            <li>El tiempo de entrega estimado es de 2 a 5 días hábiles en Lima y de 4 a 10 días hábiles para provincias.</li>
            <li>Recibirás un correo con el número de seguimiento una vez despachado tu pedido.</li>
          </ul>
          <h2 className="text-xl font-semibold text-black mt-6">Política de Devoluciones</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Puedes solicitar un cambio o devolución dentro de los 7 días posteriores a la recepción del producto.</li>
            <li>El producto debe estar en perfectas condiciones, sin uso y con etiquetas originales.</li>
            <li>Para iniciar el proceso, escríbenos a <a href="mailto:info@grunge.com" className="underline hover:text-brand-500">info@grunge.com</a> con tu número de pedido y motivo.</li>
          </ul>
          <p>
            Si tienes dudas adicionales, revisa nuestro <a href="/ayuda" className="underline hover:text-brand-500">Centro de Ayuda</a> o contáctanos directamente.
          </p>
        </div>
      </main>
    </>
  );
}
