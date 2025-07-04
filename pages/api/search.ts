import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query
  if (!query || typeof query !== 'string' || query.length < 2) {
    return res.status(200).json({ results: [] })
  }
  try {
    const url = `https://rockabilia.com/search?type=product&q=${encodeURIComponent(query)}&view=json`
    const response = await fetch(url)
    const data = await response.json()
    const results = (data.results || [])
      .slice(0, 10)
      .map((item: any) => ({
        id: item.url, // No hay id, usar url como identificador único
        name: item.title,
        band: '', // No hay banda en la respuesta
        image: item.thumbnail.startsWith('//') ? 'https:' + item.thumbnail : item.thumbnail,
        url: item.url.startsWith('http') ? item.url : `https://rockabilia.com${item.url}`,
      }))
    res.status(200).json({ results })
  } catch (error) {
    res.status(500).json({ results: [], error: 'Error buscando productos' })
  }
}
