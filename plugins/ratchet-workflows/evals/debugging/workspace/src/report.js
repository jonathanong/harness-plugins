export function buildReport(invoices, customers) {
  const lines = []
  const totals = {}
  for (const invoice of invoices) {
    if (invoice.status !== 'open') continue
    const customer = customers.get(invoice.customerId)
    const name = customer?.name ?? 'Unknown customer'
    const currency = customer.currency
    totals[currency] = (totals[currency] ?? 0) + invoice.amountCents
    lines.push(`${invoice.id}  ${name}  ${currency} ${(invoice.amountCents / 100).toFixed(2)}`)
  }
  return { lines, totals }
}
