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
    spotifyId: "3qm84nBOXUEQ2vnTfUTTFC", // ID de Guns N' Roses en Spotify
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
    spotifyId: "7FBcuc1gsnv6Y1nwFtNRCb", // ID de My Chemical Romance en Spotify
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
    ticketUrl: "https://www.ticketmaster.pe/event-green-day-estadio-san-marcos-2025",
    message: "Green Day llega a Lima con su tour épico. ¡No te quedes sin tu merch oficial!",
    spotifyId: "7oPftvlwr6VrsViSDV7fJY", // ID de Green Day en Spotify
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
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()

  // Función para navegar a productos con filtro de banda
  const navigateToProducts = (bandName: string) => {
    // Reemplazar caracteres especiales por nada y espacios por +
    const normalized = bandName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '+')
    router.push(`/productos?band=${normalized}`)
  }

  // Efecto para el parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        {/* Background Image con Parallax optimizado SOLO para la imagen */}
        <div className="absolute inset-0">
          <div
            className="absolute w-full h-full"
            style={{
              top: '-15%',
              bottom: '-15%',
              height: '130%',
              transform: `translateY(${Math.max(-120, Math.min(120, scrollY * 0.8))}px)`,
              transition: 'transform 0.03s ease-out'
            }}
          >
            <Image
              src={currentConcert.image || "/placeholder.svg"}
              alt={`${currentConcert.band} concert`}
              fill
              className="object-cover scale-115" // Scale mayor para mayor cobertura
            />
          </div>
          {/* Overlay SIN parallax */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content SIN parallax */}
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

              {/* Mini Spotify Player */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.301 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-white font-medium">Escucha en Spotify</span>
                </div>
                <iframe
                  src={`https://open.spotify.com/embed/artist/${currentConcert.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded"
                ></iframe>
              </div>

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

        {/* Navigation Arrows SIN parallax */}
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

        {/* Dots Indicator SIN parallax */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {upcomingConcerts.map((concert, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "" : "bg-white/50"}`}
              style={{
              backgroundColor: index === currentSlide ? concert.color : undefined,
              border: index === currentSlide ? `2px solid ${concert.color}` : undefined,
              }}
            />
            ))}
        </div>
      </section>
  )
}
