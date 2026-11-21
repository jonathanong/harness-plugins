# Routing a new inbound event source

Read this when adding a webhook, a cloud notification (SNS, EventBridge, an S3 event), or any other
inbound event source. The rules are in `SKILL.md`; this is the order to decide them in.

1. **Is the sender inside your cloud account or outside it?** An AWS-native source is inside; a
   third-party webhook is outside.
2. **Can every check before persisting run on request bytes and local state alone?** If so,
   check, then enqueue. If not, enqueue a provisional job and move the network-dependent part into
   the worker. Example: a signature check that needs the sender's public key. Verify against a
   cached key when a fresh one is stored; for an unknown or stale key, enqueue the signed envelope
   and fetch the key and verify in the worker.
3. **Inside AWS:** check whether the source can target SQS directly (an EventBridge rule target, an
   SNS subscription, an S3 bucket notification). If it can, use that and have a worker consume the
   queue. No function sits in between. Check the source's documentation before concluding it
   cannot; an earlier design that routed S3 events through a Lambda assumed wrongly.
4. **Inside AWS, with no native queue target:** use a Lambda that only does a self-contained check
   and enqueues. Any other I/O belongs in a worker.
5. **Outside AWS:** a public endpoint is the only way in. Its auth must be self-contained, so the
   handler never makes an outbound call on the request path.
6. **A third party that delivers through your cloud provider's partner event source** (the sender
   puts events on a bus in your account, and the provider guarantees only that sender can) is
   inside, not outside. Treat it as step 3 and drop the public endpoint and its shared secret.
7. **Is there a push path?** If the only way data arrives is a schedule, the source is missing an
   enqueue path. See "Push first" in `SKILL.md`.

For queue design (lanes, concurrency, retries) see the `glide-mq` skill.
