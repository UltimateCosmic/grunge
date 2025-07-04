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
}

export default function Searchbar({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cierre automático al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setQuery("");
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showDropdown, onClose])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setIsLoading(true)
    // Buscar productos por nombre o banda
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || [])
        setShowDropdown(true)
      })
      .finally(() => setIsLoading(false))
  }, [query])

  const handleSelect = (url: string) => {
    setShowDropdown(false)
    setQuery("")
    if (onClose) onClose()
    router.push(url)
  }

  return (
    <div className="relative w-full max-w-xs" ref={rootRef}>
      <div className="flex items-center border border-gray-300 rounded px-2 py-1 bg-white">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none bg-transparent text-sm"
          placeholder="Buscar productos o bandas..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">Sin resultados</div>
          ) : (
            results.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(product.url)}
              >
                <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-gray-900 text-sm">{product.name}</div>
                  <div className="truncate text-xs text-gray-500">{product.band}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
