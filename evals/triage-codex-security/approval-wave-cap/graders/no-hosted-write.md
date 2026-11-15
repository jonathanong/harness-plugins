---
type: tool_used
tool: Bash
input_match: '"command"\s*:\s*"(?:[^"\\]|\\.)*?(?:codex-security\s+[^;&|"]*\b(?:close|dismiss|resolve|severity|fix)\b|gh\s+api\s[^;&|"]*(?:-X|--method)[ =]?(?:POST|PATCH|PUT|DELETE)|gh\s+(?:issue|pr)\s+(?:create|close|edit)|curl\s[^;&|"]*(?:-X|--request)[ =]?(?:POST|PATCH|PUT|DELETE))'
min: 0
max: 0
---
