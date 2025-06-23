# Grunge Merch

Interfaz web de una tienda de merch oficial de bandas de grunge y rock, creada con Next.js y Tailwind CSS.

## Descripción
Este proyecto es una plataforma moderna para la venta de productos oficiales de bandas icónicas del grunge y el rock alternativo. Permite a los usuarios explorar conciertos próximos, ver productos destacados y comprar merch exclusivo de sus artistas favoritos.

## Características principales
- Hero section animado y visualmente atractivo, con banners y colores personalizados por banda.
- Slider de conciertos próximos, con información dinámica y enlaces a compra de entradas.
- Visualización de logos y banners reales de bandas populares.
- Sección de productos destacados y grilla de productos.
- Header y footer personalizados, con navegación central y logo gráfico.
- Adaptabilidad y responsividad para dispositivos móviles y escritorio.
- Integración visual de ticket providers (Teleticket, Ticketmaster, Ticketek, etc.)
- Estilos modernos y animaciones inspiradas en sitios oficiales de bandas.

## Tecnologías utilizadas
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/)

## Estructura del proyecto
- `/app` - Páginas principales y rutas (home, productos, etc.)
- `/components` - Componentes reutilizables (header, footer, hero-section, popular-bands, etc.)
- `/public` - Imágenes de bandas, logos y banners
- `/styles` - Archivos CSS globales y personalizados
- `/hooks` y `/lib` - Utilidades y hooks personalizados

## Cómo ejecutar el proyecto
1. Instala las dependencias:
   ```sh
   pnpm install
   # o npm install
   ```
2. Inicia el servidor de desarrollo:
   ```sh
   pnpm dev
   # o npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Personalización
- Para agregar nuevas bandas, edita el array `upcomingConcerts` en `components/hero-section.tsx` y coloca los logos/banners en la carpeta `public`.
- Los colores, mensajes y ticket providers son configurables por concierto.

## Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
