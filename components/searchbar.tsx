"use client"
import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductMatch {
  id: string | number
  name: string
  band: string
  image: string
  url: string
  price: number
}

export default function Searchbar({ onClose, autoFocus }: { onClose?: () => void, autoFocus?: boolean }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cierre automático al hacer click fuera
  useEffect(() => {
    if (!autoFocus) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setQuery("");
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [autoFocus, onClose])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setIsLoading(true)

    // Usar nuestro endpoint proxy para obtener datos de Findify
    fetch(`/api/search-findify?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        console.log('Datos recibidos del servidor:', data)
        setResults(data.results || [])
        setShowDropdown(true)
      })
      .catch(error => {
        console.error('Error fetching search results:', error)
        setResults([])
        setShowDropdown(false)
      })
      .finally(() => setIsLoading(false))
  }, [query])

  const handleSelect = (url: string) => {
    setShowDropdown(false)
    setQuery("")
    if (onClose) onClose()
    router.push(url)
  }

  const handleBandClick = (band: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se active el click del producto
    setShowDropdown(false)
    setQuery("")
    if (onClose) onClose()
    router.push(`/productos?banda=${encodeURIComponent(band)}`)
  }

  // Foco automático al abrir el searchbar
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus])

  return (
    <div className="relative w-full" ref={rootRef}>
      <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none bg-transparent text-sm"
          placeholder="Buscar productos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50">
          <div className="p-2 border-b border-gray-100 flex justify-between items-center">
            <div className="text-xs font-medium text-gray-500">Resultados</div>
            {!isLoading && results.length > 0 && (
              <div className="text-xs text-gray-400">{results.length} productos</div>
            )}
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full mb-2"></div>
              <div className="text-sm">Buscando...</div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm mb-1">Sin resultados</div>
              <div className="text-xs text-gray-400">Intenta con otra búsqueda</div>
            </div>
          ) : (
            <div>
              <div className="py-2 px-1">
                <div className="space-y-1">
                  {results.slice(0, 5).map(product => (
                    <div
                      key={product.id}
                      className="flex items-center p-2 hover:bg-gray-100 transition-colors rounded cursor-pointer border border-transparent hover:border-gray-200"
                      onClick={() => handleSelect(product.url)}
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden mr-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'auto' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.band && (
                          <a
                            href={`/productos?banda=${encodeURIComponent(product.band)}`}
                            className="text-xs text-brand-600 hover:underline hover:text-brand-700 cursor-pointer font-medium transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          >
                            {product.band}
                          </a>
                        )}
                        <div className="text-sm text-gray-900 line-clamp-2">{product.name}</div>
                        <div className="text-xs font-semibold mt-1">
                          S/. {product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de "Ver todos los productos" */}
              <div className="p-2 border-t border-gray-100">
                <button
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 rounded text-center"
                  onClick={() => {
                    if (onClose) onClose();
                    router.push(`/productos?q=${encodeURIComponent(query)}`);
                  }}
                >
                  Ver todos los productos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
