---
type: tool_used
tool: Bash
input_match: '"command"\s*:\s*"(?:[^"\\]|\\.)*?(?:codex-security\s+(?:[^;&|"\\]|\\[^n])*\b(?:close|dismiss|resolve|severity|fix)\b|gh\s+api\s(?:[^;&|"\\]|\\[^n])*(?:-X|--method)[ =]?(?:POST|PATCH|PUT|DELETE)|gh\s+(?:issue|pr)\s+(?:create|close|edit)|curl\s(?:[^;&|"\\]|\\[^n])*(?:-X|--request)[ =]?(?:POST|PATCH|PUT|DELETE))'
min: 0
max: 0
---
