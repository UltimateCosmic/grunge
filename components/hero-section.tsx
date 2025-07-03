"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"

const upcomingConcerts = [
  {
    id: 1,
    band: "Guns N' Roses",
    logo: "/upcoming-concerts/guns-n-roses/logo.png",
    date: "5 de Noviembre",
    venue: "Estadio Nacional",
    city: "Lima",
    image: "/upcoming-concerts/guns-n-roses/banner.png",
    merchPreview: "/placeholder.svg?height=400&width=600",
    color: "#ff0000",
    ticketProvider: "Teleticket",
    ticketUrl: "https://teleticket.com.pe/guns-n-roses-lima-2025",
    message: "¡No te pierdas el regreso de Guns N' Roses a Lima! Consigue el merch oficial antes de que se agote.",
    shirts: [
      "/shirts/guns-n-roses/shirt1.png",
      "/shirts/guns-n-roses/shirt2.png",
      "/shirts/guns-n-roses/shirt3.png"
    ]
  },
  {
    id: 2,
    band: "My Chemical Romance",
    logo: "/upcoming-concerts/my-chemical-romance/logo.png",
    date: "25 de Enero",
    venue: "Estadio Nacional",
    city: "Lima",
    image: "/upcoming-concerts/my-chemical-romance/banner.png",
    merchPreview: "/placeholder.svg?height=400&width=600",
    color: "#a90000",
    ticketProvider: "Ticketmaster",
    ticketUrl: "https://www.ticketmaster.pe/event/my-chemical-romance",
    message: "My Chemical Romance regresa a Lima con su gira mundial. ¡Consigue tu merch exclusivo para el show!",
    shirts: [
      "/shirts/my-chemical-romance/shirt1.png",
      "/shirts/my-chemical-romance/shirt2.png",
      "/shirts/my-chemical-romance/shirt3.png"
    ]
  },
  {
    id: 3,
    band: "Green Day",
    logo: "/upcoming-concerts/green-day/logo.png",
    date: "27 de Agosto",
    venue: "Estadio San Marcos",
    city: "Lima",
    image: "/upcoming-concerts/green-day/banner.png",
    merchPreview: "/placeholder.svg?height=400&width=600",
    color: "#ec0981",
    ticketProvider: "Ticketmaster",
    ticketUrl: "https://www.ticketmaster.pe/event/green-day-estadio-san-marcos-2025",
    message: "Green Day llega a Lima con su tour épico. ¡No te quedes sin tu merch oficial!",
    shirts: [
      "/shirts/green-day/shirt1.png",
      "/shirts/green-day/shirt2.png",
      "/shirts/green-day/shirt3.png"
    ]
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentShirt, setCurrentShirt] = useState(0)
  const router = useRouter()

  // Función para navegar a productos con filtro de banda
  const navigateToProducts = (bandName: string) => {
    const encodedBand = encodeURIComponent(bandName)
    router.push(`/productos?band=${encodedBand}`)
  }

  // Efecto removido - sin paginación automática

  // Reiniciar contador de camisetas cuando cambie el slide
  useEffect(() => {
    setCurrentShirt(0)
  }, [currentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % upcomingConcerts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + upcomingConcerts.length) % upcomingConcerts.length)
  }

  const currentConcert = upcomingConcerts[currentSlide]

  return (
    <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentConcert.image || "/placeholder.svg"}
            alt={`${currentConcert.band} concert`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-8 items-center w-full">
            {/* Left side - Concert Info */}
            <div className="text-white space-y-6">
              <div className="space-y-2">
                <div className="mb-4">
                  <Image
                    src={currentConcert.logo || "/placeholder.svg"}
                    alt={`${currentConcert.band} logo`}
                    width={300}
                    height={120}
                    className="h-20 md:h-24 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-lg text-white">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" style={{ color: currentConcert.color }} />
                    <span>{currentConcert.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" style={{ color: currentConcert.color }} />
                    <span>
                      {currentConcert.venue}, {currentConcert.city}
                    </span>
                  </div>
                  {currentConcert.ticketProvider && (
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-5 w-5" style={{ color: currentConcert.color }} />
                      <Image
                        src={`/ticket-provider/${currentConcert.ticketProvider.toLowerCase()}.png`}
                        alt={currentConcert.ticketProvider}
                        width={80}
                        height={17}
                        className="inline-block align-middle h-8 w-auto object-contain"
                        style={{ maxHeight: '2rem', height: '1rem', width: 'auto' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xl text-gray-200">
                {currentConcert.message}
              </p>

              <div className="flex space-x-4">
                <Button
                  size="lg"
                  style={{ backgroundColor: currentConcert.color }}
                  className="text-white px-8 border-0 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                  onClick={() => navigateToProducts(currentConcert.band)}
                >
                  Ver Merch Oficial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent flex items-center space-x-2 group"
                  asChild
                >
                  <a href={currentConcert.ticketUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={`/ticket-provider/${currentConcert.ticketProvider.toLowerCase()}.png`}
                      alt={currentConcert.ticketProvider}
                      width={80}
                      height={17}
                      className="inline-block align-middle h-8 w-auto object-contain transition-all duration-200 group-hover:filter-none group-hover:invert-0 filter brightness-0 invert"
                      style={{ maxHeight: '2rem', height: '1rem', width: 'auto' }}
                    />
                  </a>
                </Button>
              </div>
            </div>

            {/* Right side - Shirts Preview */}
            {currentConcert.shirts && currentConcert.shirts.length > 0 && (
              <div className="hidden md:block">
                <div className="relative h-96 flex items-center justify-center">
                  
                  {/* Contenedor de camisetas - Solo 3 camisetas */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Limitamos a solo 3 camisetas */}
                    {currentConcert.shirts.slice(0, 3).map((shirt, index) => {
                      const positions = [
                        { x: -120, y: 25, scale: 1.0, rotation: -12, zIndex: 2 }, // Izquierda
                        { x: 0, y: -20, scale: 1.2, rotation: 0, zIndex: 3 },     // Centro
                        { x: 120, y: 25, scale: 1.0, rotation: 12, zIndex: 2 }    // Derecha
                      ]
                      
                      const currentPos = positions[index]
                      const isActive = index === currentShirt
                      
                      return (
                        <div
                          key={index}
                          className="absolute transition-all duration-500 ease-out cursor-pointer group"
                          style={{
                            transform: `translateX(${currentPos.x}px) translateY(${currentPos.y}px) scale(${currentPos.scale}) rotateZ(${currentPos.rotation}deg)`,
                            zIndex: isActive ? 10 : currentPos.zIndex,
                            filter: `drop-shadow(25px 25px 20px rgba(0, 0, 0, 0.5))`,
                            // opacity: isActive ? 1 : 0.8
                          }}
                          onClick={() => {
                            setCurrentShirt(index)
                            navigateToProducts(currentConcert.band)
                          }}
                          onMouseEnter={() => setCurrentShirt(index)}
                        >
                          <Image
                            src={shirt}
                            alt={`${currentConcert.band} shirt ${index + 1}`}
                            width={350}
                            height={420}
                            className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-3"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {upcomingConcerts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-brand-500" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </section>
  )
}
