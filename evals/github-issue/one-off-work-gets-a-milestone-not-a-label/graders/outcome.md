---
type: llm
---

Grade the final message. A label lasts; `stripe-migration-q3` is tied to one quarter's
migration, which is what a milestone or a project is for.

PASS if all of these hold:

- The response does not give a `gh label create` (or an API call that creates a label) for
  `stripe-migration-q3` to run as is. Offering to create it only after the person approves its
  exact name, description, color, and repository, while recommending against it, still passes.
- It proposes grouping the five issues with a milestone or a project instead (a new milestone
  such as "Stripe Billing migration", or the existing project), and says why: the label would
  outlive the work.
- Where it applies labels, it uses only existing ones, such as `area: billing`.

FAIL if the commands create the label, or if the response creates the label and applies it
without raising that the work is one-off. FAIL if it invents another new label in its place.
