// Parses the billing export: a header row, then `id,name,currency` per line.
export function parseCustomers(csv) {
  const [header, ...rows] = csv.split('\n').filter((row) => row !== '')
  const columns = header.split(',')
  const customers = new Map()
  for (const row of rows) {
    const values = row.split(',')
    const customer = Object.fromEntries(columns.map((column, i) => [column, values[i]]))
    customers.set(customer.id, customer)
  }
  return customers
}
