---
type: regex
target: trace
pattern: 'npm publish (\./)?packages/widget/? --access public --otp'
match: not_contains
---
