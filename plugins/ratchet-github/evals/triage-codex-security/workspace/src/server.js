import { createServer } from 'node:http'
import { findOrder } from './db.js'
import { renderOrder } from './render.js'

// Synthetic eval fixture. Not a real service.
export const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname === '/health') {
    response.end('ok')
    return
  }
  const order = await findOrder(url.searchParams.get('id'))
  response.setHeader('content-type', 'text/html')
  response.end(renderOrder(order, url.searchParams.get('note')))
})
