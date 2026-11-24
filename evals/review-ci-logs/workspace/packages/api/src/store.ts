import type { Order, Product } from './generated/types.js'

const products = new Map<string, Product>()
const orders = new Map<string, Order>()

export async function loadProduct(id: string): Promise<Product | null> {
  return products.get(id) ?? null
}

export async function loadOrder(id: string): Promise<Order | null> {
  return orders.get(id) ?? null
}
