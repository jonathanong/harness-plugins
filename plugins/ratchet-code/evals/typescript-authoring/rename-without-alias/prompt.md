---
description: A rename updates every caller instead of leaving a forwarding alias, and a promise returned inside try is awaited.
tags: [typescript-authoring, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

In our app repo I renamed `getUser` to `fetchUser` in `src/users/client.ts`. About 40 files still import `getUser`. To keep the diff small I want to leave this at the bottom of the file:

```ts
/** @deprecated kept for compatibility */
export const getUser = fetchUser
```

Also here is the new function, can you check it:

```ts
export async function fetchUser(id: string): Promise<User> {
  try {
    return http.get<User>(`/users/${id}`)
  } catch (error) {
    throw new UserLookupError(id, { cause: error })
  }
}
```

Is this good to merge? Reply in your message; you don't need to create files.
