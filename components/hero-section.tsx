"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { upcomingConcerts } from "@/data/upcoming-concerts"
import OptimizedLogo from "@/components/ui/optimized-logo"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentShirt, setCurrentShirt] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionTarget, setTransitionTarget] = useState<{ slide: number, shirt: number } | null>(null)
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null)
  const router = useRouter()
  const autoSlideTimeout = useRef<NodeJS.Timeout | null>(null)
  // Estado para seleccionar una camiseta aleatoria para móvil
  const [randomShirtIndex, setRandomShirtIndex] = useState(0)

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
    // Seleccionar una camiseta aleatoria para la vista móvil
    const concert = upcomingConcerts[currentSlide]
    if (concert?.shirts?.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(3, concert.shirts.length))
      setRandomShirtIndex(randomIndex)
    } else {
      setRandomShirtIndex(0)
    }
  }, [currentSlide])

  // Cambio automático de slide cada 5 segundos
  useEffect(() => {
    if (isTransitioning) return
    if (autoSlideTimeout.current) clearTimeout(autoSlideTimeout.current)
    autoSlideTimeout.current = setTimeout(() => {
      triggerSlide('next')
    }, 3000)
    return () => {
      if (autoSlideTimeout.current) clearTimeout(autoSlideTimeout.current)
    }
  }, [currentSlide, isTransitioning])

  // Función para manejar la transición
  const triggerSlide = (dir: 'next' | 'prev', index?: number) => {
    if (isTransitioning) return
    if (autoSlideTimeout.current) clearTimeout(autoSlideTimeout.current)
    const nextSlideIndex = typeof index === 'number'
      ? index
      : dir === 'next'
        ? (currentSlide + 1) % upcomingConcerts.length
        : (currentSlide - 1 + upcomingConcerts.length) % upcomingConcerts.length
    setTransitionTarget({ slide: nextSlideIndex, shirt: 0 })
    setDirection(dir)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(nextSlideIndex)
      setCurrentShirt(0)
      setIsTransitioning(false)
      setDirection(null)
      setTransitionTarget(null)
    }, 500)
  }

  const nextSlide = () => triggerSlide('next')
  const prevSlideFn = () => triggerSlide('prev')

  const currentConcert = upcomingConcerts[currentSlide]
  const prevConcert = transitionTarget ? upcomingConcerts[currentSlide] : null
  const nextConcert = transitionTarget ? upcomingConcerts[transitionTarget.slide] : null

  // Renderiza el contenido del slide (info, logo, botones, camisetas)
  function SlideContent({ concert, shirtIndex }: { concert: typeof upcomingConcerts[number], shirtIndex: number }) {
    return (
      <div className="grid md:grid-cols-2 gap-8 items-center w-full pointer-events-auto">
        {/* Left side - Concert Info */}
        <div className="text-white space-y-6">
          <div className="space-y-2">
            <div className="mb-4">
              <OptimizedLogo
                src={concert.logo || "/placeholder.svg"}
                alt={`${concert.band} logo`}
                width={400}
                height={160}
                className="h-20 md:h-24 w-auto object-contain transition-transform duration-100 ease-out"
                style={{
                  transform: `translateX(${scrollY * -0.3}px)`,
                }}
                priority={true}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-lg text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" style={{ color: concert.color }} />
                <span>{concert.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" style={{ color: concert.color }} />
                <span>
                  {concert.venue}, {concert.city}
                </span>
              </div>
              {concert.ticketProvider && (
                <div className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5" style={{ color: concert.color }} />
                  <Image
                    src={`/ticket-provider/${concert.ticketProvider.toLowerCase()}.png`}
                    alt={concert.ticketProvider}
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
            {concert.message}
          </p>

          <div className="flex space-x-4">
            <Button
              size="lg"
              style={{ backgroundColor: concert.color }}
              className="text-white px-8 border-0 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              onClick={() => navigateToProducts(concert.band)}
            >
              Ver Merch Oficial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black bg-transparent flex items-center space-x-2 group"
              asChild
            >
              <a href={concert.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src={`/ticket-provider/${concert.ticketProvider.toLowerCase()}.png`}
                  alt={concert.ticketProvider}
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
        {concert.shirts && concert.shirts.length > 0 && (
          <>
            {/* Desktop shirts */}
            <div className="hidden md:block">
              <div className="relative h-96 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {concert.shirts.slice(0, 3).map((shirt, index) => {
                    const positions = [
                      { x: -120, y: 25, scale: 1.0, rotation: -12, zIndex: 2 },
                      { x: 0, y: -20, scale: 1.2, rotation: 0, zIndex: 3 },
                      { x: 120, y: 25, scale: 1.0, rotation: 12, zIndex: 2 },
                    ]
                    const currentPos = positions[index]
                    const isActive = index === shirtIndex

                    // Parallax para polos: primer polo baja, tercer polo sube
                    const parallaxY = index === 0
                      ? scrollY * 0.2  // Primer polo desciende (sin límites)
                      : index === 2
                        ? scrollY * -0.15 // Tercer polo asciende (sin límites)
                        : 0 // Polo central sin parallax vertical

                    return (
                      <div
                        key={index}
                        className="absolute transition-all duration-500 ease-out cursor-pointer group"
                        style={{
                          transform: `translateX(${currentPos.x}px) translateY(${currentPos.y + parallaxY}px) scale(${currentPos.scale}) rotateZ(${currentPos.rotation}deg)`,
                          zIndex: isActive ? 10 : currentPos.zIndex,
                          filter: `drop-shadow(25px 25px 20px rgba(0, 0, 0, 0.5))`,
                        }}
                        onClick={() => {
                          setCurrentShirt(index)
                          navigateToProducts(concert.band)
                        }}
                        onMouseEnter={() => setCurrentShirt(index)}
                      >
                        <Image
                          src={shirt}
                          alt={`${concert.band} shirt ${index + 1}`}
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
            {/* Mobile shirts: parte inferior */}
            <div className="md:hidden mt-0 -mb-8">
              <div className="flex justify-center items-center">
                {concert.shirts.length > 0 && (
                  <div
                    className="relative cursor-pointer transform transition-transform duration-300 hover:scale-105"
                    onClick={() => navigateToProducts(concert.band)}
                    style={{
                      filter: `drop-shadow(8px 8px 15px rgba(0, 0, 0, 0.4))`,
                    }}
                  >
                    <Image
                      src={concert.shirts[randomShirtIndex]}
                      alt={`${concert.band} shirt`}
                      width={200}
                      height={240}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <section className="relative h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        {/* Slide saliente */}
        {isTransitioning && transitionTarget && (
          <div
            className="absolute w-full h-full z-10"
            style={{
              animation: direction === 'next'
                ? 'slideOutLeft 0.5s forwards'
                : 'slideOutRight 0.5s forwards',
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                top: '-15%',
                bottom: '-15%',
                height: '130%',
              }}
            >
              {/* Div negro de fondo para evitar espacios blancos */}
              <div className="absolute inset-0 bg-black" style={{ top: '-50%', height: '200%' }} />            <Image
              src={currentConcert.image || "/placeholder.svg"}
              alt={`${currentConcert.band} concert`}
              fill
              className="object-cover scale-115 object-left md:object-center"
            />
              <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <SlideContent concert={currentConcert} shirtIndex={currentShirt} />
            </div>
          </div>
        )}
        {/* Slide entrante */}
        {isTransitioning && transitionTarget && nextConcert && (
          <div
            className="absolute w-full h-full z-20"
            style={{
              animation: direction === 'next'
                ? 'slideInRight 0.5s forwards'
                : 'slideInLeft 0.5s forwards',
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                top: '-15%',
                bottom: '-15%',
                height: '130%',
                transform: `translateY(${scrollY * 0.8}px)`,
                transition: 'transform 0.03s ease-out',
              }}
            >
              {/* Div negro de fondo para evitar espacios blancos */}
              <div className="absolute inset-0 bg-black" style={{ top: '-50%', height: '200%' }} />
              <Image
                src={nextConcert.image || "/placeholder.svg"}
                alt={`${nextConcert.band} concert`}
                fill
                className="object-cover scale-115 object-left md:object-center"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <SlideContent concert={nextConcert} shirtIndex={0} />
            </div>
          </div>
        )}
        {/* Slide actual (sin transición) */}
        {!isTransitioning && (
          <div className="absolute w-full h-full z-20">					<div
            className="absolute w-full h-full"
            style={{
              top: '-15%',
              bottom: '-15%',
              height: '130%',
              transform: `translateY(${scrollY * 0.8}px)`,
              transition: 'transform 0.03s ease-out',
            }}
          >
            {/* Div negro de fondo para evitar espacios blancos */}
            <div className="absolute inset-0 bg-black" style={{ top: '-50%', height: '200%' }} />
            <Image
              src={currentConcert.image || "/placeholder.svg"}
              alt={`${currentConcert.band} concert`}
              fill
              className="object-cover scale-115 object-left md:object-center"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <SlideContent concert={currentConcert} shirtIndex={currentShirt} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlideFn}
        className="absolute left-4 md:top-1/2 md:transform-none bottom-6 md:bottom-auto z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:top-1/2 md:transform-none bottom-6 md:bottom-auto z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {upcomingConcerts.map((concert, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && triggerSlide(index > currentSlide ? 'next' : 'prev', index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? '' : 'bg-white/50'}`}
            style={{
              backgroundColor: index === currentSlide ? concert.color : undefined,
              border: index === currentSlide ? `2px solid ${concert.color}` : undefined,
            }}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Animaciones keyframes para slide */}
      <style jsx>{`
				@keyframes slideOutLeft {
					from { transform: translateX(0%); }
					to { transform: translateX(-100%); }
				}
				@keyframes slideInRight {
					from { transform: translateX(100%); }
					to { transform: translateX(0%); }
				}
				@keyframes slideOutRight {
					from { transform: translateX(0%); }
					to { transform: translateX(100%); }
				}
				@keyframes slideInLeft {
					from { transform: translateX(-100%); }
					to { transform: translateX(0%); }
				}
			`}</style>
    </section>
  )
}
