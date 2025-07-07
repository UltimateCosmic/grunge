"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, Play, Pause, SkipForward, SkipBack, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import Searchbar from "@/components/searchbar"
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";

// Declaración de tipos para jsmediatags y función global para pausar el header
declare global {
  interface Window {
    jsmediatags: any;
    __pauseHeaderPlayer?: () => void;
  }
}

// Lista de canciones disponibles
const rockPlaylist = [
  {
    id: 1,
    title: "Welcome to the Jungle",
    artist: "Guns N Roses",
    src: "/music/guns-n-roses-welcome-to-the-jungle.mp3"
  },
  {
    id: 2,
    title: "I'm Not Okay",
    artist: "My Chemical Romance",
    src: "/music/mcr-im-not-okay.mp3"
  },
  {
    id: 3,
    title: "American Idiot",
    artist: "Green Day",
    src: "/music/green-day-american-idiot.mp3"
  },
  {
    id: 4,
    title: "The Emptiness Machine",
    artist: "Linkin Park",
    src: "/music/linkin-park-the-emptiness-machine.mp3"
  }
]

export default function Header() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [isLoadingArt, setIsLoadingArt] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { items, removeFromCart, getCount } = useCart();
  const { toast } = useToast();
  const totalItems = getCount();

  // Pausar iframes de Spotify al reproducir en el header
  const pauseSpotifyIframes = () => {
    const iframes = document.querySelectorAll('iframe[src*="open.spotify.com/embed/artist"]');
    iframes.forEach((iframe) => {
      // Forzar reload del src para pausar el reproductor de Spotify
      const src = iframe.getAttribute('src');
      if (src) iframe.setAttribute('src', src);
    });
  };

  // Funciones de control del reproductor
  const togglePlay = () => {
    if (!audioRef.current) return

    // Marcar que el usuario ha interactuado
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      pauseSpotifyIframes(); // Pausar iframes de Spotify
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((error) => {
        console.log('Error al reproducir:', error)
        setIsPlaying(false)
      })
    }
  }

  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % rockPlaylist.length)
  }

  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + rockPlaylist.length) % rockPlaylist.length)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      // Intentar extraer metadatos de la imagen
      extractAlbumArt()
    }
  }

  const extractAlbumArt = async () => {
    console.log('Extrayendo album art para canción:', currentSong, rockPlaylist[currentSong].title)

    // Iniciar estado de loading
    setIsLoadingArt(true)

    try {
      // Método 1: Intentar usar jsmediatags para extraer metadatos del MP3
      const response = await fetch(rockPlaylist[currentSong].src)
      const arrayBuffer = await response.arrayBuffer()

      console.log('Archivo MP3 cargado, tamaño:', arrayBuffer.byteLength)

      // Usar jsmediatags si está disponible
      if (window.jsmediatags) {
        console.log('jsmediatags disponible, extrayendo metadatos...')
        window.jsmediatags.read(new Blob([arrayBuffer]), {
          onSuccess: function (tag: any) {
            console.log('Metadatos extraídos exitosamente:', tag.tags)
            console.log('Tags disponibles:', Object.keys(tag.tags))

            if (tag.tags.picture) {
              console.log('Imagen encontrada en MP3')
              console.log('Formato de imagen:', tag.tags.picture.format)
              console.log('Tamaño de imagen:', tag.tags.picture.data.length)

              const picture = tag.tags.picture

              // Mejorar la conversión a base64 para imágenes grandes
              let base64String;
              try {
                // Método optimizado para imágenes grandes
                const uint8Array = new Uint8Array(picture.data);

                // Convertir en chunks para evitar stack overflow
                let binary = '';
                const chunkSize = 8192; // 8KB chunks

                for (let i = 0; i < uint8Array.length; i += chunkSize) {
                  const chunk = uint8Array.slice(i, i + chunkSize);
                  binary += String.fromCharCode.apply(null, Array.from(chunk));
                }

                base64String = btoa(binary);

                const mimeType = picture.format || 'image/jpeg'
                const imageUrl = `data:${mimeType};base64,${base64String}`
                console.log('Imagen convertida exitosamente, MIME:', mimeType)
                setAlbumArt(imageUrl)
                setIsLoadingArt(false) // Finalizar loading
              } catch (conversionError) {
                console.log('Error convirtiendo imagen a base64:', conversionError)
                // Método alternativo usando FileReader
                try {
                  const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format || 'image/jpeg' });
                  const reader = new FileReader();
                  reader.onload = function () {
                    setAlbumArt(reader.result as string);
                    setIsLoadingArt(false); // Finalizar loading
                    console.log('Imagen convertida con FileReader');
                  };
                  reader.readAsDataURL(blob);
                } catch (fallbackError) {
                  console.log('Error en método alternativo:', fallbackError);
                  setDefaultAlbumArt();
                  setIsLoadingArt(false); // Finalizar loading
                }
              }
            } else {
              console.log('No se encontró imagen en MP3, buscando en otros campos...')
              // Buscar en otros posibles campos de imagen
              const possibleImageFields = ['APIC', 'PIC', 'artwork', 'cover']
              let imageFound = false

              for (const field of possibleImageFields) {
                if (tag.tags[field]) {
                  console.log(`Imagen encontrada en campo ${field}`)
                  // Procesar imagen del campo alternativo
                  // Similar al procesamiento anterior
                  imageFound = true
                  break
                }
              }

              if (!imageFound) {
                console.log('No se encontró imagen en ningún campo, usando fallback')
                setDefaultAlbumArt()
                setIsLoadingArt(false) // Finalizar loading
              }
            }
          },
          onError: function (error: any) {
            console.log('Error extrayendo metadatos:', error)
            console.log('Detalles del error:', error.type, error.info)
            setDefaultAlbumArt()
            setIsLoadingArt(false) // Finalizar loading
          }
        })
      } else {
        console.log('jsmediatags no disponible, usando fallback')
        setDefaultAlbumArt()
        setIsLoadingArt(false) // Finalizar loading
      }
    } catch (error) {
      console.log('Error al procesar el archivo MP3:', error)
      setDefaultAlbumArt()
      setIsLoadingArt(false) // Finalizar loading
    }
  }

  const setDefaultAlbumArt = () => {
    // Fallback: usar imágenes extraídas manualmente de los MP3
    let defaultArt;
    switch(currentSong) {
      case 0:
        defaultArt = "/album-art/guns-n-roses-appetite-for-destruction.jpg";
        break;
      case 1:
        defaultArt = "/album-art/mcr-three-cheers.jpg";
        break;
      case 2:
        defaultArt = "/album-art/green-day-american-idiot.jpg";
        break;
      case 3:
        defaultArt = "/album-art/linkin-park-meteora.jpg";
        break;
      default:
        defaultArt = "/album-art/default-rock.jpg";
    }
    setAlbumArt(defaultArt)
    setIsLoadingArt(false) // Finalizar loading
  }

  const handleSongEnd = () => {
    nextSong()
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Effect para cambiar canción
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = rockPlaylist[currentSong].src
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentSong])

  // Effect separado para extraer album art cuando cambie la canción
  useEffect(() => {
    // Resetear album art y activar loading
    setAlbumArt(null)
    setIsLoadingArt(true)
    // Extraer album art después de un pequeño delay
    const timer = setTimeout(() => {
      extractAlbumArt()
    }, 100)

    return () => clearTimeout(timer)
  }, [currentSong])

  // Effect para configurar la canción aleatoria inicial
  useEffect(() => {
    // Seleccionar una canción aleatoria al cargar
    const randomSong = Math.floor(Math.random() * rockPlaylist.length)
    console.log(`Canción aleatoria seleccionada: ${randomSong} - ${rockPlaylist[randomSong].title}`)
    setCurrentSong(randomSong)
  }, [])

  // Effect para cargar jsmediatags, configurar volumen inicial y detectar interacciones
  useEffect(() => {
    // Cargar jsmediatags desde CDN si no está disponible
    if (!window.jsmediatags) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js'
      script.async = true
      script.onload = () => {
        // Una vez cargado jsmediatags, extraer album art inicial
        setTimeout(() => extractAlbumArt(), 100)
      }
      document.head.appendChild(script)
    } else {
      // Si ya está cargado, extraer album art inicial
      setTimeout(() => extractAlbumArt(), 100)
    }

    // Listener para detectar primera interacción del usuario
    const handleFirstInteraction = () => {
      if (!hasUserInteracted) {
        console.log('Primera interacción del usuario detectada')
        setHasUserInteracted(true)
      }
    }

    // Agregar listeners para diferentes tipos de interacción
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      // Limpiar listeners
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [hasUserInteracted])

  // Nuevo effect SOLO para actualizar el volumen del audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Registrar función global para pausar el header
  useEffect(() => {
    window.__pauseHeaderPlayer = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    return () => {
      window.__pauseHeaderPlayer = undefined;
    };
  }, []);

  return (
    <>
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-0">
          <div className="flex items-center h-16">
            {/* 1. Logo a la izquierda */}
            <div className="flex-shrink-0 w-24 flex items-center justify-start">
              <Link href="/" className="flex items-center space-x-2">
                <img
                  src="/grunge-logo.png"
                  alt="RockMerch Logo"
                  className="w-16 h-16 invert object-contain"
                />
              </Link>
            </div>

            {/* 2. Centro: Reproductor + Navegación */}
            <div className="flex-1 flex items-center justify-between">
              {/* Music Player compacto */}
              <div className="hidden lg:flex items-center space-x-4 mr-8">
                {/* Album Art con Loading */}
                <div className="w-10 h-10 rounded overflow-hidden flex items-center justify-center">
                  {isLoadingArt ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-white"></div>
                  ) : albumArt ? (
                    <img
                      src={albumArt}
                      alt="Album Art"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Song Info */}
                <div className="min-w-0">
                  <h4 className="text-white text-xs font-medium truncate max-w-32">
                    {rockPlaylist[currentSong].title}
                  </h4>
                  <Link
                    href={`/productos?band=${encodeURIComponent(rockPlaylist[currentSong].artist)}`}
                    className="text-brand-500 hover:underline text-xs truncate max-w-32 block cursor-pointer"
                    title={`Ver productos de ${rockPlaylist[currentSong].artist}`}
                  >
                    {rockPlaylist[currentSong].artist}
                  </Link>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSong}
                    className="text-gray-300 hover:text-black p-1 h-7 w-7"
                  >
                    <SkipBack className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-gray-300 hover:text-black p-1 h-7 w-7"
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSong}
                    className="text-gray-300 hover:text-black p-1 h-7 w-7"
                  >
                    <SkipForward className="h-3 w-3" />
                  </Button>
                </div>

                {/* Progress Bar en el header - Expandida */}
                <div className="flex items-center space-x-3 min-w-0 flex-1 max-w-60">
                  <span className="text-gray-400 text-xs min-w-[35px] text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 bg-gray-700 rounded-full h-1 min-w-[120px]">
                    <div
                      className="bg-brand-500 h-1 rounded-full transition-all duration-200"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs min-w-[35px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Volume Control (desplegable con hover) */}
                <div className="group relative flex items-center">
                  <button className="p-1 focus:outline-none">
                    <Volume2 className="h-4 w-4 text-gray-300" />
                  </button>
                  <div className="hidden group-hover:flex items-center absolute left-6 rounded-full px-2 py-1 z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 w-[90px]">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-700 rounded-full outline-none appearance-none"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation junto al reproductor */}
              <nav className="flex justify-center">
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Inicio
                  </Link>
                  <Link href="/productos" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Productos
                  </Link>
                  <Link href="/conciertos" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Conciertos
                  </Link>
                  <Link href="/nosotros" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Nosotros
                  </Link>
                </div>
              </nav>
            </div>

            {/* 3. Derecha: Búsqueda + Carrito */}
            <div className="flex items-center space-x-2 justify-end flex-shrink-0 w-32">
              {/* Mobile Music Toggle */}
              <div className="lg:hidden flex items-center justify-center h-10 w-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-gray-300 hover:text-black h-10 w-10 p-0 flex items-center justify-center"
                  aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </div>

              {/* Searchbar funcional */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-black"
                  onClick={() => {
                    // Si el carrito está abierto, cerrarlo
                    if (showCart) setShowCart(false);
                    setShowSearch((v) => !v);
                  }}
                >
                  <Search className="h-5 w-5" />
                </Button>
                {showSearch && (
                  <div className="absolute right-0 mt-2 z-50 w-72">
                    <Searchbar onClose={() => setShowSearch(false)} autoFocus />
                  </div>
                )}
              </div>

              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-black relative"
                  onClick={() => {
                    // Si la búsqueda está abierta, cerrarla
                    if (showSearch) setShowSearch(false);
                    setShowCart((v) => !v);
                  }}
                  aria-label="Ver carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>

              {/* Botón de menú mobile */}
              <div className="md:hidden flex items-center justify-center h-10 w-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-black h-10 w-10 p-0 flex items-center justify-center"
                  aria-label="Abrir menú"
                  onClick={() => setShowMobileMenu((v) => !v)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
        preload="metadata"
      />
      
      {/* Sidebar del Carrito */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cabecera del carrito */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Tu Carrito</h2>
            <button 
              onClick={() => setShowCart(false)} 
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>
          
          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mt-2">Agrega productos desde la tienda</p>
                <Button 
                  className="mt-6 bg-brand-500 hover:bg-brand-600"
                  onClick={() => {
                    setShowCart(false);
                    // Si estás en una página de producto, puedes navegar a la tienda
                  }}
                >
                  Ver productos
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((item: import("@/components/cart-context").CartItem) => (
                  <li key={item.id + (item.size || "")} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded object-cover border" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.size && item.size !== 'Única' && (
                        <div className="text-sm text-gray-500">Talla: {item.size}</div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-sm text-brand-600 font-semibold">S/. {item.price.toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Cant: {item.quantity}</span>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                            onClick={() => {
                              removeFromCart(item.id, item.size);
                              toast({ title: "Producto eliminado", description: item.title });
                            }}
                            aria-label="Eliminar del carrito"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer del carrito con total y botón de checkout */}
          {items.length > 0 && (
            <div className="border-t py-4 px-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold">
                  S/. {items.reduce((sum: number, item: import("@/components/cart-context").CartItem) => 
                    sum + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              <Button size="lg" className="w-full bg-brand-500 hover:bg-brand-600 text-white">
                Finalizar compra
              </Button>
              <button 
                className="w-full mt-2 text-center text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowCart(false)}
              >
                Seguir comprando
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay para cerrar el carrito al hacer clic fuera */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Menú lateral mobile */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showMobileMenu ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cabecera del menú */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Menú</h2>
            <button 
              onClick={() => setShowMobileMenu(false)} 
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>
          {/* Mini reproductor de música en mobile */}
          <div className="flex items-center gap-3 px-4 py-4 border-b">
            {/* Album Art */}
            <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-gray-100">
              {isLoadingArt ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-brand-500"></div>
              ) : albumArt ? (
                <img src={albumArt} alt="Album Art" className="w-full h-full object-cover" />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded" />
              )}
            </div>
            {/* Info y controles */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">
                {rockPlaylist[currentSong].title}
              </div>
              <div className="text-xs text-brand-500 truncate">
                {rockPlaylist[currentSong].artist}
              </div>
              <div className="flex items-center mt-1 gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-gray-500 hover:text-brand-500" onClick={prevSong}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-gray-500 hover:text-brand-500" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 text-gray-500 hover:text-brand-500" onClick={nextSong}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Enlaces de navegación */}
          <nav className="flex-1 flex flex-col gap-2 p-4">
            <Link href="/" className="text-lg text-black hover:text-brand-500 py-2" onClick={() => setShowMobileMenu(false)}>
              Inicio
            </Link>
            <Link href="/productos" className="text-lg text-black hover:text-brand-500 py-2" onClick={() => setShowMobileMenu(false)}>
              Productos
            </Link>
            <Link href="/conciertos" className="text-lg text-black hover:text-brand-500 py-2" onClick={() => setShowMobileMenu(false)}>
              Conciertos
            </Link>
            <Link href="/nosotros" className="text-lg text-black hover:text-brand-500 py-2" onClick={() => setShowMobileMenu(false)}>
              Nosotros
            </Link>
          </nav>
        </div>
      </div>
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  )
}
