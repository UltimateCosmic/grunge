import Image from "next/image"

interface OptimizedLogoProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  priority?: boolean
}

export default function OptimizedLogo({ 
  src, 
  alt, 
  width = 400, 
  height = 160, 
  className = "",
  style,
  priority = false 
}: OptimizedLogoProps) {
  // Detectar si es SVG para desoptimizar
  const isSvg = src.toLowerCase().includes('.svg')
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      quality={isSvg ? undefined : 100}
      priority={priority}
      unoptimized={isSvg} // Desoptimizar solo SVGs
      sizes={`(max-width: 768px) ${width}px, ${width * 1.5}px`}
    />
  )
}
