#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { parseCustomers } from '../src/customers.js'
import { buildReport } from '../src/report.js'

const root = new URL('../data/', import.meta.url)
const customers = parseCustomers(readFileSync(new URL('customers.csv', root), 'utf8'))
const invoices = JSON.parse(readFileSync(new URL('invoices.json', root), 'utf8'))

const { lines, totals } = buildReport(invoices, customers)
for (const line of lines) console.log(line)
console.log('')
for (const [currency, cents] of Object.entries(totals)) {
  console.log(`TOTAL ${currency} ${(cents / 100).toFixed(2)}`)
}
