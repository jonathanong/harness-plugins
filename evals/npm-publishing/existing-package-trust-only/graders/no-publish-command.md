---
type: regex
target: trace
pattern: 'npm publish (\./)?packages/widget/? --access public(?!(?:[^;&|"\\]|\\[^n])*--dry-run)'
match: not_contains
---
