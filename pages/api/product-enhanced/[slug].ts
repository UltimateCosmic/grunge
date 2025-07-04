import type { NextApiRequest, NextApiResponse } from 'next'

// Función para extraer el ID del producto desde la URL de Rockabilia
function extractProductId(url: string): string | null {
  const match = url.match(/\/products\/([^?]+)/)
  return match ? match[1] : null
}

// Función para obtener detalles del producto específico desde la página de Rockabilia
async function getProductFromRockabiliaPage(slug: string) {
  try {
    const productUrl = `https://rockabilia.com/products/${slug}`
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    const html = await response.text()

    // Extraer el JSON del producto desde múltiples posibles ubicaciones
    let productData = null
    
    // Método 1: Buscar en window.product o similar
    const productJsonPatterns = [
      /product:\s*({[^}]+(?:{[^}]*}[^}]*)*})/,
      /window\.product\s*=\s*({[^}]+(?:{[^}]*}[^}]*)*})/,
      /"product":\s*({[^}]+(?:{[^}]*}[^}]*)*})/
    ]
    
    for (const pattern of productJsonPatterns) {
      const match = html.match(pattern)
      if (match) {
        try {
          productData = JSON.parse(match[1])
          break
        } catch (e) {
          continue
        }
      }
    }

    // Extraer información usando regex patterns más específicos
    const titleMatch = html.match(/<h1[^>]*class="[^"]*(?:product[^"]*title|title[^"]*product)[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<h1[^>]*>([^<]*(?:T-shirt|T-Shirt|shirt|Hoodie|Vinyl|Album)[^<]*)<\/h1>/i) ||
                      html.match(/<title>([^|<]+)/i)
    
    const brandMatch = html.match(/<span[^>]*class="[^"]*vendor[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                      html.match(/["']vendor["']\s*:\s*["']([^"']+)["']/i) ||
                      html.match(/brand['"]\s*:\s*['"]([^'"]+)['"]/i)
    
    const priceMatch = html.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>\$?([0-9.,]+)<\/span>/i) ||
                      html.match(/["']price["']\s*:\s*(\d+)/i) ||
                      html.match(/\$([0-9.,]+)/g)?.slice(-1)?.[0]?.match(/([0-9.,]+)/)
    
    // Buscar Product ID de múltiples formas
    const productIdMatch = html.match(/Product\s*ID:\s*([^<\s]+)/i) ||
                          html.match(/product['"]\s*:\s*['"]\s*(\d+)['"]/i) ||
                          html.match(/id['"]\s*:\s*['"]\s*(\d+)['"]/i) ||
                          html.match(/sku['"]\s*:\s*['"]([^'"]+)['"]/i)

    // Extraer imágenes con mejor calidad
    const imagePatterns = [
      /["']https:\/\/cdn\.shopify\.com\/s\/files\/1\/0090\/2447\/1140\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*["']/gi,
      /image_url["']\s*:\s*["']([^"']+)["']/gi,
      /src\s*=\s*["']([^"']*cdn\.shopify\.com[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi
    ]

    let images = []
    for (const pattern of imagePatterns) {
      const matches = Array.from(html.matchAll(pattern))
      images.push(...matches.map(match => {
        let url = match[1] || match[0].replace(/['"]/g, '')
        if (url.startsWith('//')) url = 'https:' + url
        if (!url.startsWith('http') && url.includes('cdn.shopify.com')) {
          url = 'https://' + url
        }
        
        // Convertir a la versión HD
        url = url.replace(/_small\.|_compact\.|_medium\.|_large\./, '_2048x2048.')
        url = url.replace(/\?v=\d+/, '')
        
        return url
      }))
    }

    // Remover duplicados y filtrar imágenes válidas
    images = Array.from(new Set(images))
      .filter(url => url.includes('cdn.shopify.com') && /\.(jpg|jpeg|png|webp)/.test(url))
      .slice(0, 8)

    // Extraer tallas y variantes
    const sizesMatch = html.match(/sizes?\s*[:=]\s*\[([^\]]+)\]/i)
    let sizes = []
    if (sizesMatch) {
      sizes = sizesMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
    } else {
      // Buscar tallas en opciones del producto
      const sizeOptions = html.matchAll(/<option[^>]*value\s*=\s*["']([^"']*(?:SM|MD|LG|XL|2X|3X|4X|5X|6X)[^"']*)["'][^>]*>([^<]*)<\/option>/gi)
      sizes = Array.from(sizeOptions).map(match => match[2].trim()).filter(Boolean)
    }

    // Extraer descripción
    const descriptionMatch = html.match(/<div[^>]*class="[^"]*(?:product[^"]*description|description[^"]*product)[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                            html.match(/description["']\s*:\s*["']([^"']+)["']/i)

    // Determinar disponibilidad
    const inStockMatch = html.match(/in\s*stock/i) || html.match(/available/i)
    const outOfStockMatch = html.match(/out\s*of\s*stock/i) || html.match(/sold\s*out/i)
    const availability = outOfStockMatch ? false : (inStockMatch ? true : true)

    return {
      id: productData?.id || productIdMatch?.[1] || slug,
      title: titleMatch?.[1]?.trim() || productData?.title || 'Producto',
      brand: brandMatch?.[1]?.trim() || productData?.vendor || '',
      price: priceMatch ? parseFloat(priceMatch[1]?.replace(',', '')) : (productData?.price ? productData.price / 100 : 0),
      images: images.length > 0 ? images : ['/placeholder.svg'],
      description: descriptionMatch?.[1]?.trim() || productData?.description || '',
      sizes: sizes,
      variants: productData?.variants || [],
      product_url: productUrl,
      availability: availability,
      quantity: productData?.inventory_quantity || 1,
      product_id: productIdMatch?.[1] || productData?.id,
      sku: productData?.sku,
      tags: productData?.tags || []
    }
  } catch (error) {
    console.error('Error scraping Rockabilia page:', error)
    return null
  }
}

// Función para obtener detalles usando la API de Findify mejorada
async function getProductFromFindify(slug: string) {
  try {
    // Extraer términos de búsqueda del slug
    const searchTerms = slug.replace(/-/g, ' ').split(' ').slice(0, 4).join(' ')
    
    const findifyUrl = `https://api-v3.findify.io/v3/search?` +
      `user%5Buid%5D=guest&user%5Bsid%5D=temp&user%5Bpersist%5D=true&` +
      `key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f&` +
      `q=${encodeURIComponent(searchTerms)}&` +
      `limit=20&t_client=${Date.now()}&callback=__findify_search`

    const response = await fetch(findifyUrl)
    const text = await response.text()
    
    const jsonMatch = text.match(/__findify_search\((.+)\)/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1])
      const items = data.items || []
      
      // Buscar el producto específico por slug exacto
      const specificProduct = items.find((item: any) => 
        item.product_url && item.product_url.includes(slug)
      )
      
      if (specificProduct) {
        // Transformar a nuestro formato
        return {
          id: specificProduct.id,
          title: specificProduct.title,
          brand: specificProduct.brand,
          price: Array.isArray(specificProduct.price) ? Math.min(...specificProduct.price) : specificProduct.price,
          images: [
            specificProduct.image_url,
            specificProduct.image_2_url,
            specificProduct.image_3_url,
            specificProduct.image_4_url
          ].filter(Boolean).map(url => 
            url?.replace(/_large\.|_medium\./, '_2048x2048.') || url
          ),
          description: specificProduct.description || '',
          sizes: specificProduct.size || [],
          variants: specificProduct.variants || [],
          product_url: `https://rockabilia.com${specificProduct.product_url}`,
          availability: specificProduct.availability,
          quantity: specificProduct.quantity,
          product_id: specificProduct.id,
          sku: specificProduct.sku,
          tags: specificProduct.tags || [],
          compare_at: specificProduct.compare_at,
          discount: specificProduct.discount
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching from Findify API:', error)
    return null
  }
}

// Función para buscar productos por término de búsqueda
async function searchProducts(searchTerm: string) {
  try {
    const searchUrl = `https://rockabilia.com/search?type=product&q=${encodeURIComponent(searchTerm)}&view=json`
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    return data.results || []
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Product slug is required' })
  }

  try {
    let product = null

    // Método 1: Obtener desde Findify (más rápido y estructurado)
    product = await getProductFromFindify(slug)
    
    // Método 2: Si no encontramos en Findify, hacer scraping directo
    if (!product) {
      product = await getProductFromRockabiliaPage(slug)
    }

    // Método 3: Como último recurso, buscar por términos
    if (!product) {
      const searchTerms = slug.replace(/-/g, ' ').split(' ').slice(0, 3).join(' ')
      const searchResults = await searchProducts(searchTerms)
      
      if (searchResults.length > 0) {
        const result = searchResults.find((item: any) => 
          item.url.includes(slug)
        ) || searchResults[0]
        
        product = {
          id: result.url,
          title: result.title,
          brand: '',
          price: 0,
          images: [result.thumbnail?.startsWith('//') ? 'https:' + result.thumbnail : result.thumbnail],
          description: '',
          sizes: [],
          variants: [],
          product_url: result.url.startsWith('http') ? result.url : `https://rockabilia.com${result.url}`,
          availability: true,
          quantity: 1,
          product_id: result.url,
          sku: '',
          tags: []
        }
      }
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Asegurar estructura consistente
    const formattedProduct = {
      id: product.id || slug,
      title: product.title || 'Producto sin título',
      brand: product.brand || '',
      price: product.price || 0,
      images: Array.isArray(product.images) ? product.images.filter(Boolean) : [product.images || '/placeholder.svg'],
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      product_url: product.product_url || `https://rockabilia.com/products/${slug}`,
      availability: product.availability !== false,
      quantity: product.quantity || 1,
      product_id: product.product_id || product.id || slug,
      sku: product.sku || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      compare_at: (product as any).compare_at,
      discount: (product as any).discount
    }

    res.status(200).json({ product: formattedProduct })
  } catch (error) {
    console.error('Error fetching product details:', error)
    res.status(500).json({ error: 'Error fetching product details' })
  }
}
