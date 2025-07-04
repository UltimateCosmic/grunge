"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, ShoppingCart, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import ProductCard from "@/components/product-card"
import qs from "qs"
import { mapProduct, convertToPEN } from "@/lib/map-product"

// Endpoint global de búsqueda Findify (devuelve productos y facets globales)
const API_SEARCH = "https://api-v3.findify.io/v3/search/" +
  "?user%5Buid%5D=2BFa9WflrlWkujYL" +
  "&user%5Bsid%5D=Qe4lb3rBazBvmjwo" +
  "&user%5Bpersist%5D=true" +
  "&user%5Bexist%5D=true" +
  "&t_client=1751442362499" +
  "&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f" +
  "&slot=findify-search" +
  "&max_count=10000"

// Utilidad para construir el query string de filtros Findify
function buildFindifyFiltersQS({ bands, types, sizes, priceRange, dynamicPrice }: {
  bands: string[];
  types: string[];
  sizes: string[];
  priceRange: [number, number];
  dynamicPrice: [number, number];
}) {
  const filters: any[] = [];
  if (bands.length > 0) {
    filters.push({
      name: "brand",
      type: "text",
      values: bands.map((b: string) => ({ value: b })),
    });
  }
  if (types.length > 0) {
    filters.push({
      name: "custom_fields.apparel",
      type: "text",
      values: types.map((t: string) => ({ value: t })),
    });
  }
  if (sizes.length > 0) {
    filters.push({
      name: "size",
      type: "text",
      values: sizes.map((s: string) => ({ value: s })),
    });
  }
  if (priceRange[0] > dynamicPrice[0] || priceRange[1] < dynamicPrice[1]) {
    // Convertir los precios de PEN a USD para la API
    const fromUSD = Math.floor(priceRange[0] / 3.55);
    const toUSD = Math.ceil(priceRange[1] / 3.55);
    filters.push({
      name: "price",
      type: "range",
      values: [{ from: fromUSD, to: toUSD }],
    });
  }
  // Usar qs para serializar el array de filtros en formato anidado
  return qs.stringify({ filters }, { encodeValuesOnly: true, arrayFormat: "indices" });
}

export default function ProductsGrid() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bandaSlug = searchParams?.get("banda")

  const [products, setProducts] = useState<any[]>([])
  const [facets, setFacets] = useState<any[]>([])
  const [selectedBands, setSelectedBands] = useState<string[]>(bandaSlug ? [bandaSlug] : [])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 355]) // Valor inicial en soles (100 USD = 355 PEN)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(true) // Estado de carga
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Estado para controlar la carga inicial
  const [requestCache, setRequestCache] = useState<{[key: string]: any}>({}) // Cache de respuestas
  const PRODUCTS_PER_PAGE = 24

  // Filtros dinámicos (ahora como arrays de objetos { value, count })
  const [dynamicBands, setDynamicBands] = useState<{ value: string, count: number }[]>([])
  const [dynamicTypes, setDynamicTypes] = useState<{ value: string, count: number }[]>([])
  const [dynamicSizes, setDynamicSizes] = useState<{ value: string, count: number }[]>([])
  const [dynamicPrice, setDynamicPrice] = useState<[number, number]>([0, 355]) // Valor inicial en soles
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 355]) // Valor temporal para debounce en soles

  // Estados para controlar cuántos elementos mostrar en cada filtro
  const [expandedBands, setExpandedBands] = useState(false)
  const [expandedTypes, setExpandedTypes] = useState(false)
  const [expandedSizes, setExpandedSizes] = useState(false)
  // Estados para searchbar de filtros
  const [bandSearch, setBandSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [sizeSearch, setSizeSearch] = useState("");
  // Límite inicial de elementos a mostrar por filtro
  const INITIAL_FILTER_LIMIT = 6

  // Estado y lógica para el ordenamiento
  const [sortOrder, setSortOrder] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('sort') || 'popularity'
    }
    return 'popularity'
  })

  const handleSortChange = (value: string) => {
    setSortOrder(value)
    setCurrentPage(1) // Reiniciar a la primera página al cambiar orden
  }

  // Fetch con filtros y paginación
  // Función para actualizar filtros dinámicos y limpiar los que ya no están disponibles
  const updateDynamicFilters = useCallback((json: any) => {
    console.log("Actualizando filtros dinámicos con nueva respuesta de API");
    
    // Poblar dinámicamente bandas, tipos y tallas
    const bandFacet = json.facets?.find((f: any) => f.name === "brand");
    const newBands = bandFacet ? bandFacet.values : [];
    setDynamicBands(newBands);
    
    const apparelFacet = json.facets?.find((f: any) => f.name === "custom_fields.apparel");
    const newTypes = apparelFacet ? apparelFacet.values : [];
    setDynamicTypes(newTypes);
    
    const sizeFacet = json.facets?.find((f: any) => f.name === "size");
    const newSizes = sizeFacet ? sizeFacet.values : [];
    setDynamicSizes(newSizes);
    
    // Rango de precio dinámico
    const priceFacet = json.facets?.find((f: any) => f.name === "price");
    if (priceFacet && priceFacet.min != null && priceFacet.max != null) {
      const minUSD = Math.floor(priceFacet.min);
      const maxUSD = Math.ceil(priceFacet.max);
      // Convertir los precios USD a PEN
      const minPEN = convertToPEN(minUSD);
      const maxPEN = convertToPEN(maxUSD);
      setDynamicPrice([minPEN, maxPEN]);
    }

    // Limpiar filtros seleccionados que ya no existen en los resultados actuales
    // Solo después de la carga inicial
    if (!isInitialLoad) {
      // Preparar valores disponibles
      const availableBandValues = newBands.map((b: any) => b.value);
      const availableTypeValues = newTypes.map((t: any) => t.value);
      const availableSizeValues = newSizes.map((s: any) => s.value);
      
      // Limpiar bandas que ya no están disponibles
      if (selectedBands.length > 0) {
        const validBands = selectedBands.filter(band => availableBandValues.includes(band));
        if (validBands.length !== selectedBands.length) {
          console.log("Limpiando bandas que ya no están disponibles:", 
                     selectedBands, "->", validBands);
          setSelectedBands(validBands);
        }
      }
      
      // Limpiar tipos que ya no están disponibles
      if (selectedTypes.length > 0) {
        const validTypes = selectedTypes.filter(type => availableTypeValues.includes(type));
        if (validTypes.length !== selectedTypes.length) {
          console.log("Limpiando tipos que ya no están disponibles:", 
                     selectedTypes, "->", validTypes);
          setSelectedTypes(validTypes);
        }
      }
      
      // Limpiar tallas que ya no están disponibles
      if (selectedSizes.length > 0) {
        const validSizes = selectedSizes.filter(size => availableSizeValues.includes(size));
        if (validSizes.length !== selectedSizes.length) {
          console.log("Limpiando tallas que ya no están disponibles:", 
                     selectedSizes, "->", validSizes);
          setSelectedSizes(validSizes);
        }
      }
      
      // Ajustar rango de precio si es necesario
      if (priceFacet && priceFacet.min != null && priceFacet.max != null) {
        const minUSD = Math.floor(priceFacet.min);
        const maxUSD = Math.ceil(priceFacet.max);
        // Convertir los precios USD a PEN
        const minPEN = convertToPEN(minUSD);
        const maxPEN = convertToPEN(maxUSD);
        
        setPriceRange(prev => {
          // Si el rango actual está fuera del nuevo rango disponible, ajustarlo
          if (prev[0] < minPEN || prev[1] > maxPEN) {
            const newRange = [
              Math.max(prev[0], minPEN),
              Math.min(prev[1], maxPEN)
            ];
            console.log("Ajustando rango de precio:", prev, "->", newRange);
            return newRange;
          }
          return prev;
        });
        
        setTempPriceRange(prev => {
          if (prev[0] < minPEN || prev[1] > maxPEN) {
            return [
              Math.max(prev[0], minPEN),
              Math.min(prev[1], maxPEN)
            ];
          }
          return prev;
        });
      }
    }
  }, [isInitialLoad, selectedBands, selectedTypes, selectedSizes]);

  useEffect(() => {
    // Crear identificador para cancelar peticiones en curso si es necesario
    let isMounted = true;
    let controller: AbortController | null = null;

    async function fetchProducts() {
      try {
        // Cancelar petición previa si existe
        if (controller) {
          controller.abort();
        }
        controller = new AbortController();
        const signal = controller.signal;
        setIsLoading(true) // Mostrar indicador de carga
        const offset = (currentPage - 1) * PRODUCTS_PER_PAGE
        // Construir query string de filtros Findify
        const filtersQS = buildFindifyFiltersQS({
          bands: selectedBands,
          types: selectedTypes,
          sizes: selectedSizes,
          priceRange: priceRange as [number, number],
          dynamicPrice: dynamicPrice as [number, number],
        });
        // --- Construir sort QS ---
        let sortQS = '';
        if (sortOrder === 'price_desc') {
          sortQS = qs.stringify({ sort: [{ field: 'price', order: 'desc' }] }, { encodeValuesOnly: true });
        } else if (sortOrder === 'price_asc') {
          sortQS = qs.stringify({ sort: [{ field: 'price', order: 'asc' }] }, { encodeValuesOnly: true });
        } else if (sortOrder === 'popularity') {
          sortQS = qs.stringify({ sort: [{ field: 'default', order: '' }] }, { encodeValuesOnly: true });
        } else if (sortOrder === 'newest') {
          sortQS = qs.stringify({ sort: [{ field: 'created_at', order: 'desc' }] }, { encodeValuesOnly: true });
        }
        // Construir clave única para esta combinación de filtros y página
        const cacheKey = `p${offset}_f${filtersQS}_s${sortQS}`;
        // Construir URL final
        const url = `${API_SEARCH}&limit=${PRODUCTS_PER_PAGE}&offset=${offset}${filtersQS && filtersQS.length > 0 ? `&${filtersQS}` : ""}${sortQS && sortQS.length > 0 ? `&${sortQS}` : ""}`;
        console.log("Fetching:", url);
        
        try {
          const res = await fetch(url, { signal });
          
          if (!isMounted) return;
          
          const json = await res.json();
          
          // Guardar en caché
          setRequestCache(prev => ({
            ...prev,
            [cacheKey]: json
          }));
          
          if (isMounted) {
            setProducts(json.items || []);
            setTotalProducts(json.meta?.total || 0);
            setFacets(json.facets || []);
            updateDynamicFilters(json);
            
            // Actualizar rango de precio solo en carga inicial sin filtros
            if (isInitialLoad && 
                selectedBands.length === 0 && 
                selectedTypes.length === 0 && 
                selectedSizes.length === 0) {
              const priceFacet = json.facets?.find((f: any) => f.name === "price")
              if (priceFacet?.min != null && priceFacet?.max != null) {
                const minUSD = Math.floor(priceFacet.min);
                const maxUSD = Math.ceil(priceFacet.max);
                // Convertir los precios USD a PEN
                const minPEN = convertToPEN(minUSD);
                const maxPEN = convertToPEN(maxUSD);
                setPriceRange([minPEN, maxPEN]);
                setTempPriceRange([minPEN, maxPEN]);
              }
            }
            
            // Marcar que ya no es la carga inicial después del primer fetch
            if (isInitialLoad) {
              setIsInitialLoad(false);
            }
          }
        } catch (fetchError) {
          if (isMounted) {
            // Verificar si es un error de AbortController
            const isAbortError = fetchError instanceof Error && fetchError.name === 'AbortError';
            if (!isAbortError) {
              console.error("Error fetching products:", fetchError);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetch process:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchProducts()

    // Limpiar si el componente se desmonta
    return () => {
      isMounted = false;
      if (controller) {
        controller.abort();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedBands, selectedTypes, selectedSizes, priceRange, sortOrder])

  // Esta función ahora se maneja directamente en updateDynamicFilters
  // para evitar múltiples actualizaciones y reducir las dependencias

  // Función pura para mapear productos (fuera del useMemo)
  // const mapProduct = (item: any) => {
  //   const usdPrice = Array.isArray(item.price) ? item.price[0] : (typeof item.price === "number" ? item.price : 0);
  //   const usdOriginalPrice = item.compare_at || null;
    
  //   return {
  //     id: item.id,
  //     name: item.title,
  //     band: item.brand, // Usar el valor tal cual viene de la API
  //     type: typeof item.custom_fields?.apparel === "string" ? item.custom_fields.apparel : Array.isArray(item.custom_fields?.apparel) ? item.custom_fields.apparel[0] : "",
  //     price: convertToPEN(usdPrice), // Convertir a soles
  //     originalPrice: usdOriginalPrice ? convertToPEN(usdOriginalPrice) : null, // Convertir a soles
  //     image: item.image_url || "/placeholder.svg?height=300&width=300",
  //     rating: typeof item.rating === "number" ? item.rating : 0,
  //     reviews: typeof item.reviews === "number" ? item.reviews : 0,
  //     isOnSale: Array.isArray(item.discount) && item.discount.length > 0,
  //     sizes: Array.isArray(item.size) ? item.size : typeof item.size === "string" ? [item.size] : Array.isArray(item.custom_fields?.variant_title) ? item.custom_fields.variant_title : typeof item.custom_fields?.variant_title === "string" ? [item.custom_fields.variant_title] : [],
  //     url: item.product_url ? `https://www.bandmerch.com${item.product_url}` : undefined,
  //   };
  // };

  // Mapeo de productos de la API (optimizado con useMemo)
  const mappedProducts = useMemo(() => {
    return products.map(product => mapProduct(product));
  }, [products]);

  const handleBandChange = (band: string, checked: boolean) => {
    console.log(`Cambiando filtro de banda ${band} a ${checked ? 'seleccionado' : 'no seleccionado'}`);
    if (checked) {
      setSelectedBands(prev => [...prev, band]);
    } else {
      setSelectedBands(prev => prev.filter((b) => b !== band));
    }
    // Resetear página a la primera al cambiar filtros
    setCurrentPage(1);
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    console.log(`Cambiando filtro de tipo ${type} a ${checked ? 'seleccionado' : 'no seleccionado'}`);
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter((t) => t !== type));
    }
    // Resetear página a la primera al cambiar filtros
    setCurrentPage(1);
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    console.log(`Cambiando filtro de talla ${size} a ${checked ? 'seleccionado' : 'no seleccionado'}`);
    if (checked) {
      setSelectedSizes(prev => [...prev, size]);
    } else {
      setSelectedSizes(prev => prev.filter((s) => s !== size));
    }
    // Resetear página a la primera al cambiar filtros
    setCurrentPage(1);
  }

  const clearAllFilters = () => {
    console.log("Limpiando todos los filtros");
    setSelectedBands([]);
    setSelectedTypes([]);
    setSelectedSizes([]);
    setPriceRange([...dynamicPrice]); // Crear una copia para asegurar un nuevo objeto
    setTempPriceRange([...dynamicPrice]);
    setCurrentPage(1);
  }

  // Paginación
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  // Debounce para el slider de precio (con referencia para evitar loops)
  const debouncePriceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncePriceChange = useCallback((value: number[]) => {
    // Actualizar el valor temporal inmediatamente para UI
    setTempPriceRange([value[0], value[1]]);
    
    // Limpiar timer previo
    if (debouncePriceTimerRef.current) {
      clearTimeout(debouncePriceTimerRef.current);
    }
    
    // Crear nuevo timer
    debouncePriceTimerRef.current = setTimeout(() => {
      console.log(`Aplicando filtro de precio: $${value[0]} - $${value[1]}`);
      setPriceRange([value[0], value[1]]);
      setCurrentPage(1);
      debouncePriceTimerRef.current = null;
    }, 500); // Esperar 500ms antes de aplicar el filtro
  }, [])

  // Sincronizar filtros con la URL y leerlos al cargar
  useEffect(() => {
    // Leer filtros desde la URL al cargar
    const params = new URLSearchParams(window.location.search);
    const bands = params.getAll("band");
    const types = params.getAll("type");
    const sizes = params.getAll("size");
    const priceFrom = params.get("priceFrom");
    const priceTo = params.get("priceTo");
    const page = params.get("page");
    if (bands.length > 0) setSelectedBands(bands);
    if (types.length > 0) setSelectedTypes(types);
    if (sizes.length > 0) setSelectedSizes(sizes);
    if (priceFrom && priceTo) {
      setPriceRange([parseFloat(priceFrom), parseFloat(priceTo)]);
      setTempPriceRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }
    if (page) setCurrentPage(Number(page));
    // eslint-disable-next-line
  }, []);

  // Actualizar la URL del navegador cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    selectedBands.forEach((b) => params.append("band", b));
    selectedTypes.forEach((t) => params.append("type", t));
    selectedSizes.forEach((s) => params.append("size", s));
    if (priceRange[0] > dynamicPrice[0] || priceRange[1] < dynamicPrice[1]) {
      params.set("priceFrom", priceRange[0].toString());
      params.set("priceTo", priceRange[1].toString());
    }
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortOrder && sortOrder !== 'popularity') {
      params.set('sort', sortOrder);
    } else {
      params.delete('sort');
    }
    const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", url);
    // eslint-disable-next-line
  }, [selectedBands, selectedTypes, selectedSizes, priceRange, currentPage, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white relative"
            disabled={isLoading}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {(selectedBands.length > 0 || selectedTypes.length > 0 || selectedSizes.length > 0 || 
              priceRange[0] > dynamicPrice[0] || priceRange[1] < dynamicPrice[1]) && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {selectedBands.length + selectedTypes.length + selectedSizes.length +
                 (priceRange[0] > dynamicPrice[0] || priceRange[1] < dynamicPrice[1] ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Sidebar */}
        <div className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-gray-900 font-aton uppercase">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-brand-600 hover:text-brand-700"
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>

            {/* Estado de carga para filtros */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center w-full px-6">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-4" />
                  <p className="text-gray-600 text-sm font-roboto mb-6">Actualizando filtros...</p>
                  <div className="w-full space-y-4">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-gray-200 my-4" />

            {/* Bandas Filter */}
            {dynamicBands.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 mb-3 font-aton uppercase text-base">Bandas</h4>
                  {dynamicBands.length > INITIAL_FILTER_LIMIT && (
                    <button 
                      onClick={() => setExpandedBands(!expandedBands)} 
                      className="text-xs text-gray-500 mb-3 hover:text-gray-700 focus:outline-none flex items-center justify-center w-6 h-6"
                      disabled={isLoading}
                      aria-label={expandedBands ? 'Mostrar menos bandas' : 'Mostrar más bandas'}
                    >
                      {expandedBands ? <span className="text-lg leading-none">−</span> : <span className="text-lg leading-none">+</span>}
                    </button>
                  )}
                </div>
                {/* Searchbar para Bandas */}
                {expandedBands && (
                  <input
                    type="text"
                    value={bandSearch}
                    onChange={e => setBandSearch(e.target.value)}
                    placeholder="Buscar banda..."
                    className="mb-2 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                    disabled={isLoading}
                  />
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dynamicBands
                    .filter(band => !expandedBands || band.value.toLowerCase().includes(bandSearch.toLowerCase()))
                    .slice(0, expandedBands ? undefined : INITIAL_FILTER_LIMIT)
                    .map((band) => (
                    <div key={band.value} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`band-${band.value}`}
                          checked={selectedBands.includes(band.value)}
                          onCheckedChange={(checked: boolean) => handleBandChange(band.value, checked)}
                          className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`band-${band.value}`} 
                          className={`text-sm cursor-pointer font-roboto ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {band.value}
                        </label>
                      </div>
                      <span className="text-xs text-gray-400 min-w-[2.5em] text-right">({band.count})</span>
                    </div>
                  ))}
                </div>
                {dynamicBands.length > INITIAL_FILTER_LIMIT && (
                  <button
                    onClick={() => setExpandedBands(!expandedBands)}
                    className="w-full mt-2 text-center text-sm text-brand-600 font-medium flex items-center justify-center focus:outline-none"
                    disabled={isLoading}
                  >
                    {expandedBands ? "− MENOS" : `+ MÁS (${dynamicBands.length - INITIAL_FILTER_LIMIT})`}
                  </button>
                )}
              </div>
            )}
            
            {/* Divisor entre filtros */}
            {dynamicBands.length > 0 && dynamicTypes.length > 0 && (
              <hr className="border-gray-200 my-4" />
            )}

            {/* Tipo de Producto Filter */}
            {dynamicTypes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 mb-3 font-aton uppercase text-base">Tipo de Producto</h4>
                  {dynamicTypes.length > INITIAL_FILTER_LIMIT && (
                    <button 
                      onClick={() => setExpandedTypes(!expandedTypes)} 
                      className="text-xs text-gray-500 mb-3 hover:text-gray-700 focus:outline-none flex items-center justify-center w-6 h-6"
                      disabled={isLoading}
                      aria-label={expandedTypes ? 'Mostrar menos tipos' : 'Mostrar más tipos'}
                    >
                      {expandedTypes ? <span className="text-lg leading-none">−</span> : <span className="text-lg leading-none">+</span>}
                    </button>
                  )}
                </div>
                {/* Searchbar para Tipo de Producto */}
                {expandedTypes && (
                  <input
                    type="text"
                    value={typeSearch}
                    onChange={e => setTypeSearch(e.target.value)}
                    placeholder="Buscar tipo..."
                    className="mb-2 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                    disabled={isLoading}
                  />
                )}
                <div className={`space-y-2 ${expandedTypes ? 'max-h-60 overflow-y-auto' : ''}`}> 
                  {dynamicTypes
                    .filter(type => !expandedTypes || type.value.toLowerCase().includes(typeSearch.toLowerCase()))
                    .slice(0, expandedTypes ? undefined : INITIAL_FILTER_LIMIT)
                    .map((type) => (
                    <div key={type.value} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={(checked: boolean) => handleTypeChange(type.value, checked)}
                          className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`type-${type.value}`} 
                          className={`text-sm cursor-pointer font-roboto ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {type.value}
                        </label>
                      </div>
                      <span className="text-xs text-gray-400 min-w-[2.5em] text-right">({type.count})</span>
                    </div>
                  ))}
                </div>
                {dynamicTypes.length > INITIAL_FILTER_LIMIT && (
                  <button
                    onClick={() => setExpandedTypes(!expandedTypes)}
                    className="w-full mt-2 text-center text-sm text-brand-600 font-medium flex items-center justify-center focus:outline-none"
                    disabled={isLoading}
                  >
                    {expandedTypes ? "− MENOS" : `+ MÁS (${dynamicTypes.length - INITIAL_FILTER_LIMIT})`}
                  </button>
                )}
              </div>
            )}
            
            {/* Divisor entre filtros */}
            {dynamicTypes.length > 0 && dynamicSizes.length > 0 && (
              <hr className="border-gray-200 my-4" />
            )}

            {/* Tamaño Filter */}
            {dynamicSizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 mb-3 font-aton uppercase text-base">Tamaño</h4>
                  {dynamicSizes.length > INITIAL_FILTER_LIMIT && (
                    <button 
                      onClick={() => setExpandedSizes(!expandedSizes)} 
                      className="text-xs text-gray-500 mb-3 hover:text-gray-700 focus:outline-none flex items-center justify-center w-6 h-6"
                      disabled={isLoading}
                      aria-label={expandedSizes ? 'Mostrar menos tallas' : 'Mostrar más tallas'}
                    >
                      {expandedSizes ? <span className="text-lg leading-none">−</span> : <span className="text-lg leading-none">+</span>}
                    </button>
                  )}
                </div>
                {/* Searchbar para Tallas */}
                {expandedSizes && (
                  <input
                    type="text"
                    value={sizeSearch}
                    onChange={e => setSizeSearch(e.target.value)}
                    placeholder="Buscar talla..."
                    className="mb-2 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                    disabled={isLoading}
                  />
                )}
                <div className={`space-y-2 ${expandedSizes ? 'max-h-60 overflow-y-auto' : ''}`}> 
                  {dynamicSizes
                    .filter(size => !expandedSizes || size.value.toLowerCase().includes(sizeSearch.toLowerCase()))
                    .slice(0, expandedSizes ? undefined : INITIAL_FILTER_LIMIT)
                    .map((size) => (
                    <div key={size.value} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size.value}`}
                          checked={selectedSizes.includes(size.value)}
                          onCheckedChange={(checked: boolean) => handleSizeChange(size.value, checked)}
                          className="data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`size-${size.value}`}
                          className={`text-sm cursor-pointer font-roboto ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {size.value}
                        </label>
                      </div>
                      <span className="text-xs text-gray-400 min-w-[2.5em] text-right">({size.count})</span>
                    </div>
                  ))}
                </div>
                {dynamicSizes.length > INITIAL_FILTER_LIMIT && (
                  <button
                    onClick={() => setExpandedSizes(!expandedSizes)}
                    className="w-full mt-2 text-center text-sm text-brand-600 font-medium flex items-center justify-center focus:outline-none"
                    disabled={isLoading}
                  >
                    {expandedSizes ? "− MENOS" : `+ MÁS (${dynamicSizes.length - INITIAL_FILTER_LIMIT})`}
                  </button>
                )}
              </div>
            )}
            
            {/* Divisor entre filtros */}
            {dynamicSizes.length > 0 && (
              <hr className="border-gray-200 my-4" />
            )}

            {/* Precio Filter */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-900 mb-3 font-aton uppercase text-base">Precio</h4>
              </div>
              <div className="space-y-4">
                <Slider
                  value={tempPriceRange}
                  onValueChange={debouncePriceChange}
                  max={dynamicPrice[1]}
                  min={dynamicPrice[0]}
                  step={10}
                  className="w-full"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-sm text-gray-600 font-roboto">
                  <span>S/ {tempPriceRange[0].toLocaleString('es-PE')}</span>
                  <span>S/ {tempPriceRange[1].toLocaleString('es-PE')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl text-gray-900 font-aton uppercase">
                Productos
              </h2>
              <p className="text-gray-600 font-roboto">
                {isLoading ? "Cargando..." : 
                  `Mostrando ${mappedProducts.length} de ${totalProducts} productos`}
              </p>
            </div>
            {/* Ordenar por */}
            <div className="ml-auto min-w-[220px]">
              <label htmlFor="sort-select" className="block text-xs text-gray-500 font-roboto mb-1 text-right">Ordenar por</label>
              <select
                id="sort-select"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-roboto focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                value={sortOrder}
                onChange={e => handleSortChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="popularity">Popularidad</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>
          </div>

          {/* Estado de carga para productos */}
          {isLoading ? (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-brand-500 mb-4" />
                <p className="text-gray-600 text-lg font-roboto">Cargando productos...</p>
                <p className="text-gray-500 text-sm mt-2 font-roboto">
                  {selectedBands.length > 0 && `Filtrando por ${selectedBands.join(', ')}`}
                  {selectedTypes.length > 0 && `${selectedBands.length ? ' y ' : 'Filtrando por '}${selectedTypes.join(', ')}`}
                  {selectedSizes.length > 0 && `${(selectedBands.length || selectedTypes.length) ? ' y ' : 'Filtrando por '}talla ${selectedSizes.join(', ')}`}
                  {(priceRange[0] > dynamicPrice[0] || priceRange[1] < dynamicPrice[1]) && 
                   `${(selectedBands.length || selectedTypes.length || selectedSizes.length) ? ' y ' : 'Filtrando por '}precio $${priceRange[0]} - $${priceRange[1]}`}
                </p>
              </div>
              
              {/* Grid de esqueletos de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div 
                    key={`skeleton-${index}`} 
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden p-4"
                  >
                    <div className="w-full h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={`star-${i}`} className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mappedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  {/* Paginación compacta */}
                  {(function() {
                    const pageButtons = []
                    const maxVisible = 7 // máximo de botones visibles
                    
                    // Siempre mostrar la página 1 primero
                    pageButtons.push(
                      <Button 
                        key={1} 
                        size="sm" 
                        variant={currentPage === 1 ? "default" : "outline"} 
                        onClick={() => handlePageChange(1)} 
                        className={currentPage === 1 ? "bg-brand-500 text-white" : ""}
                        disabled={isLoading}
                      >1</Button>
                    )
                    
                    // Calcular rango de páginas a mostrar (sin incluir 1 y última página)
                    let start = Math.max(2, currentPage - 1)
                    let end = Math.min(totalPages - 1, currentPage + 1)
                    
                    // Ajustar si estamos cerca del inicio o final
                    if (currentPage <= 3) {
                      end = Math.min(totalPages - 1, 4)
                    }
                    if (currentPage >= totalPages - 2) {
                      start = Math.max(2, totalPages - 4)
                    }
                    
                    // Mostrar elipsis después del 1 si hay espacio
                    if (start > 2) {
                      pageButtons.push(<span key="start-ellipsis">...</span>)
                    }
                    
                    // Páginas intermedias
                    for (let i = start; i <= end; i++) {
                      pageButtons.push(
                        <Button 
                          key={i} 
                          size="sm" 
                          variant={i === currentPage ? "default" : "outline"} 
                          onClick={() => handlePageChange(i)} 
                          className={i === currentPage ? "bg-brand-500 text-white" : ""}
                          disabled={isLoading}
                        >{i}</Button>
                      )
                    }
                    
                    // Mostrar elipsis antes de la última página si hay espacio
                    if (end < totalPages - 1) {
                      pageButtons.push(<span key="end-ellipsis">...</span>)
                    }
                    
                    // Última página (solo si hay más de una página)
                    if (totalPages > 1) {
                      pageButtons.push(
                        <Button 
                          key={totalPages} 
                          size="sm" 
                          variant={currentPage === totalPages ? "default" : "outline"} 
                          onClick={() => handlePageChange(totalPages)} 
                          className={currentPage === totalPages ? "bg-brand-500 text-white" : ""}
                          disabled={isLoading}
                        >{totalPages}</Button>
                      )
                    }
                    return pageButtons
                  })()}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              )}

              {mappedProducts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg font-roboto">
                    No se encontraron productos con los filtros seleccionados.
                  </p>
                  <Button 
                    onClick={clearAllFilters} 
                    className="mt-4 bg-brand-500 hover:bg-brand-600 text-white"
                    disabled={isLoading}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
