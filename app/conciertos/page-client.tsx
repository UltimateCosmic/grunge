"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket, Play, Pause, ExternalLink, Music } from "lucide-react"
import { useRouter } from "next/navigation"
import { upcomingConcerts } from "@/data/upcoming-concerts"
import ProductCard from "@/components/product-card"
import { mapProduct } from "@/lib/map-product"

interface SpotifyTrack {
  name: string
  preview_url: string
  external_urls: {
    spotify: string
  }
  duration_ms: number
}

export default function ConcertosPage() {
  const [playingTrack, setPlayingTrack] = useState<{ concertId: number; trackIndex: number } | null>(null)
  const [tracks, setTracks] = useState<{ [key: number]: SpotifyTrack[] }>({})
  const [products, setProducts] = useState<{ [key: string]: any[] }>({})
  const [loadingProducts, setLoadingProducts] = useState<{ [key: string]: boolean }>({})
  const audioRef = useRef<HTMLAudioElement>(null)
  const router = useRouter()

  // Función para navegar a productos con filtro de banda
  const navigateToProducts = (bandName: string) => {
    const normalized = bandName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '+')
    router.push(`/productos?band=${normalized}`)
  }

  // Cargar tracks de Spotify para cada concierto
  useEffect(() => {
    const loadSpotifyTracks = async () => {
      for (const concert of upcomingConcerts) {
        if (concert.spotifyId) {
          try {
            // Simular datos de Spotify (en una implementación real necesitarías el API de Spotify)
            const mockTracks: SpotifyTrack[] = [
              {
                name: concert.band === "Guns N' Roses" ? "Sweet Child O' Mine" : concert.band === "My Chemical Romance" ? "Welcome to the Black Parade" : concert.band === "Green Day" ? "Boulevard of Broken Dreams" : "In the End",
                preview_url: "",
                external_urls: { spotify: `https://open.spotify.com/artist/${concert.spotifyId}` },
                duration_ms: 240000
              },
              {
                name: concert.band === "Guns N' Roses" ? "Paradise City" : concert.band === "My Chemical Romance" ? "Helena" : concert.band === "Green Day" ? "Good Riddance" : "Numb",
                preview_url: "",
                external_urls: { spotify: `https://open.spotify.com/artist/${concert.spotifyId}` },
                duration_ms: 220000
              },
              {
                name: concert.band === "Guns N' Roses" ? "November Rain" : concert.band === "My Chemical Romance" ? "Teenagers" : concert.band === "Green Day" ? "Holiday" : "Crawling",
                preview_url: "",
                external_urls: { spotify: `https://open.spotify.com/artist/${concert.spotifyId}` },
                duration_ms: 280000
              }
            ]
            setTracks(prev => ({ ...prev, [concert.id]: mockTracks }))
          } catch (error) {
            console.error(`Error loading tracks for ${concert.band}:`, error)
          }
        }
      }
    }

    loadSpotifyTracks()
  }, [])

  // Cargar productos para cada banda
  useEffect(() => {
    const loadBandProducts = async () => {
      for (const concert of upcomingConcerts) {
        const bandSlug = concert.band
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")

        setLoadingProducts(prev => ({ ...prev, [concert.band]: true }))

        try {
          const API_SMART_COLLECTION = `https://api-v3.findify.io/v3/smart-collection/collections/${bandSlug}?user%5Buid%5D=2BFa9WflrlWkujYL&user%5Bsid%5D=Qe4lb3rBazBvmjwo&user%5Bpersist%5D=true&user%5Bexist%5D=true&t_client=1751442362499&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f&limit=8&slot=collections%2F${bandSlug}`

          const response = await fetch(API_SMART_COLLECTION)
          const json = await response.json()

          if (json.items) {
            const mapped = json.items.map((item: any) => mapProduct(item))
            setProducts(prev => ({ ...prev, [concert.band]: mapped.slice(0, 8) }))
          }
        } catch (error) {
          console.error(`Error loading products for ${concert.band}:`, error)
          setProducts(prev => ({ ...prev, [concert.band]: [] }))
        } finally {
          setLoadingProducts(prev => ({ ...prev, [concert.band]: false }))
        }
      }
    }

    loadBandProducts()
  }, [])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayTrack = (concertId: number, trackIndex: number) => {
    if (playingTrack?.concertId === concertId && playingTrack?.trackIndex === trackIndex) {
      setPlayingTrack(null)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    } else {
      setPlayingTrack({ concertId, trackIndex })
      // En una implementación real, reproducirías el preview_url aquí
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header con patrón grunge repetido */}
      <section className="relative bg-gradient-to-r from-brand-500 to-brand-600 text-white py-16 overflow-hidden">
        {/* Patrón SVG repetido con opacidad */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/rock-pattern.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '360px 360px',
            zIndex: 1,
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1
            className="text-5xl md:text-7xl font-bold font-aton uppercase"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Próximos conciertos
          </h1>
          <p
            className="text-xl text-brand-100 mx-auto font-roboto drop-shadow-sm"
            style={{ textShadow: "2px 4px 16px rgba(0,0,0,0.25)" }}
          >
            Descubre los próximos shows de tus bandas favoritas y consigue el merch oficial antes de que se agote
          </p>
        </div>
      </section>

      {/* Conciertos */}
      <section className="py-16">
        <div className="container mx-auto px-4 space-y-20">
          {upcomingConcerts.map((concert, index) => (
            <div key={concert.id} className="relative">
              {/* Concert Card */}
              <div className="rounded-3xl shadow-2xl overflow-hidden">
                {/* Concert Header */}
                <div
                  className="relative h-80 md:h-96 flex items-center justify-center text-white"
                >
                  <div
                    className="absolute inset-0 opacity-100"
                    style={{
                      backgroundImage: `url(${concert.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60" />

                  <div className="relative z-10 text-center space-y-6">
                    <Image
                      src={concert.logo || "/placeholder.svg"}
                      alt={`${concert.band} logo`}
                      width={400}
                      height={160}
                      className="h-24 md:h-32 w-auto object-contain mx-auto"
                    />

                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-lg">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="h-6 w-6" style={{ color: concert.color }} />
                          <span className="font-semibold">{concert.date}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <MapPin className="h-6 w-6" style={{ color: concert.color }} />
                          <span>{concert.venue}, {concert.city}</span>
                        </div>
                      </div>

                      <p className="text-xl max-w-2xl mx-auto">
                        {concert.message}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          size="lg"
                          style={{ backgroundColor: concert.color }}
                          className="text-white px-8 border-0 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                          onClick={() => navigateToProducts(concert.band)}
                        >
                          Ver Colección de {concert.band}
                        </Button>

                        {concert.ticketUrl && (
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-black bg-transparent group"
                            asChild
                          >
                            <a
                              href={concert.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Ticket className="w-5 h-5" />
                              Comprar en
                              <Image
                                src={`/ticket-provider/${concert.ticketProvider.toLowerCase()}.png`}
                                alt={concert.ticketProvider}
                                width={60}
                                height={13}
                                className="inline-block align-middle h-4 w-auto object-contain transition-all duration-200 filter brightness-0 invert group-hover:filter-none group-hover:brightness-100 group-hover:invert-0"
                              />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Popular Songs */}
                    {concert.spotifyId ? (
                      <div className="w-full flex flex-col items-center">
                        <iframe
                          src={`https://open.spotify.com/embed/artist/${concert.spotifyId}?utm_source=generator&theme=0`}
                          width="100%"
                          height="380"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-xl shadow-lg border border-gray-200"
                          title={`Spotify Player - ${concert.band}`}
                        ></iframe>
                      </div>
                    ) : (
                      <div className="text-gray-500">No hay canciones disponibles para este artista.</div>
                    )}

                    {/* Concert Info */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Información del Concierto
                      </h3>

                      <div className="space-y-4 text-gray-600">
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 mt-0.5" style={{ color: concert.color }} />
                          <div>
                            <p className="font-medium text-gray-900">Fecha</p>
                            <p>{concert.date}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 mt-0.5" style={{ color: concert.color }} />
                          <div>
                            <p className="font-medium text-gray-900">Lugar</p>
                            <p>{concert.venue}</p>
                            <p className="text-sm text-gray-500">{concert.city}</p>
                          </div>
                        </div>

                        {concert.ticketProvider && (
                          <div className="flex items-start space-x-3">
                            <Ticket className="h-5 w-5 mt-0.5" style={{ color: concert.color }} />
                            <div>
                              <p className="font-medium text-gray-900">Tickets</p>
                              <p>Disponibles en {concert.ticketProvider}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {concert.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Merch Collection */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-3xl font-bold text-gray-900">
                        La Colección de {concert.band}
                      </h3>
                      <Button
                        variant="outline"
                        onClick={() => navigateToProducts(concert.band)}
                        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors hover:text-white"
                      >
                        Ver Todo
                      </Button>
                    </div>

                    {loadingProducts[concert.band] ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-gray-100 rounded-lg overflow-hidden">
                            <div className="w-full h-64 bg-gray-200 animate-pulse" />
                            <div className="p-4 space-y-3">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                              <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : products[concert.band] && products[concert.band].length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {products[concert.band].slice(0, 4).map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay productos disponibles para esta banda por el momento.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audio element for track previews */}
      <audio ref={audioRef} />
    </div>
  )
}
