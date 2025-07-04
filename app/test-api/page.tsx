// Test de la API mejorada
// Probar en: http://localhost:3001/test-api

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestAPI() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testProducts = [
    "eminem-slim-shady-lp-actual-tour-overrun-rare-find-t-shirt-374890",
    "rolling-stones-keith-t-shirt-441788",
    "halloween-stayin-alive-t-shirt-424445"
  ]

  const testAPI = async (slug: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/product-enhanced/${slug}`)
      const data = await response.json()
      setResult({ slug, data })
    } catch (error: any) {
      setResult({ slug, error: error?.message || 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test API Enhanced</h1>
      
      <div className="space-y-4 mb-8">
        {testProducts.map(slug => (
          <Button 
            key={slug} 
            onClick={() => testAPI(slug)}
            disabled={loading}
            className="block"
          >
            Test: {slug}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="text-center">Loading...</div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Resultado para: {result.slug}</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
