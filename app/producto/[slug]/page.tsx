import { Metadata } from "next";
import ProductPageClient from "./page-client";

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/product-enhanced/${slug}`);
    if (!response.ok) {
      return {
        title: "Producto no encontrado | Grunge",
        description: "El producto que estás buscando no existe o ha sido eliminado",
      };
    }
    const data = await response.json();
    const product = data.product;
    if (!product) {
      return {
        title: "Producto no encontrado | Grunge",
        description: "El producto que estás buscando no existe o ha sido eliminado",
      };
    }
    return {
      title: `${product.title} | ${product.brand} | Grunge`,
      description: product.description || `Compra ${product.title} de ${product.brand} en la tienda oficial de merch.`,
      openGraph: {
        title: `${product.title} | ${product.brand}`,
        description: product.description || `Compra ${product.title} de ${product.brand} en la tienda oficial de merch.`,
        images: [{ url: product.images?.[0] || '/placeholder.jpg' }],
      },
    };
  } catch (error) {
    return {
      title: "Grunge | Tienda Oficial de Merch",
      description: "Tu tienda oficial de merch de las mejores bandas de rock e indie",
    };
  }
}

export default function ProductPage() {
  return <ProductPageClient />;
}
