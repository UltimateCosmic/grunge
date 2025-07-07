"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, Heart, Share2, Star, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/product-card"
import { mapProduct, convertToPEN } from "@/lib/map-product"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductVariant {
  id: string
  size: string
  price: number
  availability: boolean
  product_url: string
}

interface ProductDetail {
  id: string
  title: string
  brand: string
  price: number
  images: string[]
  description: string
  sizes: string[]
  variants: ProductVariant[]
  product_url: string
  availability: boolean
  quantity: number
  product_id: string
  sku: string
  tags: string[]
  compare_at?: number
  discount?: number[]
}

export default function ProductPageClient() {
  const params = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [sizeError, setSizeError] = useState<string>("");
  const [sizeTouched, setSizeTouched] = useState(false); // Nuevo estado para controlar si la talla fue tocada
  const inputRef = useRef<HTMLInputElement>(null);
  const ZOOM_SIZE = 180; // diámetro del círculo de zoom
  const ZOOM_SCALE = 2.2; // nivel de zoom
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (params?.slug) {
      fetchProductDetails(params.slug as string)
    }
  }, [params?.slug])

  const fetchProductDetails = async (slug: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/product-enhanced/${slug}`)
      const data = await response.json()

      if (data.product) {
        setProduct(data.product)
        setSelectedSize("")
        setSelectedVariant(null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSizeSelect = (size: string) => {
    const variant = product?.variants.find(v => v.size === size)
    if (variant) {
      setSelectedVariant(variant)
      setSelectedSize(size)
    } else {
      // Si no hay variante específica, solo actualizar la talla seleccionada
      setSelectedSize(size)
      setSelectedVariant(null)
    }
    // Limpiar error de talla cuando se selecciona una
    setSizeError("")
    setSizeTouched(true); // Marcar como tocada al seleccionar una talla
  }

  // Función para formatear precio en soles (idéntica a ProductCard)
  const formatPriceInPEN = (price: number): string => {
    return `S/. ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Obtener el precio actual en PEN usando la misma lógica de conversión
  const getCurrentPrice = () => {
    if (selectedVariant && selectedVariant.price) {
      return convertToPEN(selectedVariant.price);
    }
    return product?.price ? convertToPEN(product.price) : 0;
  }

  // Obtener el precio original en PEN usando la misma lógica de conversión
  const getOriginalPrice = () => {
    if (product?.compare_at) {
      return convertToPEN(product.compare_at);
    }
    return null;
  };

  const images = product?.images || []

  return (
    <>
      {isLoading ? (
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : !product ? (
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Galería de imágenes */}
            <div className="space-y-4">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 flex items-center gap-2" aria-label="Breadcrumb">
                <a href="/productos" className="hover:underline text-gray-600">Inicio</a>
                <span className="mx-1">/</span>
                <a
                  href={`/productos?banda=${encodeURIComponent(product.brand)}`}
                  className="hover:underline text-gray-600"
                >
                  {product.brand}
                </a>
                <span className="mx-1">/</span>
                <span className="font-medium text-gray-700">{product.title}</span>
              </nav>
              <div
                className={`aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 p-6 relative group ${zoomActive ? 'cursor-none' : 'cursor-zoom-in'}`}
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setZoomPos({ x, y });
                  setZoomActive(true);
                }}
                onMouseLeave={() => setZoomActive(false)}
                onMouseEnter={() => setZoomActive(true)}
              >
                <Image
                  src={images[currentImage] || "/placeholder.svg"}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                />
                {/* Lupa de zoom circular */}
                <ZoomCircle
                  src={images[currentImage] || "/placeholder.svg"}
                  alt={product.title}
                  active={zoomActive}
                  pos={zoomPos}
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`p-2 w-20 h-20 rounded-lg overflow-hidden border-2 ${currentImage === index ? 'border-brand-500' : 'border-gray-200'
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-brand-600 font-medium">
                    <a
                      href={`/productos?banda=${encodeURIComponent(product.brand)}`}
                      className="hover:underline hover:text-brand-700 transition-colors"
                    >
                      {product.brand}
                    </a>
                  </p>
                  {product.product_id && (
                    <p className="text-sm text-gray-500">ID: {product.product_id}</p>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {product.discount && product.compare_at ? (
                      <>
                        <span className="text-2xl font-bold text-brand-600">{formatPriceInPEN(getCurrentPrice())}</span>
                        <span className="text-lg text-gray-500 line-through">{formatPriceInPEN(getOriginalPrice()!)}</span>
                        <span className="bg-brand-500 text-white text-sm py-0.5 px-2 rounded-full">
                          {Math.round(((product.compare_at - product.price) / product.compare_at) * 100)}% DSCTO
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-black">{formatPriceInPEN(getCurrentPrice())}</span>
                    )}
                  </div>
                </div>

                {product.availability ? (
                  <div className="mb-4">
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 pointer-events-none select-none"
                    >
                      En stock
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      4 pagos sin intereses en compras superiores a S/. 165 con
                      <Image src="/bbva.png" alt="BBVA" width={48} height={16} className="inline-block h-4 w-auto align-middle" />
                    </p>
                  </div>
                ) : (
                  <Badge variant="destructive" className="mb-4">
                    Agotado
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Selección de talla */}
              {product.sizes && product.sizes.length > 0 && !(product.sizes.length === 1 && product.sizes[0] === "Única") && (
                <div id="size-selector">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Talla</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-xs text-brand-600 hover:underline">
                          Guía de tallas
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Guía de tallas</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 text-xs text-gray-800">
                          {/* T-shirts/Sweatshirts */}
                          <div>
                            <h4 className="font-semibold mb-2">T-shirts/Sweatshirts (pulgadas)</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Ancho (in)</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Largo (in)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="px-2 py-1">Small</td><td className="px-2 py-1">34-36</td><td className="px-2 py-1">27</td></tr>
                                <tr><td className="px-2 py-1">Medium</td><td className="px-2 py-1">38-40</td><td className="px-2 py-1">28 1/2</td></tr>
                                <tr><td className="px-2 py-1">Large</td><td className="px-2 py-1">42-44</td><td className="px-2 py-1">29 1/2</td></tr>
                                <tr><td className="px-2 py-1">X-Large</td><td className="px-2 py-1">46-48</td><td className="px-2 py-1">31</td></tr>
                                <tr><td className="px-2 py-1">XX-Large</td><td className="px-2 py-1">50-52</td><td className="px-2 py-1">32</td></tr>
                                <tr><td className="px-2 py-1">XXX-Large</td><td className="px-2 py-1">54-56</td><td className="px-2 py-1">33 1/2</td></tr>
                                <tr><td className="px-2 py-1">XXXX-Large</td><td className="px-2 py-1">58-60</td><td className="px-2 py-1">34 1/2</td></tr>
                              </tbody>
                            </table>
                            <div className="text-gray-500 italic text-xs">*Todas las medidas son aproximadas</div>
                          </div>
                          {/* Baseball/Flex Fit Caps */}
                          <div>
                            <h4 className="font-semibold mb-2">Baseball/Flex Fit Caps (pulgadas)</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Medida</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="px-2 py-1">Small/Medium</td><td className="px-2 py-1">6 3/4 - 7 1/4</td></tr>
                                <tr><td className="px-2 py-1">Large/X-Large</td><td className="px-2 py-1">7 1/8 - 7 5/8</td></tr>
                              </tbody>
                            </table>
                            <div className="text-gray-500 italic text-xs">*Todas las medidas son aproximadas</div>
                          </div>
                          {/* Girls Junior Tees */}
                          <div>
                            <h4 className="font-semibold mb-2">Girls Junior Tees</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Nuestra talla</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla Junior</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="px-2 py-1">Small</td><td className="px-2 py-1">3/4</td></tr>
                                <tr><td className="px-2 py-1">Medium</td><td className="px-2 py-1">5/6</td></tr>
                                <tr><td className="px-2 py-1">Large</td><td className="px-2 py-1">7/8</td></tr>
                                <tr><td className="px-2 py-1">X-Large</td><td className="px-2 py-1">9/10</td></tr>
                              </tbody>
                            </table>
                            <div className="text-gray-500 italic text-xs">*Todas las medidas son aproximadas</div>
                          </div>
                          {/* Youth Sizes */}
                          <div>
                            <h4 className="font-semibold mb-2">Youth Sizes</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Nuestra talla</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla Youth</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="px-2 py-1">Small</td><td className="px-2 py-1">6-8</td></tr>
                                <tr><td className="px-2 py-1">Medium</td><td className="px-2 py-1">10-12</td></tr>
                                <tr><td className="px-2 py-1">Large</td><td className="px-2 py-1">14-16</td></tr>
                                <tr><td className="px-2 py-1">X-Large</td><td className="px-2 py-1">18-20</td></tr>
                              </tbody>
                            </table>
                            <div className="text-gray-500 italic text-xs">*Todas las medidas son aproximadas</div>
                          </div>
                          {/* Baby Dolls/Fitted & Raglan Tees/Tanks */}
                          <div>
                            <h4 className="font-semibold mb-2">Baby Dolls/Fitted & Raglan Tees/Tanks (pulgadas)</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Busto</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Cintura</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Largo</th>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">Talla Vestido</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="px-2 py-1">Small</td><td className="px-2 py-1">28</td><td className="px-2 py-1">26</td><td className="px-2 py-1">22 1/8</td><td className="px-2 py-1">0-2</td></tr>
                                <tr><td className="px-2 py-1">Medium</td><td className="px-2 py-1">30</td><td className="px-2 py-1">28</td><td className="px-2 py-1">22 3/4</td><td className="px-2 py-1">4-6</td></tr>
                                <tr><td className="px-2 py-1">Large</td><td className="px-2 py-1">33</td><td className="px-2 py-1">31</td><td className="px-2 py-1">23 3/8</td><td className="px-2 py-1">8-10</td></tr>
                                <tr><td className="px-2 py-1">X-Large</td><td className="px-2 py-1">35</td><td className="px-2 py-1">33</td><td className="px-2 py-1">24</td><td className="px-2 py-1">12</td></tr>
                              </tbody>
                            </table>
                            <div className="text-gray-500 italic text-xs">*Todas las medidas son aproximadas</div>
                          </div>
                          {/* Shoe Size Conversion Chart (Mens 3.5-7.5) */}
                          <div>
                            <h4 className="font-semibold mb-2">Conversión de tallas de calzado (Hombres 3.5-7.5)</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">USA Mens</th>
                                  <th className="border-b border-gray-200 px-2 py-1">4</th>
                                  <th className="border-b border-gray-200 px-2 py-1">4.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">5.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">6</th>
                                  <th className="border-b border-gray-200 px-2 py-1">6.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">7</th>
                                  <th className="border-b border-gray-200 px-2 py-1">7.5</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">USA Womens</td>
                                  <td className="px-2 py-1">5</td><td className="px-2 py-1">5.5</td><td className="px-2 py-1">6</td><td className="px-2 py-1">6.5</td><td className="px-2 py-1">7</td><td className="px-2 py-1">7.5</td><td className="px-2 py-1">8</td><td className="px-2 py-1">8.5</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">Europe</td>
                                  <td className="px-2 py-1">-</td><td className="px-2 py-1">36</td><td className="px-2 py-1">-</td><td className="px-2 py-1">37</td><td className="px-2 py-1">38</td><td className="px-2 py-1">-</td><td className="px-2 py-1">39</td><td className="px-2 py-1">40</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">U.K.</td>
                                  <td className="px-2 py-1">2.5</td><td className="px-2 py-1">3</td><td className="px-2 py-1">3.5</td><td className="px-2 py-1">4</td><td className="px-2 py-1">4.5</td><td className="px-2 py-1">5</td><td className="px-2 py-1">5.5</td><td className="px-2 py-1">6</td><td className="px-2 py-1">6.5</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">Japan</td>
                                  <td className="px-2 py-1">-</td><td className="px-2 py-1">220</td><td className="px-2 py-1">-</td><td className="px-2 py-1">230</td><td className="px-2 py-1">235</td><td className="px-2 py-1">-</td><td className="px-2 py-1">245</td><td className="px-2 py-1">250</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          {/* Shoe Size Conversion Chart (Mens 8-12) */}
                          <div>
                            <h4 className="font-semibold mb-2">Conversión de tallas de calzado (Hombres 8-12)</h4>
                            <table className="min-w-full bg-white border border-gray-200 text-xs mb-2">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border-b border-gray-200 px-2 py-1 text-left">USA Mens</th>
                                  <th className="border-b border-gray-200 px-2 py-1">8</th>
                                  <th className="border-b border-gray-200 px-2 py-1">8.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">9</th>
                                  <th className="border-b border-gray-200 px-2 py-1">9.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">10</th>
                                  <th className="border-b border-gray-200 px-2 py-1">10.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">11</th>
                                  <th className="border-b border-gray-200 px-2 py-1">11.5</th>
                                  <th className="border-b border-gray-200 px-2 py-1">12</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">USA Womens</td>
                                  <td className="px-2 py-1">9.5</td><td className="px-2 py-1">10</td><td className="px-2 py-1">10.5</td><td className="px-2 py-1">11</td><td className="px-2 py-1">11.5</td><td className="px-2 py-1">12</td><td className="px-2 py-1">12.5</td><td className="px-2 py-1">13</td><td className="px-2 py-1">13.5</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">Europe</td>
                                  <td className="px-2 py-1">41</td><td className="px-2 py-1">42</td><td className="px-2 py-1">-</td><td className="px-2 py-1">43</td><td className="px-2 py-1">44</td><td className="px-2 py-1">-</td><td className="px-2 py-1">45</td><td className="px-2 py-1">46</td><td className="px-2 py-1">-</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">U.K.</td>
                                  <td className="px-2 py-1">7</td><td className="px-2 py-1">7.5</td><td className="px-2 py-1">8</td><td className="px-2 py-1">8.5</td><td className="px-2 py-1">9</td><td className="px-2 py-1">9.5</td><td className="px-2 py-1">10</td><td className="px-2 py-1">10.5</td><td className="px-2 py-1">11</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1 font-semibold">Japan</td>
                                  <td className="px-2 py-1">260</td><td className="px-2 py-1">265</td><td className="px-2 py-1">-</td><td className="px-2 py-1">275</td><td className="px-2 py-1">280</td><td className="px-2 py-1">-</td><td className="px-2 py-1">290</td><td className="px-2 py-1">-</td><td className="px-2 py-1">-</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {selectedSize && sizeTouched && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span>Seleccionado: {selectedSize}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size: string) => {
                      const sizeVariant = product.variants?.find(v => v.size === size);
                      const isUnavailable = product.variants?.length > 0 && sizeVariant && !sizeVariant.availability;

                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          className={`border rounded-md py-2 transition-colors relative font-medium ${selectedSize === size
                              ? 'bg-brand-500 text-white border-brand-500 hover:bg-brand-600 hover:border-brand-600'
                              : isUnavailable
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                            }`}
                          disabled={isUnavailable}
                        >
                          {size}
                          {isUnavailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-gray-400 rotate-45 absolute"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cantidad</h3>
                <div className="flex w-32 rounded-lg overflow-hidden border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-white border-r border-gray-300 hover:bg-gray-100 transition-colors focus:z-10"
                    style={{ zIndex: 1 }}
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2 font-medium bg-white select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-white border-l border-gray-300 hover:bg-gray-100 transition-colors focus:z-10"
                    style={{ zIndex: 1 }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Descripción del producto */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                {/* Mensaje de error para talla */}
                {sizeError && (
                  <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 animate-pulse">
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      {sizeError}
                    </p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white"
                  disabled={!product.availability}
                  onClick={() => {
                    if (!product) return;

                    // Verificar si el producto tiene tallas y no se ha seleccionado ninguna
                    if (product.sizes?.length > 0 && !selectedSize) {
                      setSizeError("⚠️ Por favor selecciona una talla antes de añadir al carrito");
                      // Hacer scroll hacia el selector de tallas para que el usuario lo vea
                      document.getElementById('size-selector')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                      return;
                    }

                    // Verificar si la talla seleccionada no tiene stock (solo si hay variantes)
                    if (selectedSize && product.variants?.length > 0) {
                      const variant = product.variants.find(v => v.size === selectedSize);
                      if (variant && !variant.availability) {
                        setSizeError("❌ Esta talla no está disponible en este momento. Por favor selecciona otra talla.");
                        return;
                      }
                    }

                    // Caso 1: Producto con variantes y talla seleccionada
                    if (selectedSize && product.variants?.length > 0) {
                      const variant = selectedVariant || (product.variants.find(v => v.size === selectedSize) ?? null);
                      if (variant && variant.availability) {
                        addToCart({
                          id: product.id,
                          title: product.title,
                          brand: product.brand,
                          image: images[0] || "/placeholder.svg",
                          price: convertToPEN(variant.price), // Convertir de USD a PEN
                          size: selectedSize,
                          quantity
                        });
                        toast({
                          title: "Producto añadido al carrito",
                          description: `${product.title} (${selectedSize}) x${quantity}`,
                          variant: "default"
                        });
                        return;
                      }
                    }

                    // Caso 2: Producto con tallas pero sin variantes o variante no disponible
                    if (selectedSize && product.sizes?.length > 0) {
                      addToCart({
                        id: product.id,
                        title: product.title,
                        brand: product.brand,
                        image: images[0] || "/placeholder.svg",
                        price: convertToPEN(product.price), // Convertir de USD a PEN
                        size: selectedSize,
                        quantity
                      });
                      toast({
                        title: "Producto añadido al carrito",
                        description: `${product.title} (${selectedSize}) x${quantity}`,
                        variant: "default"
                      });
                      return;
                    }

                    // Caso 3: Producto sin tallas (como posters, vinilos, etc.)
                    addToCart({
                      id: product.id,
                      title: product.title,
                      brand: product.brand,
                      image: images[0] || "/placeholder.svg",
                      price: convertToPEN(product.price), // Convertir de USD a PEN
                      size: "Única", // Para productos sin talla
                      quantity
                    });
                    toast({
                      title: "Producto añadido al carrito",
                      description: `${product.title} x${quantity}`,
                      variant: "default"
                    });
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Añadir al carrito
                </Button>
                <div className="flex gap-3">
                  <a
                    href={`https://rockabilia.com/products/${params?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[2]"
                    tabIndex={-1}
                  >
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-black text-white flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg hover:bg-gray-900 transition-transform transition-shadow duration-200"
                    >
                      Comprar en
                      <Image src="/rockabilia.avif" alt="Rockabilia" width={70} height={24} className="h-6 w-auto object-contain" />
                    </Button>
                  </a>
                  <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        Compartir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Compartir producto</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded overflow-hidden border">
                            <img
                              src={images[0] || "/placeholder.svg"}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 mt-2">
                          <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
                            <input
                              ref={inputRef}
                              className="flex-1 bg-transparent outline-none text-sm"
                              value={typeof window !== "undefined" ? window.location.href : ""}
                              readOnly
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (inputRef.current) {
                                  navigator.clipboard.writeText(inputRef.current.value);
                                  toast({
                                    title: "Enlace copiado",
                                    description: "El enlace ha sido copiado al portapapeles",
                                    variant: "default",
                                  });
                                  setShareOpen(false);
                                }
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <a
                        key={tag}
                        href={`/productos?tag=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Más productos de la misma banda */}
      {!isLoading && product && (
        <MasProductosDeBanda brand={product.brand} excludeId={product.id} />
      )}
    </>
  )
}

// Componente para mostrar más productos de la misma banda
function MasProductosDeBanda({ brand, excludeId }: { brand: string, excludeId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Utilidad para convertir el nombre de la banda a slug (igual que Findify)
  function toSlug(str: string) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const bandSlug = toSlug(brand)
  // Endpoint smart-collection de Findify para la banda
  const API_SMART_COLLECTION = `https://api-v3.findify.io/v3/smart-collection/collections/${bandSlug}?user%5Buid%5D=2BFa9WflrlWkujYL&user%5Bsid%5D=Qe4lb3rBazBvmjwo&user%5Bpersist%5D=true&user%5Bexist%5D=true&t_client=1751442362499&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f&limit=100&slot=collections%2F${bandSlug}`

  useEffect(() => {
    setIsLoading(true);
    fetch(API_SMART_COLLECTION)
      .then((res) => res.json())
      .then((json) => {
        // mapProduct debe estar importado
        const mapped = json.items.map((item: any) => mapProduct(item));
        // Excluir el producto actual
        const filtered = mapped.filter((p: any) => p.id !== excludeId);
        // Seleccionar hasta 10 aleatorios
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 10));
      })
      .finally(() => setIsLoading(false));
  }, [brand, excludeId]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-medium font-aton uppercase">
              Más productos de {brand}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse p-4 flex items-center justify-center"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2 w-2/3"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded mt-4"></div>
                  <div className="h-8 bg-gray-200 animate-pulse rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-medium font-aton uppercase">
              Más productos de {brand}
            </h2>
            <p className="text-gray-500">No hay más productos de esta banda por ahora.</p>
          </div>
        </div>
      </section>
    );
  }

  // Dividir productos en dos filas de 5
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);

  return (
    <section className="py-16 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-medium font-aton uppercase">
            Más productos de {brand}
          </h2>
        </div>
        <div className="space-y-8">
          {firstRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {firstRow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {secondRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {secondRow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link href={`/productos?banda=${encodeURIComponent(brand)}`}>
            <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8">
              Ver todos los productos de {brand}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Componente de lupa circular para zoom

function ZoomCircle({ src, alt, active, pos }: { src: string; alt: string; active: boolean; pos: { x: number; y: number } }) {
  const CIRCLE_SIZE = 180;
  const ZOOM = 2.2;
  const PADDING = 24; // p-6 = 24px
  const containerSize = 600; // tamaño del contenedor de la imagen
  const imageArea = containerSize - 2 * PADDING;

  // Solo mostrar la lupa si el mouse está sobre el área de la imagen (no el padding)
  const isOverImage =
    pos.x >= PADDING &&
    pos.x <= containerSize - PADDING &&
    pos.y >= PADDING &&
    pos.y <= containerSize - PADDING;

  if (!active || !isOverImage) return null;

  // Posición relativa dentro del área de la imagen
  const relX = pos.x - PADDING;
  const relY = pos.y - PADDING;

  // Ajustes manuales (puedes cambiar estos valores)
  const AJUSTE_X = 80; // valores positivos mueven el zoom a la derecha, negativos a la izquierda
  const AJUSTE_Y = 0; // valores positivos mueven el zoom hacia abajo, negativos hacia arriba

  // El centro del círculo debe coincidir con el punto bajo el mouse
  // Por eso, el backgroundPosition debe desplazar el área de zoom para que el centro del círculo muestre el punto exacto
  const bgX = -(relX * ZOOM - CIRCLE_SIZE / 2) + AJUSTE_X;
  const bgY = -(relY * ZOOM - CIRCLE_SIZE / 2) + AJUSTE_Y;

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        left: pos.x - CIRCLE_SIZE / 2,
        top: pos.y - CIRCLE_SIZE / 2,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: '50%',
        // Sombra más notoria, sin borde blanco
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35), 0 0 0 2px rgba(0,0,0,0.10)',
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${imageArea * ZOOM}px ${imageArea * ZOOM}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        zIndex: 10,
        // Transiciones suaves para movimiento y zoom
        transition: 'left 0.13s cubic-bezier(.4,1,.7,1), top 0.13s cubic-bezier(.4,1,.7,1), background-position 0.13s cubic-bezier(.4,1,.7,1), opacity 0.15s',
        willChange: 'left, top, background-position',
        opacity: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
