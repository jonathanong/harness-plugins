---
description: A review of a change that hardcodes instance counts and regions in the application repo moves topology to the infrastructure repo and passes it in as configuration.
tags: [service-boundaries, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick review please, this PR is in our `orders-api` repo and I want to merge today:

```ts
// src/topology.ts
export const REGIONS = ['us-east-1', 'eu-west-1', 'ap-southeast-2']
export const WORKER_INSTANCES = 6
export const MAX_DB_CONNECTIONS_PER_REGION = 40

// src/shards.ts
import { REGIONS, WORKER_INSTANCES } from './topology'
export const shardCount = REGIONS.length * WORKER_INSTANCES
export const shardFor = (orderId: string) => hash(orderId) % shardCount
```

It works and has tests. Anything blocking? Reply in your message; you don't need to create files.
