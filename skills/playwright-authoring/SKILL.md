---
name: playwright-authoring
description: Decide what a browser test should cover and how to locate elements with roles, labels, and test ids. Use when writing, reviewing, or de-flaking Playwright or other browser end-to-end tests, or when adding test ids to interface code.
---

# Playwright authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. For
rules that apply to every kind of test, use `test-authoring`.

A browser test is the slowest and least stable test a repository has. Spend it only on what needs
a browser.

## What belongs in a browser test

- Use a browser for behavior that needs one: rendering, interaction, navigation, client state.
- Check status codes, redirects, response headers, and page metadata with plain HTTP tests. They
  run in milliseconds and do not flake on rendering.
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

## Review

For each new browser test, ask whether an HTTP test or a component test would catch the same
failure. For each locator, ask whether a restyle or a copy change would break it.
