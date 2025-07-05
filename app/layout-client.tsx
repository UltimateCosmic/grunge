"use client"

import React from "react"
import { CartProvider } from "@/components/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
