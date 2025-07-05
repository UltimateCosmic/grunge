import HeroSection from "@/components/hero-section"
import FeaturedProducts from "@/components/featured-products"
import PopularBands from "@/components/popular-bands"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Grunge | Tienda Oficial de Merch de Rock",
  description: "Tu tienda oficial de merchandise de las mejores bandas de rock e indie. Encuentra camisetas, vinilos, posters y más.",
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <PopularBands />
    </>
  )
}
