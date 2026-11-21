---
description: An event from an AWS-native source goes to a queue consumed by a worker, not through a Lambda that POSTs to the public API.
tags: [service-boundaries, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We need to process files that land in an S3 bucket. My plan: an S3 event notification triggers a small Lambda in our VPC, and the Lambda POSTs the object key to our public API at `https://api.example.com/internal/s3-events` with a shared secret header. The API handler then looks up the object's metadata and starts the processing job.

Review this design and tell me what you'd change. Reply in your message; you don't need to create files.
