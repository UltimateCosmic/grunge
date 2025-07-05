import type { NextApiRequest, NextApiResponse } from 'next'
import { mapProduct } from '@/lib/map-product'

// Función para generar slug desde la URL del producto (igual que en product-card)
const generateSlug = (url: string): string => {
  if (!url) return 'producto-no-disponible'
  
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const match = path.match(/\/products\/([^?]+)/)
    return match ? match[1] : 'producto-no-disponible'
  } catch {
    const match = url.match(/\/products\/([^?]+)/)
    return match ? match[1] : 'producto-no-disponible'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query
  
  if (!query || typeof query !== 'string' || query.length < 2) {
    return res.status(200).json({ results: [] })
  }

  try {
    // Usar la API de Findify sin JSONP
    const apiUrl = `https://api-v3.findify.io/v3/autocomplete?user%5Buid%5D=2BFa9WflrlWkujYL&user%5Bsid%5D=wgpjnxTzly1iLhP2&user%5Bpersist%5D=false&user%5Bexist%5D=true&t_client=${Date.now()}&key=5e2c787d-30dd-43c6-9eed-9db5a4998c6f&item_limit=10&suggestion_limit=10&q=${encodeURIComponent(query)}`
    
    const response = await fetch(apiUrl)
    const text = await response.text()
    
    // La API retorna JSONP, necesitamos extraer el JSON
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No se encontró JSON válido en la respuesta')
    }
    
    const jsonData = text.substring(firstBrace, lastBrace + 1)
    const data = JSON.parse(jsonData)
    
    // Mapear los items de la API a nuestro formato usando la utilidad existente
    const results = (data.items || []).map((item: any) => {
      // Usar la función mapProduct existente para mayor consistencia
      const mappedProduct = mapProduct(item)
      
      // Generar el slug para la URL interna
      const productSlug = generateSlug(item.product_url || '')
      
      return {
        id: mappedProduct.id,
        name: mappedProduct.name,
        band: mappedProduct.band,
        image: item.thumbnail_url || '/placeholder.jpg', // Usar thumbnail_url de la API autocomplete
        url: `/producto/${productSlug}`, // URL interna del sistema
        price: mappedProduct.price
      }
    }).filter((item: any) => item.name && item.url !== '/producto/producto-no-disponible') // Filtrar items válidos
    
    res.status(200).json({ results })
  } catch (error) {
    console.error('Error fetching search results:', error)
    res.status(500).json({ results: [], error: 'Error buscando productos' })
  }
}
