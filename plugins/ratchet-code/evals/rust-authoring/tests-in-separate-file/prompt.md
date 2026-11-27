---
description: Unit tests for a private function go in a separate file, not in an inline test module.
tags: [rust-authoring, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add unit tests for `parse_duration` in `src/parser.rs`. It's a private function in our binary crate:

```rust
fn parse_duration(input: &str) -> Result<Duration, ParseError> {
    let (number, unit) = input.split_at(input.find(|c: char| !c.is_ascii_digit()).ok_or(ParseError::MissingUnit)?);
    let value: u64 = number.parse().map_err(|_| ParseError::BadNumber)?;
    match unit {
        "ms" => Ok(Duration::from_millis(value)),
        "s" => Ok(Duration::from_secs(value)),
        "m" => Ok(Duration::from_secs(value * 60)),
        _ => Err(ParseError::UnknownUnit),
    }
}
```

Reply in your message; you don't need to create files.
