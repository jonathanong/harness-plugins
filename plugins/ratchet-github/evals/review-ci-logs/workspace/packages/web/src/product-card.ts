import type { Product } from './generated/types.js'

export function productCard(product: Product): string {
  return `${product.title} — ${(product.priceCents / 100).toFixed(2)}`
}
