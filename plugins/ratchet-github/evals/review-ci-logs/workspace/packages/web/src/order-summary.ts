import type { Order } from './generated/types.js'

export function orderTotalCents(order: Order): number {
  return order.lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0)
}
