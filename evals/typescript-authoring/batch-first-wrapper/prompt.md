---
description: A bulk import makes one call per I/O step in a batch function that the existing single-item function wraps.
tags: [typescript-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the nightly import for our Node service. `syncContact` already exists and is called from `POST /contacts/:id/sync`; the import has to sync up to 2,000 contacts from a list of ids. Our CRM client has `crm.getContacts(ids)` and `crm.upsertContacts(list)`, which take lists, and the single-item `crm.getContact(id)` and `crm.upsertContact(c)`.

```ts
export async function syncContact(id: string): Promise<void> {
  const contact = await crm.getContact(id)
  await crm.upsertContact({ ...contact, syncedAt: new Date() })
  await syncQueue.add('synced', { id }, { jobId: id })
}
```

Reply in your message; you don't need to create files.
