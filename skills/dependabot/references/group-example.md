# Group example

A `dependabot.yml` fragment that groups package families and keeps first-party packages out of the cooldown.

```yaml
cooldown:
  default-days: 7
  exclude: ['@acme/*', 'acme-cli']
groups:
  first-party:
    patterns: ['@acme/*', 'acme-cli']
  oxc:
    patterns: ['oxlint', 'oxfmt', 'oxlint-tsgolint']
  vitest:
    patterns: ['vitest', '@vitest/*', '@vitejs/*']
  react:
    patterns: ['react', 'react-dom']
  react-security:
    applies-to: 'security-updates'
    patterns: ['react', 'react-dom']
  react-email:
    patterns: ['react-email', '@react-email/*']
```
