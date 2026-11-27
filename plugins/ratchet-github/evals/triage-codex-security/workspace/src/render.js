// Synthetic eval fixture. Not a real service.
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)
}

export function renderOrder(order, note) {
  return `<h1>Order ${escapeHtml(order.id)}</h1><p>${note}</p>`
}
