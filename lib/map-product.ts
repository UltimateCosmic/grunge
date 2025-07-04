// Utilidad para mapear productos de la API Findify al formato de ProductCard

export interface MappedProduct {
  id: string | number;
  name: string;
  band: string;
  type?: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  rating?: number;
  reviews?: number;
  isOnSale?: boolean;
  sizes?: string[];
  url?: string;
}

const USD_TO_PEN_RATE = 3.55;

export function convertToPEN(usdPrice: number): number {
  return Number((usdPrice * USD_TO_PEN_RATE).toFixed(2));
}

export function mapProduct(item: any): MappedProduct {
  const usdPrice = Array.isArray(item.price) ? item.price[0] : (typeof item.price === "number" ? item.price : 0);
  const usdOriginalPrice = item.compare_at || null;

  return {
    id: item.id,
    name: item.title,
    band: item.brand,
    type: typeof item.custom_fields?.apparel === "string" ? item.custom_fields.apparel : Array.isArray(item.custom_fields?.apparel) ? item.custom_fields.apparel[0] : "",
    price: convertToPEN(usdPrice),
    originalPrice: usdOriginalPrice ? convertToPEN(usdOriginalPrice) : null,
    image: item.image_url || "/placeholder.svg?height=300&width=300",
    rating: typeof item.rating === "number" ? item.rating : 0,
    reviews: typeof item.reviews === "number" ? item.reviews : 0,
    isOnSale: Array.isArray(item.discount) && item.discount.length > 0,
    sizes: Array.isArray(item.size) ? item.size : typeof item.size === "string" ? [item.size] : Array.isArray(item.custom_fields?.variant_title) ? item.custom_fields.variant_title : typeof item.custom_fields?.variant_title === "string" ? [item.custom_fields.variant_title] : [],
    url: item.product_url ? `https://www.bandmerch.com${item.product_url}` : undefined,
  };
}
