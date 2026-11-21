#!/usr/bin/env node
// Checks the Claude Code and Codex marketplaces against each other, the local plugin, the README,
// and the repositories they point at. Pass --offline to skip the checks that fetch from GitHub.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const offline = process.argv.includes('--offline')
const root = join(import.meta.dirname, '..')
const errors = []
const warnings = []

const readJson = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'))

const claude = readJson('.claude-plugin/marketplace.json')
const codex = readJson('.agents/plugins/marketplace.json')
const hosts = [
  { host: 'Claude Code', marketplace: claude, manifest: '.claude-plugin/plugin.json' },
  { host: 'Codex', marketplace: codex, manifest: '.codex-plugin/plugin.json' },
]

// Both marketplaces have the same name and list the same plugins, once each.
if (claude.name !== codex.name) {
  errors.push(`marketplace names differ: Claude Code "${claude.name}", Codex "${codex.name}"`)
}
const namesOf = ({ host, marketplace }) => {
  const names = marketplace.plugins.map((plugin) => plugin.name)
  for (const name of names.filter((name, index) => names.indexOf(name) !== index)) {
    errors.push(`${host} marketplace lists "${name}" more than once`)
  }
  return new Set(names)
}
const [claudeNames, codexNames] = hosts.map(namesOf)
for (const name of claudeNames.difference(codexNames)) {
  errors.push(`"${name}" is in the Claude Code marketplace but not the Codex one`)
}
for (const name of codexNames.difference(claudeNames)) {
  errors.push(`"${name}" is in the Codex marketplace but not the Claude Code one`)
}

// Codex hides a plugin that has no install policy or category.
for (const plugin of codex.plugins) {
  if (!plugin.policy?.installation || !plugin.policy?.authentication || !plugin.category) {
    errors.push(
      `Codex entry "${plugin.name}" needs policy.installation, policy.authentication, and category`,
    )
  }
}

// A local source is a directory in this repository whose manifests name the plugin.
const localPath = (source) =>
  typeof source === 'string' ? source : source.source === 'local' ? source.path : null
for (const { host, marketplace, manifest } of hosts) {
  for (const plugin of marketplace.plugins) {
    const path = localPath(plugin.source)
    if (path === null) continue
    const file = join(path, manifest)
    if (!existsSync(join(root, file))) {
      errors.push(`${host} entry "${plugin.name}" points at ${path}, which has no ${manifest}`)
    } else if (readJson(file).name !== plugin.name) {
      errors.push(`${host} entry "${plugin.name}" does not match the name in ${file}`)
    }
  }
}
if (
  existsSync(join(root, 'plugin.json')) &&
  readJson('plugin.json').name !== readJson('.claude-plugin/plugin.json').name
) {
  errors.push('plugin.json and .claude-plugin/plugin.json name different plugins')
}

// The README's plugin table lists every plugin in the marketplace, and nothing else.
const readme = readFileSync(join(root, 'README.md'), 'utf8')
const section = readme.split(/^## Plugins$/m)[1]?.split(/^## /m)[0]
if (section === undefined) {
  errors.push('README.md has no "## Plugins" section')
} else {
  const rows = section
    .split('\n')
    .filter((line) => line.startsWith('| ') && !line.startsWith('| -'))
  const listed = new Set(rows.slice(1).map((row) => row.match(/^\| \[?`?([\w-]+)/)?.[1]))
  const all = new Set(claude.plugins.map((plugin) => plugin.name))
  for (const name of all.difference(listed)) errors.push(`README.md does not list "${name}"`)
  for (const name of listed.difference(all))
    errors.push(`README.md lists "${name}", which is not in the marketplace`)
}

// A remote source resolves at its ref, and the host's manifest there names the plugin.
const rawUrl = (source, file) => {
  const repo = source.url?.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1]
  if (repo === undefined) return null
  const dir = source.path ? `${source.path.replace(/^\.?\/|\/$/g, '')}/` : ''
  return `https://raw.githubusercontent.com/${repo}/${source.ref ?? 'HEAD'}/${dir}${file}`
}
const fetchJson = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return response.json()
}
const checkRemote = async ({ host, manifest }, plugin) => {
  const label = `${host} entry "${plugin.name}"`
  const url = rawUrl(plugin.source, manifest)
  if (url === null) {
    errors.push(`${label} has a source this check cannot read: ${JSON.stringify(plugin.source)}`)
    return
  }
  let found = await fetchJson(url)
  if (found === null && host === 'Codex') {
    // Codex installs a plugin that has only a Claude Code manifest, without a version.
    found = await fetchJson(rawUrl(plugin.source, '.claude-plugin/plugin.json'))
    if (found !== null)
      warnings.push(`${label} has no ${manifest}; Codex installs it without a version`)
  }
  if (found === null) errors.push(`${label}: ${url} not found`)
  else if (found.name !== plugin.name)
    errors.push(`${label}: ${url} names the plugin "${found.name}"`)
}
if (!offline) {
  const checks = hosts.flatMap((host) =>
    host.marketplace.plugins
      .filter((plugin) => localPath(plugin.source) === null)
      .map((plugin) =>
        checkRemote(host, plugin).catch((error) =>
          errors.push(`${host.host} entry "${plugin.name}": ${error.message}`),
        ),
      ),
  )
  await Promise.all(checks)
}

for (const warning of warnings) console.log(`::warning::${warning}`)
for (const error of errors) console.error(`::error::${error}`)
if (errors.length > 0) process.exit(1)
console.log(`${claude.name}: ${claudeNames.size} plugins checked${offline ? ' (offline)' : ''}`)
