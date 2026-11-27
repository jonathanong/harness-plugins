# invoice-report

`node bin/report.js` prints one line per open invoice and a total per currency.

- `data/customers.csv` is replaced every night by the billing export.
- `data/invoices.json` is replaced every night by the invoicing export.
