# Replacing a library

These rules add to the general ones in the skill. Read before replacing a parser, tokenizer,
serializer, decoder, or format library behind a stable interface.

Pin the old behavior first. The quirks callers depend on are rarely documented, and a green suite
after the swap proves nothing if no test described them.

- Write down the current contract: input and output types, sync or async, error handling, fallback
  values, ordering, offsets, and the malformed input it accepts.
- Write characterization tests against the old implementation and run them green before changing
  anything. Cover each category that applies:
  - malformed but accepted input: missing delimiters, duplicate fields, unknown tokens, input that
    returns a safe sentinel instead of throwing;
  - encodings: byte-order marks, charset precedence, entities, base64 and quoted-printable bodies;
  - quoting: SQL escapes and dollar quotes, shell quotes and heredocs, nested comments;
  - scalar coercion: YAML 1.1 booleans, numbers versus strings, time-like strings such as
    `12:30:45`;
  - offsets and order: UTF-8 byte offsets versus string indexes, line numbers, stable order,
    first match versus last match;
  - fallbacks: empty and nullish input, unsupported formats, no match.
- Prefer an existing maintained parser over hand-rolled parsing. For security-relevant command
  parsing, a hand-rolled token walk needs its quoting, heredoc, substitution, and redirection cases
  characterized before it ships.
- After the swap, keep the public signature unless the plan allows a break. Add a test for each
  difference the new library has and you chose to normalize. Delete the replaced code and the tests
  that only exercised its internals.
