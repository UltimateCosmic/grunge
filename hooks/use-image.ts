import { useState, useEffect } from 'react'

interface UseImageProps {
  src: string
  fallback?: string
}

export function useImage({ src, fallback = "/placeholder.svg" }: UseImageProps) {
  const [imageState, setImageState] = useState({
    src: src,
    loading: true,
    error: false,
    usingProxy: false,
  })

  useEffect(() => {
    if (!src) {
      setImageState({
        src: fallback,
        loading: false,
        error: true,
        usingProxy: false,
      })
      return
    }

    setImageState(prev => ({
      ...prev,
      src: src,
      loading: true,
      error: false,
      usingProxy: false,
    }))
  }, [src, fallback])

  const handleError = () => {
    console.log('Error loading image:', imageState.src)
    
    // Si no estamos usando el proxy y la imagen falló, intentar con proxy
    if (!imageState.usingProxy && src && src.startsWith('http')) {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`
      console.log('Retrying with proxy:', proxyUrl)
      
      setImageState({
        src: proxyUrl,
        loading: true,
        error: false,
        usingProxy: true,
      })
    } else {
      // Si ya estamos usando proxy o no es una URL externa, usar fallback
      setImageState({
        src: fallback,
        loading: false,
        error: true,
        usingProxy: false,
      })
    }
  }

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageState.src)
    setImageState(prev => ({
      ...prev,
      loading: false,
      error: false,
    }))
  }

  return {
    src: imageState.src,
    loading: imageState.loading,
    error: imageState.error,
    usingProxy: imageState.usingProxy,
    onError: handleError,
    onLoad: handleLoad,
  }
}
