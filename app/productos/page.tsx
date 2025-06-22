import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductsGrid from "@/components/products-grid"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Page Header */}
        <section className="bg-gradient-to-r from-brand-500 to-brand-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl mb-4 font-aton uppercase">Nuestros Productos</h1>
            <p className="text-xl text-brand-100 max-w-2xl mx-auto font-roboto">
              Descubre el merch oficial de las mejores bandas de rock e indie
            </p>
          </div>
        </section>

        <ProductsGrid />
      </main>
      <Footer />
    </div>
  )
}
