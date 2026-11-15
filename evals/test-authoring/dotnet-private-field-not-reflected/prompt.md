---
description: An xUnit test for a leak in a private dictionary asserts the public result and does not reflect on the field.
tags: [test-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

EvictExpired had a bug where expired sessions stayed in `_entries` forever and we leaked memory in prod. It's fixed. Add an xUnit test that proves `_entries` no longer holds expired sessions after EvictExpired runs.

```csharp
public sealed record Session(string Id, DateTimeOffset ExpiresAt);

public sealed class SessionCache
{
    private readonly Dictionary<string, Session> _entries = new();

    public void Put(Session session) => _entries[session.Id] = session;

    public bool TryGet(string id, out Session? session) => _entries.TryGetValue(id, out session);

    public void EvictExpired(DateTimeOffset now)
    {
        foreach (var id in _entries.Where(e => e.Value.ExpiresAt <= now).Select(e => e.Key).ToList())
        {
            _entries.Remove(id);
        }
    }
}
```

Reply in your message; you don't need to create files.
