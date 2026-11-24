import type { Order, Product } from './generated/types.js'
import { loadOrder, loadProduct } from './store.js'

export const resolvers = {
  Query: {
    product: (_: unknown, args: { id: string }): Promise<Product | null> => loadProduct(args.id),
    order: (_: unknown, args: { id: string }): Promise<Order | null> => loadOrder(args.id),
  },
}
