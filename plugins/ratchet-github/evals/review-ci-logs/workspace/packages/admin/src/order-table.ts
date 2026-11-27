import type { Order } from './generated/types.js'

export function orderRow(order: Order): string[] {
  return [order.id, String(order.lines.length)]
}
