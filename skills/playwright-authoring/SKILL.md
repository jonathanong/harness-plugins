---
name: playwright-authoring
description: Use when writing, reviewing, or de-flaking Playwright or other browser end-to-end tests, or when adding test ids to interface code. Decide what a browser test should cover and how to locate elements with roles, labels, and test ids.
---

# Playwright authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. For
rules that apply to every kind of test, use `test-authoring`.

A browser test is the slowest and least stable test a repository has. Spend it only on what needs
a browser.

## What belongs in a browser test

- Use a browser for behavior that needs one: rendering, interaction, navigation, client state.
- Check status codes, redirects, response headers, cache behavior, and page metadata with
  fetch-level HTTP tests. They run in milliseconds and do not flake on rendering. Browser tests
  own the rendered interface.
- Do not repeat in the browser what a unit or component test already covers. Cover the flow that
  joins the parts, once.

## Locators

Select elements the way a user or an assistive tool finds them, in this order:

1. Role and accessible name: `page.getByRole('button', { name: 'Save' })`.
2. Label: `page.getByLabel('Email')`.
3. Test id: `page.getByTestId('invoice-row')`.

- Do not select by CSS class, tag name, DOM structure, or `text=`. Those change with styling and
  copy, and the test fails without the behavior changing.
- Use `getByTestId`. Do not write the attribute selector by hand
  (`page.locator('[data-testid="invoice-row"]')`); it bypasses the configured test id attribute
  and cannot be found by a search for test id usage.

## Test ids

- Give every interactive control a test id: buttons, links, inputs, menu items, toggles. A
  control without one forces the next test to select by something fragile.
- Write each test id as a unique string literal. Do not compute it from a variable or a template,
  and do not leave it empty. A literal can be searched from the test to the component and back;
  a computed one cannot.
- For a repeated row, put a literal test id on the row and narrow by its content:
  `page.getByTestId('invoice-row').filter({ hasText: 'INV-1042' })`.

## Waiting, state, and network

- Never wait an arbitrary time. Use an auto-waiting assertion, or wait for a precise URL,
  request, response, or visible completion signal. Register a response wait before the action
  that triggers it.
- To load more of an infinite list, scroll the page or the container. `scrollIntoViewIfNeeded()`
  does nothing when the sentinel is already in view, so the next page may never load.
- Do not raise the test deadline inside a spec. A test that needs longer is too long: shorten
  the scenario or seed closer to the behavior under test. The suite's deadline is set in one
  place.
- Seed data and establish authentication through a supported fixture or API, not through the
  interface. Keep each scenario independent of test order and of earlier state.
- Mock the network only for third-party behavior, fault injection, streaming, or a condition that
  cannot be seeded.
- Capture diagnostics (trace, screenshot) on failure.
- Run against a production build, not a dev server. Clear stale build output and worker cache
  before starting servers, since leftovers cause false failures such as hydration mismatches and
  cached stale HTML.

## Review

For each new browser test, ask whether an HTTP test or a component test would catch the same
failure. For each locator, ask whether a restyle or a copy change would break it.
