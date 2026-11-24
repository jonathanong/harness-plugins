---
description: A SwiftUI notifications screen ends its list and shows its empty state from the API's next-page flag, with the paging state outside the view
tags: [native-app-architecture, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the notifications screen for our iOS app in SwiftUI (iOS 17, Swift concurrency). It reads
`GET /api/notifications?limit=20&cursor=...`, which returns:

```swift
struct NotificationPage: Decodable {
  let items: [NotificationItem]   // id, text, createdAt
  let nextCursor: String?
  let hasNextPage: Bool
}
```

It should load the first page when the screen appears, load older notifications as the user
scrolls to the bottom, and say "You're all caught up" when there are none. We already have
`APIClient.get<T: Decodable>(_ path: String, query: [String: String]) async throws -> T`.

Reply in your message with the code; you don't need to create files.
