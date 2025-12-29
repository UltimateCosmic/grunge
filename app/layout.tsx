import type { Metadata } from "next"
import { Bebas_Neue, Roboto_Flex } from "next/font/google"
import "./globals.css"
import RootLayoutClient from "./layout-client"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aton",
})

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto",
})

// Estos metadatos serán el fallback si las páginas no definen los suyos propios
export const metadata: Metadata = {
  title: {
    default: "Grunge | Tienda Oficial de Merch",
    template: "%s | Grunge" // Esta plantilla se usará cuando las páginas definan solo el "title"
  },
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
      <body className={`${bebasNeue.variable} ${robotoFlex.variable} font-roboto antialiased`}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
