import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl) {
    return new NextResponse('URL requerida', { status: 400 })
  }
  
  // Validar que sea una URL válida
  try {
    new URL(imageUrl)
  } catch {
    return new NextResponse('URL inválida', { status: 400 })
  }
  
  try {
    console.log('Fetching image from proxy:', imageUrl)
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      console.error('Error fetching image:', response.status, response.statusText)
      return new NextResponse('Error fetching image', { status: response.status })
    }
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'image/jpeg'
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache por 24 horas
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error in image proxy:', error)
    return new NextResponse('Error fetching image', { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
