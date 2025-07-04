import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Roboto_Flex } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-context"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-aton",
})

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Grunge | Tienda Oficial de Merch",
  description: "Tu tienda oficial de merch de las mejores bandas de rock e indie",
  icons: {
    icon: "/grunge-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${orbitron.variable} ${robotoFlex.variable} font-roboto antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
