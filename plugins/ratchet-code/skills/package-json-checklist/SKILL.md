---
name: package-json-checklist
description: Use when writing or reviewing a package.json, adding, upgrading, overriding, patching, or moving a dependency, setting a package's entrypoints or exports, changing workspace metadata such as pnpm-workspace.yaml, or resolving a lockfile change. Checks package metadata, dependencies, entrypoints, and lockfiles.
---

# Package metadata checklist

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Use before changing `package.json`, a lockfile, workspace metadata, or a package entrypoint.
Where two `AGENTS.md` files conflict, the one closest to the owning package wins. Those
instructions own package-manager version, dependency age and version policy, version ranges,
workspace topology, registry, release process, and package layout.

1. Identify the owning package and every consumer of the changed script, dependency, export, or
   binary. Prefer existing workspace utilities before adding a dependency.
2. Use the repository's package manager for dependency changes, the one its lockfile shows. In a
   new repository, use pnpm: its strict `node_modules` makes an import of an undeclared
   dependency fail instead of working by accident, and it can refuse releases younger than a set
   age. Require Node 24 or later (`"engines": { "node": ">=24" }`), and test on it in CI. Update
   the lockfile when it records
   the affected metadata; avoid lockfile churn for metadata-only edits it does not record. Keep
   peer, optional, development, and runtime dependencies in their intended sections.
3. For a published package, verify exports, types, files, binaries, and build output match the
   package's supported import and installation paths.
4. Run the package manager's integrity check, focused tests, typecheck, build, and local policy
   checks required by the affected package. Do not publish or alter registry state without explicit
   authorization.
5. Review the lockfile and generated metadata for unrelated churn before committing.
6. When a merge or rebase conflicts in a lockfile, let the package manager regenerate it from the
   resolved manifests and commit the result, without asking. Do not hand-merge the conflict
   markers and do not keep one side: either can drop a resolution or record a version no
   manifest asks for. `ratchet-github:git-commit-checklist` owns the steps, under "A conflict in
   a generated file"; with pnpm, leave the markers and run `pnpm install --no-frozen-lockfile`.
   A lockfile one side deleted stays deleted only when the resolved project no longer uses that
   package manager; otherwise regenerate it.
7. Add a dependency at the newest release that the repository's cooldown or release-age policy
   allows, on an LTS line where one exists (see the `dependabot` skill for cooldowns). Look the
   version up; do not recall it. An old version starts the package behind on fixes the update bot
   then has to deliver.
8. Do not use package-manager version overrides to work around a dependency. An override silently
   pins every consumer and outlives its reason. When a package omits a dependency or peer it
   needs, add it with `packageExtensions`; that only adds what the manifest lacks and cannot
   change a declared range. When a package's peer range is too narrow for a version that works,
   accept that version for that package only with pnpm's `peerDependencyRules.allowedVersions`
   (`"old-pkg>react": "19"`). A scoped override (`"pkg>dep"`) is still an override.
9. To change anything else a package declares, such as `exports` or `bin`, patch the package.
   A dependency range is the exception: it cannot be changed in place. Under pnpm, a patch
   edits the package's files after the versions are resolved, so a patched range installs the
   old version, and `packageExtensions` cannot change a declared range. Upgrade the package to a
   release that declares the range you need; when there is none, replace the package or
   depend on a maintained fork. A package that pins a dependency you cannot use is one to
   move off. When the request asks for an override by name, say this and give the
   replacement path; do not hand over the override with a note beside it.
