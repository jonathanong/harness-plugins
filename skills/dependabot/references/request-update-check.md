# Request a fresh update check

1. Open `https://github.com/<owner>/<repository>/network/updates` in an authenticated browser. The
   same page is under Insights, Dependency graph, Dependabot.
2. The page lists one row per update entry in `dependabot.yml`. Choose "Check for updates" for
   each entry that should run.
3. Open "Recent update jobs" on a row and read the log once the run has finished. Do not reload the
   page in a loop to watch it.

- Use a browser tool only when one is available with the user's own signed-in session. Otherwise
  give the user the URL and the entries to check, and say that the check was not requested.
- To rebuild one existing pull request, comment `@dependabot recreate` or `@dependabot rebase` on
  it. That does not check for new versions. `recreate` discards commits other people pushed to the
  pull request, so save those first.
- When rebasing a dependency pull request by hand, a lockfile conflict is not resolved by taking
  one side. The `git-commit-checklist` skill owns that procedure.
