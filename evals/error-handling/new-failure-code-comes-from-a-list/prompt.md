---
description: A new "team is full" failure gets a code from one typed list of codes, and the web client branches on that code, not on the message.
tags: [error-handling, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Teams now have a seat limit (`teams.seat_limit`). When someone accepts an invite to a team that's already full, it should fail, and the web app should show a "This team is full" screen that says the team's name and how many seats it has, with a button to email the team's admin. Add that. Here's what we have today:

```ts
// src/errors.ts
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

// src/invites/acceptInvite.ts
export async function acceptInvite(token: string, userId: string) {
  const invite = await invites.findByToken(token)
  if (!invite) throw new HttpError(404, `Invite ${token} not found`)
  if (invite.expiresAt < new Date()) {
    throw new HttpError(410, `Invite ${invite.id} expired on ${invite.expiresAt.toISOString()}`)
  }
  const team = await teams.findById(invite.teamId) // { id, name, seatLimit, adminEmail }
  await members.add(team.id, userId)
  return { teamId: team.id }
}

// src/http/errorHandler.ts
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500
  res.status(status).json({ error: err instanceof Error ? err.message : 'Internal error' })
}

// web/src/AcceptInvite.tsx
const res = await fetch(`/api/invites/${token}/accept`, { method: 'POST' })
if (!res.ok) {
  const body = await res.json()
  if (body.error.includes('expired')) return <ExpiredInvite />
  return <GenericError message={body.error} />
}
```

`members.countByTeam(teamId)` gives the current member count. Reply in your message with the changed code; you don't need to create files.
