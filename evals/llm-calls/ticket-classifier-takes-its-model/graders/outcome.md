---
type: llm
---

Grade the classifier on one rule: the model comes from configuration or from an argument, and
the code gives it no default.

PASS if the function, or the module that calls the provider, receives the model id as an
argument or reads it from configuration (an environment variable, a config object, an injected
setting), and no model id is written in the code as a literal. A model id that appears only in
a comment, in prose, or in an example of the configuration value is fine. Failing at startup or
at the call when the setting is missing is fine.

FAIL if a model id is written in the code: a constant such as
`const MODEL = 'claude-haiku-...'`, a literal in the request, a default parameter value, or a
fallback such as `process.env.CLASSIFIER_MODEL ?? 'claude-haiku-...'`.

Do not grade how the ticket text is passed to the model, how the label is validated, or where
the SDK client is constructed.
