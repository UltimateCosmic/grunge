import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturedProducts from "@/components/featured-products"
import PopularBands from "@/components/popular-bands"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <PopularBands />
      </main>
      <Footer />
    </div>
  )
}
