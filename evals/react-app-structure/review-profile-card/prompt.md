---
description: A review of a profile component flags the computed fetch URL, the hand-built entity link, and the user-supplied image rendered directly.
tags: [react-app-structure, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this component before I merge it. `avatarUrl` is whatever URL the user pasted into their profile.

```tsx
const endpoints = { user: '/api/users', orders: '/api/orders' } as const

export function ProfileCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}${endpoints.user}/${userId}`)
      .then((r) => r.json())
      .then(setUser)
  }, [userId])
  if (!user) return null
  return (
    <div>
      <img src={user.avatarUrl} alt="" width={48} height={48} />
      <a href={'/u/' + user.handle + '/orders'}>Orders</a>
      {(() => {
        if (user.plan === 'pro') return <ProBadge />
        return null
      })()}
    </div>
  )
}
```

Reply in your message; you don't need to create files.
