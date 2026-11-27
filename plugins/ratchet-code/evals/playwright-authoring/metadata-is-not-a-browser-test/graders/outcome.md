---
type: llm
---

PASS if both hold. First, the redirect check and the metadata checks (title, meta description,
canonical link) do not drive a browser page: they use an HTTP request (Playwright's `request`
fixture or `APIRequestContext`, `fetch`, or a separate HTTP test) and assert on the response
status, `Location` header, or returned HTML, and the response says these checks do not need a
browser. Second, the toggle test locates the button by role and accessible name
(`getByRole('button', { name: ... })`) or with `getByTestId`, and does not use a CSS class, tag
selector, or `text=` locator.

FAIL if the redirect or the metadata is checked with `page.goto` and page assertions such as
`toHaveTitle` or `page.locator('meta...')`, or if the button is located with `.toggle`,
`button.toggle--annual`, or `text=`.
