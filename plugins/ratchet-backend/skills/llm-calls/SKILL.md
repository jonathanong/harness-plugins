---
name: llm-calls
description: Use when writing or reviewing code that calls a language model - a summarizer, classifier, extractor, agent loop, or tool definition - or that builds a prompt from fetched pages, feeds, or user content. Covers one call per decision, where the model id comes from, static system prompts, untrusted content in prompts, tool arguments, and where the provider SDK lives.
---

# LLM calls

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A model call is an outside API call whose input may be written by an attacker and whose output
is not guaranteed. For timeouts, mapping, and failure behavior, the rules in
[service-boundaries](../service-boundaries/SKILL.md) apply as they do to any provider.

## Shape of a call

- Make one call per decision. Ask for a structured result (a schema, a tool call) when code
  acts on the answer, and validate it like any outside payload. Two calls where one would do
  double the cost and add a second way to fail.
- An entry point takes the provider and the model as arguments, from configuration. Do not give
  the model a default in code: a default hides which model a feature runs on, and changing it
  becomes a code change in every caller.
- Keep the system prompt static, or computed from a few fixed values. Give the model a user's
  data through a tool or in the user turn. A static prompt can be cached and reviewed, and data
  in the system prompt is read as instruction.

## Untrusted content

Text the application did not write is untrusted: a fetched page, a feed item, a file, another
user's post, a tool result.

- Before it reaches the model, strip what imitates the prompt's own structure, and wrap it in a
  delimiter the prompt names as data, with an instruction not to follow anything inside it.
- Never place it in the system prompt.
- Do not let a model that has read untrusted content take a privileged action unchecked. Code
  decides what the output may trigger; the output is a value, not a command.

## Tools

- A tool argument is input from an untrusted caller. Validate it, and clamp a limit, a page
  size, or a range in one shared helper, not with a `Math.min` in each tool.
- A tool returns what the acting user may see. Authorize inside the tool, as an endpoint would.

## Where the SDK lives

- Import a provider's SDK in one provider module, and construct its client there. That module
  owns keys, timeouts, retries, and cancellation; a second client elsewhere skips them.
- Use one API surface per provider. Do not add calls to a provider's older API beside its
  current one.
- Cancel a background or streamed response when its caller goes away, in that same module. An
  abandoned response keeps billing.
- Where the provider accepts an end-user identifier for abuse reports, send a stable opaque one
  on every call, never an email address or a name.

## Review

- Is there a model id in code outside configuration?
- Does any fetched or user-written text reach the model unwrapped, or in the system prompt?
- Can the output trigger a write, a send, or a payment without a check in code?
- Is the provider SDK imported outside its module?
