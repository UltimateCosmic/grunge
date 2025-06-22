"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react"

const upcomingConcerts = [
  {
    id: 1,
    band: "Guns N' Roses",
    logo: "/placeholder.svg?height=120&width=300",
    date: "5 de Noviembre",
    venue: "Estadio Nacional",
    city: "Santiago",
    image: "/placeholder.svg?height=600&width=800",
    merchPreview: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    band: "Arctic Monkeys",
    logo: "/placeholder.svg?height=120&width=300",
    date: "12 de Diciembre",
    venue: "Movistar Arena",
    city: "Buenos Aires",
    image: "/placeholder.svg?height=600&width=800",
    merchPreview: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    band: "The Strokes",
    logo: "/placeholder.svg?height=120&width=300",
    date: "20 de Enero",
    venue: "Luna Park",
    city: "Buenos Aires",
    image: "/placeholder.svg?height=600&width=800",
    merchPreview: "/placeholder.svg?height=400&width=600",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % upcomingConcerts.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
              <div className="flex items-center space-x-4 text-lg text-white">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-brand-500" />
                  <span>{currentConcert.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-brand-500" />
                  <span>
                    {currentConcert.venue}, {currentConcert.city}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-200">
              ¡No te pierdas el concierto del año! Consigue el merch oficial antes de que se agote.
            </p>

            <div className="flex space-x-4">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8">
                Ver Merch Oficial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                Más Info del Concierto
              </Button>
            </div>
          </div>

          {/* Right side - Merch Preview */}
          <div className="hidden md:block">
            <div className="relative">
              <Image
                src={currentConcert.merchPreview || "/placeholder.svg"}
                alt={`${currentConcert.band} merchandise`}
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm">Merch Oficial Disponible</p>
                <p className="text-xs text-gray-300">Camisetas, hoodies, posters y más</p>
              </div>
            </div>
          </div>
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
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-brand-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
