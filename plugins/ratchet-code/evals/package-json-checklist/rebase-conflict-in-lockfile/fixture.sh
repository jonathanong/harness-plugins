#!/usr/bin/env bash
# Builds a repository stopped mid-rebase on a pnpm-lock.yaml conflict. Offline: nothing installs.
set -euo pipefail

git init --quiet --initial-branch=main
git config user.name eval
git config user.email eval@example.invalid

lock() {
  cat <<EOF
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      zod:
        specifier: ^3.23.8
        version: 3.23.8
$1
packages:

  zod@3.23.8:
    resolution: {integrity: sha512-AAAA}
$2
snapshots:

  zod@3.23.8: {}
$3
EOF
}

mkdir src
echo 'export const ok = true;' > src/index.js
printf '{\n  "name": "app",\n  "version": "1.0.0",\n  "type": "module",\n  "dependencies": {\n    "zod": "^3.23.8"\n  }\n}\n' > package.json
lock '' '' '' > pnpm-lock.yaml
git add --all
git commit --quiet --message 'Initial commit'

git switch --quiet --create add-dayjs
printf '{\n  "name": "app",\n  "version": "1.0.0",\n  "type": "module",\n  "dependencies": {\n    "dayjs": "^1.11.13",\n    "zod": "^3.23.8"\n  }\n}\n' > package.json
lock '      dayjs:
        specifier: ^1.11.13
        version: 1.11.13' '
  dayjs@1.11.13:
    resolution: {integrity: sha512-BBBB}' '
  dayjs@1.11.13: {}' > pnpm-lock.yaml
git commit --quiet --all --message 'Add dayjs'

git switch --quiet main
printf '{\n  "name": "app",\n  "version": "1.0.0",\n  "type": "module",\n  "dependencies": {\n    "zod": "^3.23.8"\n  },\n  "devDependencies": {\n    "nanoid": "^5.0.9"\n  }\n}\n' > package.json
lock '      nanoid:
        specifier: ^5.0.9
        version: 5.0.9' '
  nanoid@5.0.9:
    resolution: {integrity: sha512-CCCC}' '
  nanoid@5.0.9: {}' > pnpm-lock.yaml
git commit --quiet --all --message 'Add nanoid'

git switch --quiet add-dayjs
git rebase main >/dev/null 2>&1 || true
