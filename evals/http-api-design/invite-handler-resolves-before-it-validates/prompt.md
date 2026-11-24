---
description: A new invite endpoint authenticates, then resolves the project in the URL, then validates the body, then acts.
tags: [http-api-design, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add `POST /projects/:projectId/invites` to our API (Express 5, TypeScript, zod). The body is
`{ email, role }` where role is `viewer` or `editor`. What exists already:

```ts
// src/http/session.ts
export function requireSession(req: Request): Session // throws AppError('unauthenticated', 401)

// src/projects/service.ts
export function findProjectForMember(projectId: string, userId: string): Promise<Project | null>

// src/invites/service.ts
export function createInvite(
  project: Project,
  input: { email: string; role: 'viewer' | 'editor'; invitedBy: string },
): Promise<Invite> // throws AppError('already_a_member', 409)

// src/errors.ts
export class AppError extends Error {
  constructor(code: ErrorCode, status: number, message: string, details?: Record<string, unknown>)
}
```

`ErrorCode` already has `unauthenticated`, `project_not_found`, `validation_failed`, and
`already_a_member`. Errors thrown from a handler reach our error middleware. Reply in your
message with the handler; you don't need to create files.
