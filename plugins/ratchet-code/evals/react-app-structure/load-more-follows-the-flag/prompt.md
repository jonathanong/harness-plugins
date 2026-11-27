---
description: A notifications list with a load-more control keeps paging while the API reports a next page, and shows its empty state only when no further page can be requested.
tags: [react-app-structure, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a React client component `NotificationList` for our notifications page. It reads `GET /api/notifications?limit=20&cursor=...`, which returns:

```ts
type NotificationPage = {
  items: { id: string; text: string; createdAt: string }[]
  next_cursor: string | null
  has_next_page: boolean
}
```

It should load the first page on mount, let the user load older notifications, and say "You're all caught up" when there are none. Plain `fetch` and hooks, no data library. Reply in your message; you don't need to create files.
