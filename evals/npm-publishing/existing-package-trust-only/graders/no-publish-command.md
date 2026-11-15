---
type: regex
target: trace
pattern: 'npm publish (\./)?packages/widget\b(?!(?:[^;&|"\\]|\\[^n])*--dry-run)'
match: not_contains
---
