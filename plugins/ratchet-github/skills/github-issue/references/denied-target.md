# When the target repository cannot be written to

The issue belongs in a repository the signed-in account may not write to, or one that local policy
does not allow.

- Do not write to it. Do not fall back silently, and do not fall back to a repository you have not
  verified.
- File a tracking issue in the current repository, or in the tracker local policy names, after
  searching it for a duplicate. Apply the same checks as for any issue.
- Put the intended upstream repository in the tracking issue, with a report ready to copy there.
  Resolve that repository first and write its canonical name. When it does not resolve, do not
  name it.
- Before copying details to a more public place, remove private repository names, paths, links,
  code, and findings. If the report is useless after that, return the draft and ask where it may
  go.
- Say in the reply that the issue was rerouted and where. If no tracker is writable, return the
  draft and write nothing.
