---
name: technical-writing
description: Use when writing or reviewing a design doc, proposal, investigation, postmortem, report, runbook, or README section meant for people to read. Structure a document so each reader finds their part fast - summary first, sections by audience and purpose, tables and diagrams over prose, every fact verified or flagged, every assumption stated.
---

# Technical writing

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Readers scan. Most read the summary and leave; a few drill into the one section that is theirs.
Write so both get what they came for without reading the rest.

For what belongs in a document at all, and what goes stale, use the `documentation` skill. For a
pull request body, use `pr-description`.

## Order: high level to low level

1. **Summary** for everyone: the conclusion, the decision or ask, and what the reader should do.
   A reader who stops here has the answer.
2. **Sections** by phase or area, each opening with its own one-line summary.
3. **Detail** deeper in each section, or in a later section, for the reader who needs it.
4. **Facts at the end**: the queries run, commands, data sources, links, and references the
   document rests on.
5. **Glossary**, when the document uses terms some readers will not know.

Do not build to a conclusion. Put it first and support it after.

## Audience and intent

- When more than one kind of reader will use the document, name the audience of each section
  in its heading or first line: everyone, business, engineering, on-call, and so on.
- Separate sections by intent as well: deciding, understanding, doing, verifying. One audience
  may have several intents; give each its own section rather than mixing a decision with a
  procedure.
- Do not invent an audience. A runbook for on-call engineers needs no business section.

```markdown
## Summary (everyone)

## Decision needed (business)

## Design (engineering)

## Rollout steps (on-call)

## Evidence

## Glossary
```

## Design for scanning

- Prefer bullets, tables, and diagrams to paragraphs. A paragraph is for an argument that only
  works as connected sentences.
- Put the key word or claim at the start of each bullet, in bold when the list is long.
- Use a table to compare. Lay out the dimensions a reader needs:
  - before and after, across every dimension that changes (behavior, cost, latency, risk, who
    is affected);
  - every combination of the inputs (flag on or off, by plan, by platform), so no case is left
    for the reader to work out;
  - options against criteria, when the document asks for a decision.
- Use a Mermaid diagram for a flow, a sequence across components, or a state machine, where the
  renderer draws Mermaid, such as GitHub and Claude Docs. Elsewhere use a numbered list.
- Add a table of contents when the document is longer than about three screens, or has more than
  five top-level sections.

## Facts, numbers, and assumptions

- Verify every fact you can: run the query, read the code, open the dashboard. Say how it was
  verified, or link the evidence in the facts section.
- Label each fact you could not verify as unverified, with what would verify it. Never state a
  guess in the same voice as a checked fact.
- State every assumption the conclusion depends on. An assumption must be reasonable; flag any
  that is not, or that could not be checked, next to the claim it supports, not only at the end.
- Numbers follow the `documentation` skill: dated and sourced in a point-in-time document (an
  investigation, a proposal, a postmortem), and a way to fetch them in a living one.

## Terms

- Define jargon, acronyms, and internal names at their first use, or link the first use to a
  document or reference that defines them.
- Collect the terms in a glossary at the end when there are more than a few.

## Tone

- Concise but not dense: short sentences, one idea each, with nothing left implicit.
- Use the words the audience uses. A business section says "customers who could not pay", not
  "the 402 rate".
- Write the claim, not the hedge. Where there is real uncertainty, say what it is once.

## Review

Ask of a document:

- Can a reader who stops after the summary act on it?
- Does each reader find their section from the headings alone?
- Is any comparison or set of combinations left in prose that a table would show?
- Is every fact verified or labeled, and every assumption stated?
- Is any term used before it is defined?
- Does any number in a living document go stale, where a way to fetch it would not?
