import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-4">
      <img src="/grunge-skull.png" alt="404" className="w-32 md:w-52 mb-8 invert" />
      <h1 className="text-6xl md:text-8xl font-bold font-aton mb-4">404</h1>
      <h2 className="text-2xl md:text-4xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-xl">La página que buscas no existe o fue movida. Pero no te preocupes, puedes volver al inicio o explorar nuestro catálogo de productos y conciertos.</p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link href="/" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">Ir al inicio</Link>
        <Link href="/productos" className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition-colors">Ver productos</Link>
      </div>
    </div>
  );
}
