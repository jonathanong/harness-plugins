# Request a fresh update check

1. Open `https://github.com/<owner>/<repository>/network/updates` in an authenticated browser. The
   same page is under Insights, Dependency graph, Dependabot.
2. The page lists one row per update entry in `dependabot.yml`. Choose "Check for updates" for
   each entry that should run.
3. Open "Recent update jobs" on a row and read the log once the run has finished. Do not reload the
   page in a loop to watch it.

- Use a browser tool only when one is available with the user's own signed-in session. Otherwise
  give the user the URL and the entries to check, and say that the check was not requested.
- Commenting `@dependabot recreate` or `@dependabot rebase` on a pull request rebuilds that one
  pull request. It does not check for new versions. "Repair a Dependabot pull request" in
  `SKILL.md` says when each comment is safe.
