import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCustomers } from '../src/customers.js'
import { buildReport } from '../src/report.js'

test('reports open invoices with the customer name and currency', () => {
  const customers = parseCustomers('id,name,currency\nc-1,Acme Tools,USD\n')
  const invoices = [
    { id: 'INV-1', customerId: 'c-1', amountCents: 1500, status: 'open' },
    { id: 'INV-2', customerId: 'c-1', amountCents: 900, status: 'paid' },
  ]
  assert.deepEqual(buildReport(invoices, customers), {
    lines: ['INV-1  Acme Tools  USD 15.00'],
    totals: { USD: 1500 },
  })
})
