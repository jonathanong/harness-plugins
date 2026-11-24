---
name: package-json-checklist
description: Use when writing or reviewing a package.json, adding, upgrading, overriding, patching, or moving a dependency, setting a package's entrypoints or exports, changing workspace metadata such as pnpm-workspace.yaml, or resolving a lockfile change. Checks package metadata, dependencies, entrypoints, and lockfiles.
---

# Package metadata checklist

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Use before changing `package.json`, a lockfile, workspace metadata, or a package entrypoint. Read
every `AGENTS.md` from the repository root through the owning package,
applying the closest file only when rules conflict. Those instructions own package-manager version,
dependency age and version policy, version ranges, workspace topology, registry, release process,
and package layout, and override these defaults.

1. Identify the owning package and every consumer of the changed script, dependency, export, or
   binary. Prefer existing workspace utilities before adding a dependency.
2. Use the repository's package manager for dependency changes. Update the lockfile when it records
   the affected metadata; avoid lockfile churn for metadata-only edits it does not record. Keep
   peer, optional, development, and runtime dependencies in their intended sections.
3. For a published package, verify exports, types, files, binaries, and build output match the
   package's supported import and installation paths.
4. Run the package manager's integrity check, focused tests, typecheck, build, and local policy
   checks required by the affected package. Do not publish or alter registry state without explicit
   authorization.
5. Review the lockfile and generated metadata for unrelated churn before committing.
6. Add a dependency at the newest release that the repository's cooldown or release-age policy
   allows, on an LTS line where one exists (see the `dependabot` skill for cooldowns). Look the
   version up; do not recall it. An old version starts the package behind on fixes the update bot
   then has to deliver.
7. Do not use package-manager version overrides to work around a dependency. An override silently
   pins every consumer and outlives its reason. When a package omits a dependency or peer it
   needs, add it with `packageExtensions`; that only adds what the manifest lacks and cannot
   change a declared range. When a package's peer range is too narrow for a version that works,
   accept that version for that package only with pnpm's `peerDependencyRules.allowedVersions`
   (`"old-pkg>react": "19"`). A scoped override (`"pkg>dep"`) is still an override.
8. A dependency range that a package declares cannot be changed in place. A patch edits the
   package's files after the versions are resolved, so a patched range installs the old
   version, and `packageExtensions` cannot change a declared range. Upgrade the package to a
   release that declares the range you need; when there is none, replace the package or
   depend on a maintained fork. A package that pins a dependency you cannot use is one to
   move off. When the request asks for an override by name, say this and give the
   replacement path; do not hand over the override with a note beside it.
