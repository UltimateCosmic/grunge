import type { NextApiRequest, NextApiResponse } from 'next'

// Función para extraer el ID del producto desde la URL de Rockabilia
function extractProductId(url: string): string | null {
  // Ejemplo: /products/eminem-slim-shady-lp-actual-tour-overrun-rare-find-t-shirt-374890
  const match = url.match(/\/products\/([^?]+)/)
  return match ? match[1] : null
}

// Función para obtener detalles del producto específico desde la página de Rockabilia
async function getProductFromRockabiliaPage(slug: string) {
  try {
    const productUrl = `https://rockabilia.com/products/${slug}`
    const response = await fetch(productUrl)
    const html = await response.text()

    // Extraer el JSON del producto desde el script tag
    const productJsonMatch = html.match(/product:\s*({[^}]+(?:{[^}]*}[^}]*)*})/)
    let productData = null
    
    if (productJsonMatch) {
      try {
        productData = JSON.parse(productJsonMatch[1])
      } catch (e) {
        console.log('Error parsing product JSON:', e)
      }
    }

    // Extraer información adicional usando regex
    const titleMatch = html.match(/<h1[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<title>([^|<]+)/i)
    
    const brandMatch = html.match(/<span[^>]*class="[^"]*vendor[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                      html.match(/brand['"]\s*:\s*['"]([^'"]+)['"]/i)
    
    const priceMatch = html.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>\$?([0-9.,]+)<\/span>/i) ||
                      html.match(/price['"]\s*:\s*['"]?\$?([0-9.,]+)['"]?/i)
    
    const productIdMatch = html.match(/product\s*id['"]\s*:\s*['"]?([^'",\s]+)['"]?/i) ||
                          html.match(/sku['"]\s*:\s*['"]([^'"]+)['"]/i)

    // Extraer imágenes - buscar múltiples patrones
    const imageMatches = [
      ...html.matchAll(/["']https:\/\/cdn\.shopify\.com\/s\/files\/[^"']+(?:_large|_medium|_grande|_original)\.(?:jpg|jpeg|png|webp)[^"']*["']/gi),
      ...html.matchAll(/image_url["']\s*:\s*["']([^"']+)["']/gi),
      ...html.matchAll(/product_images\[[\d]+\]\s*=\s*["']([^"']+)["']/gi)
    ]

    const images = Array.from(new Set(
      imageMatches.map(match => {
        let url = match[1] || match[0].replace(/['"]/g, '')
        // Asegurar que sea una URL completa y convertir a HD
        if (url.startsWith('//')) url = 'https:' + url
        if (!url.startsWith('http')) url = 'https://cdn.shopify.com' + url
        
        // Convertir a la versión de mayor resolución
        url = url.replace(/_small\.|_compact\.|_medium\.|_large\./, '_original.')
        url = url.replace(/\?v=\d+/, '') // Remover versioning para obtener la imagen original
        
        return url
      })
    )).slice(0, 6) // Límite de 6 imágenes

    // Extraer variantes de tallas y precios
    const variantMatches = html.matchAll(/option_value_(\d+)['"]\s*:\s*['"]\s*([^'"]+)\s*['"]/gi)
    const variants = []
    
    for (const match of variantMatches) {
      const variantId = match[1]
      const variantData = match[2]
      
      // Buscar precio específico de esta variante
      const variantPriceMatch = html.match(new RegExp(`variant_${variantId}[^}]*price['"]\s*:\s*['"]?\\$?([0-9.,]+)`, 'i'))
      const variantPrice = variantPriceMatch ? parseFloat(variantPriceMatch[1]) : null
      
      variants.push({
        id: variantId,
        title: variantData,
        price: variantPrice,
        available: true
      })
    }

    // Extraer descripción
    const descriptionMatch = html.match(/<div[^>]*class="[^"]*product[^"]*description[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                            html.match(/description['"]\s*:\s*['"]([^'"]+)['"]/i)

    return {
      id: productData?.id || productIdMatch?.[1] || slug,
      title: titleMatch?.[1]?.trim() || productData?.title || 'Producto',
      brand: brandMatch?.[1]?.trim() || productData?.vendor || '',
      price: priceMatch ? parseFloat(priceMatch[1]) : (productData?.price ? productData.price / 100 : 0),
      images: images.length > 0 ? images : ['/placeholder.svg'],
      description: descriptionMatch?.[1]?.trim() || productData?.description || '',
      variants: variants,
      product_url: productUrl,
      available: true
    }
  } catch (error) {
    console.error('Error scraping Rockabilia page:', error)
    return null
  }
}

// Función para hacer el scraping de la página del producto
async function scrapeProductPage(productUrl: string) {
  try {
    const response = await fetch(`https://rockabilia.com${productUrl}`)
    const html = await response.text()
    
    // Extraer datos JSON del script tag que contiene la información del producto
    const scriptRegex = /<script[^>]*>\s*window\.productData\s*=\s*({[^}]+})/
    const match = html.match(scriptRegex)
    
    if (match) {
      return JSON.parse(match[1])
    }
    
    // Método alternativo: buscar en el HTML por patrones específicos
    const titleMatch = html.match(/<h1[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)<\/h1>/i)
    const priceMatch = html.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>\$([0-9.]+)<\/span>/i)
    
    return {
      title: titleMatch ? titleMatch[1].trim() : null,
      price: priceMatch ? parseFloat(priceMatch[1]) : null
    }
  } catch (error) {
    console.error('Error scraping product page:', error)
    return null
  }
}

// Función para obtener detalles usando la API de recomendaciones de Findify
async function getProductFromFindify(productId: string) {
  try {
    // Usar la API de Findify para obtener productos relacionados/similares
    const findifyUrl = `https://api-v3.findify.io/v3/recommend/product-findify-rec-3?` +
      `user%5Buid%5D=guest&user%5Bsid%5D=temp&user%5Bpersist%5D=true&user%5Bexist%5D=false&` +
      `t_client=${Date.now()}&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f&` +
      `limit=20&slot=product-findify-rec-3&type=viewed&` +
      `item_ids%5B0%5D=${productId}&callback=__findify`

    const response = await fetch(findifyUrl)
    const text = await response.text()
    
    // Extraer JSON de la respuesta JSONP
    const jsonMatch = text.match(/__findify\((.+)\)/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1])
      return data.items || []
    }
    
    return []
  } catch (error) {
    console.error('Error fetching from Findify API:', error)
    return []
  }
}

// Función para buscar productos por término de búsqueda en la API de búsqueda
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

    // Método 1: Intentar extraer ID del producto desde el slug
    const productId = extractProductId(`/products/${slug}`)
    
    if (productId) {
      // Método 2: Buscar usando la API de Findify con el ID
      const findifyResults = await getProductFromFindify(productId)
      
      if (findifyResults.length > 0) {
        // Buscar el producto exacto en los resultados
        product = findifyResults.find((item: any) => 
          item.product_url.includes(slug) || 
          item.id.toString() === productId
        ) || findifyResults[0]
      }
    }

    // Método 3: Si no encontramos el producto, intentar búsqueda por términos del slug
    if (!product) {
      const searchTerms = slug.replace(/-/g, ' ').split(' ').slice(0, 3).join(' ')
      const searchResults = await searchProducts(searchTerms)
      
      if (searchResults.length > 0) {
        // Buscar el resultado más relevante
        product = searchResults.find((item: any) => 
          item.url.includes(slug)
        ) || searchResults[0]
        
        // Transformar resultado de búsqueda al formato esperado
        if (product && !product.variants) {
          product = {
            id: product.url,
            title: product.title,
            brand: '', // No disponible en resultados de búsqueda
            price: [0], // No disponible en resultados de búsqueda
            image_url: product.thumbnail.startsWith('//') ? 'https:' + product.thumbnail : product.thumbnail,
            availability: true,
            quantity: 1,
            size: [],
            variants: [],
            tags: [],
            product_url: product.url.startsWith('http') ? product.url : `https://rockabilia.com${product.url}`
          }
        }
      }
    }

    // Método 4: Como último recurso, hacer scraping de la página del producto
    if (!product) {
      const scrapedData = await scrapeProductPage(`/products/${slug}`)
      if (scrapedData) {
        product = {
          id: slug,
          title: scrapedData.title || 'Producto',
          brand: '',
          price: scrapedData.price ? [scrapedData.price] : [0],
          image_url: '/placeholder.svg',
          availability: true,
          quantity: 1,
          size: [],
          variants: [],
          tags: [],
          product_url: `https://rockabilia.com/products/${slug}`
        }
      }
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Asegurar que el producto tenga la estructura correcta
    const formattedProduct = {
      id: product.id || slug,
      title: product.title || 'Producto sin título',
      brand: product.brand || '',
      price: Array.isArray(product.price) ? product.price : [product.price || 0],
      image_url: product.image_url || '/placeholder.svg',
      image_2_url: product.image_2_url,
      availability: product.availability !== false,
      quantity: product.quantity || 1,
      size: Array.isArray(product.size) ? product.size : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      compare_at: product.compare_at,
      discount: product.discount,
      product_url: product.product_url || `https://rockabilia.com/products/${slug}`
    }

    res.status(200).json({ product: formattedProduct })
  } catch (error) {
    console.error('Error fetching product details:', error)
    res.status(500).json({ error: 'Error fetching product details' })
  }
}
