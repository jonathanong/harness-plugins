# Eval history

This log only grows, newest entry first. Scores in different entries are not comparable when a
case, grader, fixture, or model changed between them; each entry says what changed. The current
scores are in [EVALS.md](EVALS.md).

## 2026-11-23: a `postgres-schema-design` case for comments

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.57 for one two-arm run
of six attempts. There was no separate pilot, so this run is also the first check of the new
grader. The abandoned constraint-naming pilot below used the same prompt under a different
grader; counting `COMMENT ON` statements in its two answers gives one for the table and six for
columns with the plugin, and none without.

| Case                                                   | With plugin | Loaded | Without plugin |
| ------------------------------------------------------ | ----------- | ------ | -------------- |
| `postgres-schema-design/membership-table-is-commented` | 6 of 6      | 6 of 6 | 1 of 6         |

- **Case added.** Write a team-membership migration. The grader checks one rule: the table and
  every column it creates have a database comment.
- **What the run showed.** I counted `COMMENT ON` statements in each answer. Every plugin
  answer has one for the table and six or seven for columns. Without the plugin one answer has
  the table and six columns and passes; four have the table and two or three columns; one has
  none.
- **No skill change.**

## 2026-11-23: a `postgres-schema-design` constraint-naming pilot, abandoned

Main at `e162033`, Sonnet agent, Opus judge, Claude Code 2.1.330. $0.23 for one pilot of one
attempt per arm. No case was added.

| Pilot                                                                 | With plugin | Loaded | Without plugin |
| --------------------------------------------------------------------- | ----------- | ------ | -------------- |
| A membership table names its constraints, states `ON DELETE`, indexes | 0 of 1      | 1 of 1 | 1 of 1         |

- **The pilot.** Write a team-membership migration. The grader checked the one bullet "Name
  every constraint and state `ON DELETE` on every foreign key. Index the referencing column."
- **What the two answers did.** I read the SQL of both. The unaided answer named its primary
  key, three foreign keys, and check, gave each foreign key an `ON DELETE`, and indexed the
  user and inviter columns. The plugin answer did the same for its foreign keys, unique
  constraint, and indexes, but wrote `id uuid PRIMARY KEY DEFAULT uuidv7()` inline, which
  leaves the primary key for PostgreSQL to name.
- **A finding about the skill, not fixed here.** The skill's own examples do not follow the
  bullet: `references/relations.md` has `id uuid PRIMARY KEY`, `code text NOT NULL UNIQUE`, and
  a `REFERENCES accounts (id)` with no name and no `ON DELETE`, and
  `references/table-shapes.md` has an inline `PRIMARY KEY` with an unnamed `CHECK`. One attempt
  does not show that the examples caused the inline key.

## 2026-11-23: two pilots for rules with no case, abandoned

Main at `e9b2310`, Sonnet agent, Opus judge, Claude Code 2.1.330. $0.40 for two pilots of one
attempt per arm. No case was added.

| Pilot                                                                         | With plugin | Without plugin |
| ----------------------------------------------------------------------------- | ----------- | -------------- |
| `http-api-design`: a notifications endpoint returns entity ids, not web paths | 1 of 1      | 1 of 1         |
| `llm-calls`: customer data stays out of an assistant's system prompt          | 1 of 1      | 1 of 1         |

- **First pilot.** The prompt listed the web app's page routes. The unaided answer said it
  returns the order, invoice, and comment ids and that the web app builds the paths itself.
- **Second pilot.** The unaided answer said it kept the system prompt identical for every
  customer and put the customer's data in a message, and gave prompt caching as its reason.
- **What this shows.** One attempt per arm is a grader check, not a measurement; it was enough
  to stop, because each unaided answer stated a reason the rule gives.

## 2026-11-23: an `http-api-design` case for handler order

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.61 for one two-arm run
of six attempts, after a one-attempt pilot ($0.20) that passed with the plugin and failed
without.

| Case                                                          | With plugin | Loaded | Without plugin |
| ------------------------------------------------------------- | ----------- | ------ | -------------- |
| `http-api-design/invite-handler-resolves-before-it-validates` | 6 of 6      | 6 of 6 | 0 of 6         |

- **Case added.** Write an invite endpoint from four given functions. The grader checks one
  rule: the handler authenticates, resolves the project in the URL, validates the body, then
  acts.
- **What the run showed.** I listed the order of the four calls in each answer's code. All six
  plugin answers look up the project before parsing the body. All six unaided answers
  authenticate, parse the body, and only then look up the project.
- **Grader edited after the run, not re-measured.** It no longer asks for a 404 when the
  project is missing, only that the handler stops there; the status is a second thing and the
  prompt does not give one.
- **No skill change.** The rule had no case; `ROADMAP.md` listed it among the rules added
  without one.

## 2026-11-23: two pilots to replace the `bounded-iteration` sweep review, abandoned

Main at `320a39a`, Sonnet agent, Opus judge, Claude Code 2.1.330. $0.75 for two pilots of one
attempt per arm. No case was added; `review-sweep-rewrites-its-trigger` stays.

Both pilots ask the agent to write the job, where the kept case asks for a review. Each grader
checked one half of the "a sweep converges" rule.

| Pilot                                                                   | With plugin | Without plugin |
| ----------------------------------------------------------------------- | ----------- | -------------- |
| A search-text job on a table whose trigger bumps the selected timestamp | 1 of 1      | 1 of 1         |
| A repair sweep that must not resend a customer email on every pass      | 1 of 1      | 1 of 1         |

- **First pilot.** The schema in the prompt included the trigger. The unaided answer named the
  feedback loop and guarded its update with `IS DISTINCT FROM`.
- **Second pilot.** The job rescans a 30-minute window every 10 minutes. The unaided answer
  added a table with an `email_done_at` column so the email is sent once.
- **What this shows.** With the trigger or the rescan window stated in the prompt, the model
  wrote a sweep that converges without the skill in both attempts. One attempt per arm is a grader check, not
  a measurement.

## 2026-11-23: two `error-handling` reporting pilots on a fixture, abandoned

Main at `a908232`, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.57 for two pilots of one
attempt per arm. No case was added and the fixture was not kept.

The fixture was a service of ten small source files: a route, a redeem function, a ledger client,
error middleware that sends every error to the tracker unless its code is in a quiet list, and
separate middleware that writes the response.

| Pilot                                                              | With plugin | Without plugin |
| ------------------------------------------------------------------ | ----------- | -------------- |
| An already-used gift card gets a 409 and stays out of the tracker  | 1 of 1      | 1 of 1         |
| A 422 from the ledger for a credit we built becomes a reported 5xx | 1 of 1      | 1 of 1         |

- **First pilot.** The request named only the route. The unaided attempt read six of the
  ten files: it followed the route to the server file, read both middleware files from there,
  and added the new code to the quiet list.
- **Second pilot.** The unaided attempt answered 502 and left the code out of the quiet list.
  Its message gives the reason: the amount comes from our own row, so the shopper cannot fix
  it.
- **What this shows.** In a repository this small the model follows the imports to the
  tracker call, so putting that call in another file hides nothing. One attempt per arm is a grader check, not a
  measurement.

## 2026-11-23: a native case for the client pagination rule

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $2.55 for one two-arm run
of six attempts, after a one-attempt pilot that passed with the plugin and failed without.

| Case                                             | With plugin | Loaded | Without plugin |
| ------------------------------------------------ | ----------- | ------ | -------------- |
| `native-app-architecture/inbox-ends-on-the-flag` | 5 of 6      | 6 of 6 | 0 of 6         |

- **Case added.** A SwiftUI notifications screen over an API that returns `hasNextPage`. The
  grader checks the paging rule in three parts: only the flag ends the list, the empty state
  needs no items and no further page, and the paging state lives outside the view.
- **What the run showed.** Without the plugin the judge failed all six; the four answers whose
  empty state I could read show it whenever the item array is empty. With the plugin five
  pass. The sixth split the judges two to one: its empty state checks the flag, but it offers
  the next page only when the list already has items, so an empty first page with a next page
  shows nothing to continue from.
- **Grader edited after the run, not re-measured.** It now says that an empty page with a next
  page and no way to request it fails, which is the case that split the judges. The recorded
  failure would still fail; no passing answer was re-checked against the new line.
- **No skill change.** Four of the six plugin attempts also loaded `list-reads`.

## 2026-11-23: an `llm-calls` case for tool arguments

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.66 for one two-arm run
of six attempts, after a one-attempt pilot that passed with the plugin and failed without.

| Case                                           | With plugin | Loaded | Without plugin |
| ---------------------------------------------- | ----------- | ------ | -------------- |
| `llm-calls/new-tool-clamps-through-one-helper` | 5 of 6      | 6 of 6 | 2 of 6         |

- **Case added.** Add a `list_refunds` tool beside two tools, one that caps its limit with an
  inline `Math.min` and one that does not cap it. The grader checks one rule: the limit and the
  day range are bounded from both sides through one shared helper or shared schema.
- **What the run showed.** Without the plugin two answers passed, and the judge failed the
  other four. I read those four: all bound both values, three of them inside the new tool, and
  one with a shared helper for the limit and the day count bounded in the tool's own schema.
  With the plugin five
  answers put both values through one helper. The sixth wrote a helper for the limit and
  bounded the day count in the tool's own schema, which the grader fails.
- **No skill change.** The difference is 3 of 6 attempts, which this sample does not settle.

## 2026-11-23: an `llm-calls` case the model fails unaided

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $3.78 for one two-arm run
of six attempts, after a one-attempt pilot that scored the same in each arm.

| Case                                          | With plugin | Loaded | Without plugin |
| --------------------------------------------- | ----------- | ------ | -------------- |
| `llm-calls/ticket-classifier-takes-its-model` | 6 of 6      | 6 of 6 | 0 of 6         |

- **Case added.** Write a ticket classifier that should run on a cheap, fast model. The grader
  checks one rule: the model comes from configuration or an argument, and no model id is
  written in the code, as a constant, a default, or a fallback.
- **What the run showed.** Without the plugin the judge failed all six, and each of the six
  answers passes a model id as a literal in the request. With
  it every answer took the model from configuration. Both arms also loaded the harness's own
  API reference skill, so the difference is the plugin's rule.
- **No skill change.** `summarize-fetched-page` stays as a ceiling case.

## 2026-11-23: the sweep grader was too loose, and the rule does help

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $2.58 over two runs: a
two-arm run of six, and a plugin-only control of six against the skills as they were. This
corrects the entry below; its scores are not comparable with these.

| Case `bounded-iteration/overlapping-purge-runs-stay-lock-free` | Answer passes | Skill loaded |
| -------------------------------------------------------------- | ------------- | ------------ |
| With the plugin, new rule                                      | 5 of 6        | 5 of 6       |
| With the plugin, skills as they were                           | 0 of 6        | 5 of 6       |
| Without the plugin                                             | 0 of 6        | n/a          |

- **Grader corrected** after an automated review. It had accepted a forward-only cursor guard
  (`WHERE last_id < $new`, `GREATEST`). That guard lets a run write a
  position it computed from a start another run has since replaced; a compare-and-set never
  does. The grader now requires a compare-and-set on the value the batch read, and
  the eligibility test in the `DELETE`'s own `WHERE`, not only in a CTE that picks the ids.
- **What the runs showed.** With the skills as they were, every answer re-checks in the delete
  and takes no lock, and every one guards the cursor forward-only. With the new rule, the five
  attempts that loaded the skill use a compare-and-set, and the one that loaded no skill does
  not. So the difference is the new sentence on advancing a stored position.
- **Also changed, and included in these runs:** the rule now says that a guard on another row,
  such as a hold on the parent, goes in the write as well; the bounded-delete example returns
  the candidate count, and `hasMore` follows that count instead of the rows deleted.

## 2026-11-23: a sweep takes no locks

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $3.09 over three runs: a
one-attempt pilot, a two-arm run of six, and a plugin-only control of six against the skills as
they were.

| Case `bounded-iteration/overlapping-purge-runs-stay-lock-free` | Answer passes | Skill loaded |
| -------------------------------------------------------------- | ------------- | ------------ |
| With the plugin, new rule                                      | 6 of 6        | 4 of 6       |
| With the plugin, skills as they were                           | 6 of 6        | 5 of 6       |
| Without the plugin                                             | 2 of 6        | n/a          |

- **Rule added** to `bounded-iteration`, at the owner's request: a sweep does not lock the
  candidate rows it selected or its cursor row; each write re-checks eligibility on its own
  target in the same statement; a stored position advances by a compare-and-set;
  `FOR UPDATE SKIP LOCKED` is only for a work-item claim. The step on writes used to say to add
  `SKIP LOCKED` "when workers compete". `postgres-locking` links to the rule.
- **Reference changed.** The bounded-delete example in `references/sweep-patterns.md` took
  `FOR UPDATE SKIP LOCKED` in its CTE. It now takes no lock and repeats the retention predicate
  in the `DELETE`.
- **Mistake the rule prevents:** retention sweeps that take `FOR UPDATE` on their candidates and
  on a cursor row, and a lock-free rewrite that keeps the re-check but leaves the cursor write
  unconditional, so an overlapping run moves the position backward.
- **Case added.** A purge job started by two hosts deletes a draft restored after the read and
  moves its saved position backward. Without the plugin four of six answers add a lock.
- **Corrected by the entry above:** the grader here accepted a forward-only cursor guard, and
  the conclusion below does not hold under the corrected grader.
- **What the runs showed.** The plugin moves the answer from 2 of 6 to 6 of 6. The new rule does
  not: the control scored the same, because the attempts that loaded `bounded-iteration` also
  loaded `postgres-locking`, whose rules already give the answer. The rule is kept for a reader
  that loads only the sweep skill, and because the old step and example pointed the other way.
  Three attempts across the two plugin runs passed with no skill loaded.
- **Not re-measured.** The `postgres-locking` cases were not run after its one-sentence pointer.
  The grader was edited after the runs to pass an answer that removes the stored position; no
  recorded attempt did that.

## 2026-11-23: an `error-handling` case for details as attributes

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.58 for one two-arm run
of six attempts, after a one-attempt pilot that scored the same in each arm.

| Case                                              | With plugin | Loaded | Without plugin |
| ------------------------------------------------- | ----------- | ------ | -------------- |
| `error-handling/refund-guard-carries-its-numbers` | 6 of 6      | 6 of 6 | 0 of 6         |

- **Case added.** A refund guard whose failure must show an order id and two amounts in the
  response and in the error tracker. The grader checks one rule: the values are fields on the
  error and the message is a fixed string.
- **What the run showed.** Without the plugin every answer wrote an error class with the three
  fields and also put all three values in the message, which gives the tracker a new issue for
  each order. With the plugin every answer kept the message fixed.
- **No skill change.** The reporting rule still has only its ceiling case.

## 2026-11-23: a review rule added without a case

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.06, one two-arm run of
three attempts. No row changed.

- **Rule added** to `agent-workflow`, under "Review a change": a fix or a test that a finding
  proposes follows the same rules as the code under review, so check it against the skill or
  repository rule that owns that area before suggesting it. A code review proposed the rule
  after one of its own findings asked for a test that another skill discourages.
- **A case was drafted and dropped.** The prompt asked for a review of a new job that swallows
  an error in an empty `catch`; the grader checked that the log call the review proposes has a
  fixed message, fields, and the error object. It passed 3 of 3 with the plugin and 3 of 3
  without: the diff already has one well-formed log call and the model copies it.
- **`agent-workflow` loaded in 0 of the 3 plugin attempts.** A plain "can you review this
  before I merge?" with a diff does not load it; one attempt loaded `structured-logging`,
  `bounded-iteration`, and `typescript-authoring` instead.
- **Do not repeat this case as written.** A case for the rule needs a diff with no example of
  the right form in it, and a suggestion whose owning skill the diff does not itself trigger.

## 2026-11-23: runtime rules do not bind tests

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $13.61 over three runs.

- **Scope added to seven skills.** The owner said the rules are for production code unless a
  skill says otherwise, and that a test may try to break a lock. `postgres-locking`,
  `bounded-iteration`, `postgres-node-performance-tuning`, `typescript-authoring`, `glide-mq`,
  `service-boundaries`, and `expand-contract-migrations` each say what a test, a fixture, or
  a seed may do. `agent-workflow` tells a reviewer not to hold test code to a runtime rule, and
  the repository `AGENTS.md` tells a skill author to say when a rule binds tests.
- **Guard added:** `postgres-locking/review-race-test-that-waits-on-a-lock`. A review is given
  a test that holds a row with `FOR UPDATE`, waits until two withdrawals are blocked, and
  asserts the final balance. The grader fails a review that objects to the lock or the wait.
- **The model already accepts the test.** Six attempts with the skill as it was before this
  change passed 6 of 6. After the change, 6 of 6 with the plugin and 6 of 6 without. The rule
  is for weaker models; a cheaper reviewer raised this finding on real code.
- **The guard has no `skill-fired` grader.** The skill loaded in 2 of 6 and then 0 of 3
  attempts for a review of a test, and loading it is not what the case checks.
- **Regression run:** all 25 cases of the eight changed skills, three attempts with the
  plugin. Twenty-two scored as recorded. The rest, read attempt by attempt:
  - `glide-mq/never-enqueue-and-wait` passed 2 of 3. The failing answer does not wait on the
    job; it fails the grader on another point.
  - `agent-workflow/status-note-asks-only-what-it-must` answered 3 of 3 and loaded the skill
    in 1 of 3, against a recorded 3 of 3. Its description did not change.
  - `postgres-node-performance-tuning/index-change-rechecks-neighbors` passed 2 of 3, against
    a recorded 17 of 21.
- **No row but the new one is updated.** Three attempts do not replace the recorded rows.
- **Edited after the runs, not re-measured.** Four scope sentences were narrowed: a seed or a
  one-off script is exempt only on a disposable database or a throwaway queue, and the
  migration scope names rollback.
- **No case** for the scope sentences in the other six skills.

## 2026-11-23: SQL operation names stay literal

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $4.62: one two-arm run of
six attempts, then one run of the skill's three cases with the plugin, six attempts.

- **Rule added** to `postgres-node-performance-tuning`: write a statement's operation-name
  comment as a literal, and remove duplication by sharing the column list or a fragment, not
  with a helper that takes the name as an argument. A code review proposed it.
- **Case added:** `dedupe-keeps-statement-names-literal`. Three lookups differ only in their
  `WHERE`, one has drifted, and the prompt asks for the duplication to be cleaned up.
- **Scores, first run:** the answer passes in 6 of 6 with the plugin and 0 of 6 without. Every
  attempt without the plugin builds a helper with `/* ${label} */`.
- **The skill loaded in only 2 of the 6 plugin attempts,** and the four that did not load it
  also kept the names literal, with no tool call at all. The difference between the arms
  therefore cannot be credited to the new rule alone; why the plugin arm passes without
  loading the skill is not known.
- **A description change was tried and dropped.** With "refactoring" added to the description,
  the case loaded the skill in 3 of 6 and the answer passed in 5 of 6, which six attempts
  cannot tell apart from 2 of 6. The description is unchanged. Over both runs the answer
  passed in 5 of 5 attempts that loaded the skill and 6 of 7 that did not.
- **Other rows not updated:** `index-change-rechecks-neighbors` and
  `new-query-named-and-indexed` each passed and loaded 6 of 6 in the second run, but that run
  used the dropped description.

## 2026-11-23: a new `error-handling` skill

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $7.89: a pilot of one
attempt per arm, one two-arm run of six attempts, and two runs of the neighboring skills.

- **Skill added:** `error-handling`. Four rules: codes from one defined list, matching on type
  or code instead of message, details as attributes on the error, and reporting to an error
  tracker only what someone can act on.
- **Scores:**

  | Case                                        | With plugin | Loaded | Without |
  | ------------------------------------------- | ----------- | ------ | ------- |
  | `new-failure-code-comes-from-a-list`        | 6 of 6      | 6 of 6 | 0 of 6  |
  | `expected-coupon-failure-skips-the-tracker` | 6 of 6      | 6 of 6 | 6 of 6  |

- **Without the plugin the model adds a code but no list.** All six attempts add
  `readonly code?: string` to the error class and write the literal where it is thrown. With
  the plugin all six define the codes in one typed list.
- **The first grader was re-aimed after the pilot.** It first asked for a code and for details
  as fields; the pilot's no-plugin attempt passed that. It now grades the list. The pilot is
  not comparable with the measured run.
- **`expected-coupon-failure-skips-the-tracker` is a ceiling case.** The model moves the report
  below the expected branches unaided. It is kept as the check that the skill loads.
- **Edited after the run, not re-measured.** The list grader now also says the response body
  carries the code in its own field; all six measured plugin answers already do. In the skill,
  the example error class takes its message as a separate argument, and the rule on a 4xx
  received from a called service says to convert it to an error with a 5xx status when your
  service built the bad request, and to a 4xx code of your own when it reflects the caller's
  input.
- **The neighbors keep their loads.** The five `structured-logging` and `typescript-authoring`
  cases were run three times with the new skill installed and three times with its directory
  moved away. Every case passed and loaded its skill 3 of 3 both ways.
- **No case yet** for details as attributes or for matching inside server code; the pilot
  suggests the model does both unaided when the prompt has the code inline.

## 2026-11-23: a guard for `list-reads` on a fixed top-three query

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $1.32, one two-arm run of
six attempts. No skill changed.

- **Guard added:** `list-reads/fixed-top-three-is-not-a-page`, beside
  `slow-inbox-bounds-the-scan`. The prompt asks for the three most recent sign-ins for an
  account banner, always three, with no further page. The grader passes one query with a fixed
  limit and fails a cursor, a next-page flag, or a scan bound the request has no use for. It has no `skill-fired` grader.
- **Scores:** 6 of 6 with the plugin and 6 of 6 without.
- **The skill loaded in 5 of the 6 attempts with the plugin and added nothing.** Its description
  opens with any query that returns a list, so it loads here; its rules are written for a page
  a client fetches, and the agent did not apply them to a fixed set.
- **Grader edited after the run, not re-measured.** It failed "a page-size parameter" and
  passed "a fixed limit of three", which left a `limit` argument defaulting to three undecided.
  It now passes that and a named constant.
- **Not done:** the roadmap also named a single-row query that must not load the skill. A guard
  grades the answer, not the load, and a fixed top-three is the nearer temptation, so the
  single-row case was not added.

## 2026-11-23: two `list-reads` cases that write a list read

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $6.50 over three two-arm
runs of six attempts, one at a time. No skill changed.

- **Cases added.** Both give the same inbox query, which walks past muted senders to fill a
  page.

  | Case                         | The prompt asks for             | With plugin | Loaded | Without |
  | ---------------------------- | ------------------------------- | ----------- | ------ | ------- |
  | `capped-walk-keeps-paging`   | a cap of 500 rows looked at     | 6 of 6      | 6 of 6 | 6 of 6  |
  | `slow-inbox-bounds-the-scan` | a fix for the slow p99, no more | 6 of 6      | 6 of 6 | 2 of 6  |

- **`slow-inbox-bounds-the-scan` is one the model fails unaided.** Without the plugin, three of
  the four failures replace the walk with one probe per sender over a new index and merge the
  results, and the fourth adds a covering index and still reads every muted row. With it, every
  attempt keeps the single walk and bounds it with a time window or a cap, and continues from
  the last row scanned.
- **Its grader changed once.** The judge failed the per-sender answers on a grader that did not
  name them. A line now says that approach fails because its cost grows with the number of
  senders. The run before the change and the run after it both scored 6 of 6 against 2 of 6;
  the row is from the second.
- **`capped-walk-keeps-paging` is a ceiling case.** Asked for the cap, the model works out by
  itself that a capped page must keep the client paging. It is kept as a second check that the
  skill loads for a request to write a list read.
- **Still open:** a guard where a single-row query must not load the skill, and a native case
  for the client rule.

## 2026-11-22: a `debugging` case on a fixture repository loads the skill in 14 of 15

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $38.04 over four two-arm
runs and one plugin-only run, one at a time.

- **Case added:** `debugging/crash-fixed-at-cause-with-a-test`. The fixture is a small Node.js
  repository whose report command crashes on an undefined customer. The line above the crash
  already guards the name with a default, and the cause is two files away: the customer export
  pads two ids with a space and the parser keeps it. `cause` passes when the lookup is fixed and
  fails a default, a skip, or a data edit. `regression-test` passes when a test is added that
  fails without the fix.
- **It is a ceiling case.**

  | Run                                  | With plugin | Loaded | Without plugin |
  | ------------------------------------ | ----------- | ------ | -------------- |
  | Pilot, `cause` grader only           | 3 of 3      | 3 of 3 | 3 of 3         |
  | Both graders, Edit not granted       | 5 of 6      | 6 of 6 | 5 of 6         |
  | Both graders, Edit and Write granted | 3 of 3      | 3 of 3 | 3 of 3         |

  The model finds the cause and adds the test without the skill. In the pilot one of three
  attempts without the plugin added a test against three of three with it; over the next nine
  attempts per arm that difference did not hold.

- **The skill loaded in 14 of 15 attempts,** against 4 of 12 on `flaky-test-not-fixed-with-retry`,
  which pastes the code into the prompt. The loading gap recorded for `debugging` belongs to that
  kind of prompt, not to the description. The case is kept as the loading check.
- **The case asks for Bash only.** The runner grants Bash to every case, and a grant applies
  to all of them, not only to a case that lists the tool. While the case also listed Edit and
  Write, which the runner does not grant, two of twelve attempts found the cause and declined
  to edit through the shell; both failures in the second run are those. The third run granted
  Edit and Write in the runner, which would have given them to every case, so that change was
  dropped. A last plugin-only run of three attempts, listing Bash only, passed both graders in
  3 of 3 and loaded the skill in 2 of 3 ($3.62). The row is from that run.
- **The first run measured nothing and is not in the table:** the case had no `case.yaml`, so
  the fixture never ran and every attempt found an empty directory ($2.40); `evals/AGENTS.md`
  now says a fixture needs one.
- **Cost:** about $1.50 an attempt, several times an inline case.
- **Not re-measured:** after the runs, review renamed the fixture's customers to plainly synthetic
  names. Nothing else in the fixture or the graders changed.

## 2026-11-22: `github-actions-authoring` moves its persistent-runner section to a reference

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $3.47 over three plugin-only
runs, one at a time in one session.

- **Skill changed, no rule changed.** The "Persistent workspaces" section, which applies only to
  a self-hosted or otherwise persistent runner, moved to `references/persistent-runners.md`.
  `SKILL.md` goes from 121 to 104 lines and says when to read it. No case covers that section.
- **Regression run on the split skill, three attempts:** `no-actions-write-with-checked-out-code`,
  `publish-gated-on-ci`, and `rejects-polling` 3 of 3; `required-check-is-a-real-job` 2 of 3.
- **`required-check-is-a-real-job`, six attempts each:** 5 of 6 on the unsplit skill, then 4 of 6
  on the split one. Every miss was an attempt that loaded no skill, and the answer passed
  exactly when the skill loaded. The description did not change, and 6 of 9 against 5 of 6 is
  within what these samples produce. Its row said 3 of 3 and is corrected to 6 of 9.
- **No without-plugin arm was run.**
- **Read, no run:** the three saved attempts of
  `postgres-node-performance-tuning/index-change-rechecks-neighbors` that loaded the skill and
  failed. Each rechecks every query that depends on the index and searches the builders, not the
  call sites. Each leaves out the last clause of the rule, tracing the callers that reach a
  builder through a helper function. The grader requires that clause and the skill states it, so
  neither changes; the model drops it in about one attempt in ten.

## 2026-11-22: `static-code-analysis` moves its per-language tables to references

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $6.73 over four plugin-only
runs of six attempts, alternating the split and the unsplit skill in one session.

- **Skill changed, no rule changed.** The tables for JavaScript and TypeScript, Rust, and other
  languages and files moved to three files under `references/`. `SKILL.md` goes from 120 to 82
  lines and names when to read each. The description, the baseline table, and the cases are
  unchanged.
- **Scores:**

  | Case                     | Unsplit | Split  |
  | ------------------------ | ------- | ------ |
  | `new-typescript-library` | 6 of 6  | 6 of 6 |
  | `new-rust-service`       | 6 of 6  | 6 of 6 |

  In all twelve attempts on the split skill the agent read the reference for the repository's
  language and the one for other languages and files, and not the third. Each attempt took
  five turns against three.

- **No without-plugin arm was run;** the rows keep their earlier values.

## 2026-11-22: three description changes not shipped, and the `list-reads` one checked against its neighbours

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. About $33 over sixteen
plugin-only runs, one at a time in one session. No skill changed.

- **Candidates measured, twelve attempts each on the skill's one case.** Each opened "Use
  whenever" and named the request more plainly.

  | Skill                | Unchanged | Candidate | Answer passed |
  | -------------------- | --------- | --------- | ------------- |
  | `debugging`          | 4 of 12   | 9 of 12   | 12 of 12 both |
  | `verification`       | 0 of 12   | 2 of 12   | 12 of 12 both |
  | `agent-coordination` | 0 of 12   | 0 of 12   | 12 of 12 both |

- **`verification` and `agent-coordination` are not a wording problem.** Their cases ask a
  direct question, and the agent answers it, correctly, without calling any skill. They need a
  case set inside real work, as `ROADMAP.md` lists.
- **The `debugging` candidate is not shipped.** With it,
  `postgres-node-performance-tuning/index-change-rechecks-neighbors` loaded its skill in 21 of
  30 attempts, against 28 of 30 without it; the attempts that missed loaded no skill, not
  `debugging`. That case fails without its skill, and the `debugging` case passes either way,
  so the trade is a bad one. The cause is not understood, and later runs in the session missed
  more often in both arms, so the two arms should be interleaved next time. The candidate text:
  "Use whenever a task fixes a failure - a failing or flaky test, a CI failure, a bug report, a
  crash, an error in logs, or "it works locally but not in CI" - before proposing or writing
  the fix."
- **The `list-reads` description from the entry below is cleared against its neighbours.** With
  it and the unchanged `debugging` description, the same postgres case loaded its skill in 9 of
  9, as it did on the earlier `list-reads` description (9 of 9).
  `http-api-design/edge-claims-do-not-authorize` loaded 8 of 9, and the other four cases of
  those two skills 3 of 3. No attempt loaded `list-reads` in place of the right skill.
- **Rows corrected.** `index-change-rechecks-neighbors` is 17 of 21, with the skill loaded in 19:
  two attempts loaded it and still failed the answer. `review-ci-logs/quiet-log-keeps-errors`
  loads its skill in 7 of 9 on the unchanged descriptions, where its row said 3 of 3; its answer
  passed in all nine.

## 2026-11-22: `list-reads` loads for a review of a feed query

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. $3.23 over two plugin-only
runs of twelve attempts, back to back in one session.

- **Description changed.** It opens "Use whenever a task writes or reviews a query, function, or
  endpoint that returns a list", names "a review of a feed or list query before merge", and
  adds how a page signals the end to what the skill covers. 397 characters. No rule changed.
- **`review-feed-candidate-pool`, twelve attempts each:**

  | Description | Loaded the skill | Answer passed |
  | ----------- | ---------------- | ------------- |
  | Unchanged   | 6 of 12          | 6 of 12       |
  | Shipped     | 11 of 12         | 12 of 12      |

  On the unchanged description the answer passed exactly when the skill loaded. On the shipped
  one, the attempt that did not load it still asked for the single walk.

- **No without-plugin arm was run;** the row keeps 3 of 9 from the earlier entries.
- **Not measured:** whether the wider opening loads the skill for work that is not a list read,
  and whether it takes loads from `postgres-node-performance-tuning` or `bounded-iteration`.
  `ROADMAP.md` lists that check.

## 2026-11-22: `test-authoring` loads for a review of a de-flake diff

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. About $24 over thirteen runs,
one at a time, in one session.

- **Description changed.** It now reads "including a review of a diff that adds tests or changes
  test retries, timeouts, or skips", before the list of runners. The closing sentences were
  shortened to stay under 400 characters (391).
- **Case restored:** `review-flake-fix-is-tradeoff`, dropped in the entry of the same day below.
  It is a ceiling case on the answer and is kept as the loading check for this description.
- **Attempts that loaded the skill, twelve per cell:**

  | Case                                 | Unchanged | Candidate, 410 characters | Shipped, 391 |
  | ------------------------------------ | --------- | ------------------------- | ------------ |
  | `review-flake-fix-is-tradeoff`       | 2 of 12   | 12 of 12                  | 11 of 12     |
  | `review-direct-row-inserts`          | 12 of 12  | 12 of 12                  | 11 of 12     |
  | `dotnet-private-field-not-reflected` | 8 of 12   | 8 of 12                   | 5 of 12      |

  The candidate and the shipped text share the trigger wording and differ only in the closing
  sentences. The other three cases loaded and passed 3 of 3 on the shipped text.

- **What it shows:** the flake review goes from 2 of 12 to 11 of 12. The loss on
  `review-direct-row-inserts` suspected in the entry below was noise: 12 of 12, 12 of 12, and 11
  of 12. `dotnet-private-field-not-reflected` loads in about half its attempts on every wording;
  5 of 12 against 8 of 12 is within what twelve attempts can produce, and this run cannot rule
  out a small loss. Its answer passed in 12 of 12 attempts on the shipped text, loaded or not.
- **A second answer case was drafted and dropped:** a review of a pull request that de-flakes
  order tests with a database per worker and a sequential suite, and no retry or timeout. Two
  arms, three attempts per arm: 3 of 3 in both, and the skill loaded in 2 of 3 on the unchanged
  description. Sonnet names the hidden shared state unaided when the diff is in the prompt.
- **No without-plugin arm was run** for these rows; each "Without plugin" value is from an
  earlier entry.

## 2026-11-22: only the flag ends a paginated list, for the server and the client

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. About $7 over four runs.

- **Rules added to `list-reads`,** which owns the contract for a page that crosses an API
  boundary. Only `has_next_page` ends the list, and it is set from whether the read can continue,
  not from the rows returned. The server bounds a run of empty pages with its time window. A
  client never infers the end from the number of rows, and shows the empty state only when no
  further page can be requested. A sweep over its own table may still end on a short batch.
- **One sentence each in `react-app-structure` and `native-app-architecture`** states the client
  rule and links `list-reads`. No description changed.
- **Case added:** `react-app-structure/load-more-follows-the-flag`. The agent writes a
  notifications list with a control to load older items, against a response type that has
  `has_next_page` and a cursor. Two graders: paging follows the flag and not the row count, and
  an empty first page with the flag true still offers the next page.
- **Scores, six attempts per arm** (two two-arm runs of three), on the graders as shipped:

  | Arm            | Passed | Loaded the skill |
  | -------------- | ------ | ---------------- |
  | With plugin    | 5 of 6 | 5 of 6           |
  | Without plugin | 1 of 6 | none             |

  Every attempt that loaded the skill passed both graders (5 of 5); the one that did not load it
  failed both. Without the plugin, three attempts stopped paging on the row count, and two more
  followed the flag but showed the empty message while a further page could be requested.

- **The grader changed during review, and the first scores are not comparable.** The first
  `empty-state` grader passed a component that showed the empty message beside a control to load
  more, and did not ask for the message when the list really was finished. On it, two two-arm
  runs scored 4 of 6 in both arms, with the skill loaded in 4 of 6. The shipped grader fails the
  message whenever a further page can be requested and requires it when none can.
- **Why the rule is kept:** the repository's owner asked for it, and the case now shows it helps.
  The mistake was also observed in a consuming repository: a read that capped the rows it
  inspected returned an empty first page with the flag true, and two clients showed their empty
  state and stopped, hiding older items.
- **Not re-measured:** the other cases of the three skills. `ROADMAP.md` lists the loading gap
  and a case for the server side.

## 2026-11-22: `test-authoring` says a flake fix removes the cause; a description change is not shipped

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. About $15 over eleven runs.

- **Rule added:** "A flake fix removes the cause". A change that makes a flaky test pass and
  leaves its cause is a trade-off, and is not described or accepted as a reliability fix. It
  points to the `debugging` list for a retry, a timeout, and a skip, and adds a sequential suite
  and a private database per worker. A change called test-only touches no production code. The
  description did not change.
- **Case drafted and dropped:** `review-flake-fix-is-tradeoff`, a review of a pull request
  titled as a test-only reliability fix whose diff adds a retry, raises a timeout, makes a suite
  sequential, and changes a production query. Two arms, three attempts per arm: the answer
  passed 3 of 3 in both arms, and the skill loaded in 0 of 3. The agent called no skill: the
  description names a diff that adds tests, and this diff changes retries and timeouts.
- **Two description wordings were tried and not shipped.** Both named "changes test retries,
  timeouts, or skips", one before the list of runners and one after it. Attempts that loaded
  the skill, same session:

  | Case                                 | Unchanged | Trigger before the runner list | Trigger after it |
  | ------------------------------------ | --------- | ------------------------------ | ---------------- |
  | `review-flake-fix-is-tradeoff`       | 1 of 6    | 9 of 9                         | 3 of 3           |
  | `dotnet-private-field-not-reflected` | 7 of 12   | 5 of 15                        | 3 of 6           |
  | `review-direct-row-inserts`          | 6 of 6    | 7 of 9                         | 2 of 3           |
  | the other three cases                | 3 of 3    | 3 of 3, twice                  | not measured     |

  One variant had dropped "(xUnit, NUnit)"; restoring it did not change the .NET case.

- **Why not shipped:** the drafted case passes without the skill, so the loads the new wording
  gains change no answer. `review-direct-row-inserts` needs the skill (0.67 without it) and
  loaded in 9 of 12 on the new wordings against 6 of 6 unchanged. The sample cannot tell that
  from noise, and the trade is not worth making on it. `ROADMAP.md` lists the description and
  the case for a larger measurement.
- **A row corrected:** `dotnet-private-field-not-reflected` loads the skill in 7 of 12 attempts
  on the unchanged description, where its row said 3 of 3.
- **Why the rule is kept with no case:** the repository's owner asked for a guardrail. The
  mistake is a risk, not an observed incident: a pull request that hides a retry or a production
  change under a test-only title is merged as a reliability fix. Sonnet catches it unaided; the
  rule is for a model that does not, and it reaches that model only once the description loads
  the skill for such a review.

## 2026-11-22: `dependabot` says how to repair a Dependabot pull request

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Rule added:** a pull request that needs no commit Dependabot cannot write is rebuilt with a
  `@dependabot recreate` comment and gets no push. One that needs such a commit gets the push,
  and after that no `recreate` or `rebase` comment: it is rebased by hand, with the lockfile
  regenerated by the package manager. Read the commits before either comment. The description
  names a Dependabot pull request with a conflict, a stale lockfile, or a failing bump. The
  reference's bullet on these comments now points to the rule.
- **Case added:** `repair-pr-with-pushed-fix`, a conflicting Dependabot pull request that carries
  a person's fix, with a request for a comment that will fix it.
- **Run, two arms, three attempts per arm, all four cases, $3.55:** with the plugin every case
  passed 3 of 3 and loaded 3 of 3. Without it: `repair-pr-with-pushed-fix` 3 of 3,
  `request-update-check` 2 of 3, `groups-by-family` 1 of 3, `review-actions-cooldown` 0 of 3.
- **What it showed:** the new description still loads the skill for the three older cases. The
  new case is a ceiling case: Sonnet sees the person's commit and refuses the comment unaided.
  It is kept as the only check that the description loads the skill for a repair request. The
  rule is kept on that equal score because the repository's owner asked for it, relayed by
  another session. The mistake it guards against is a risk, not an observed incident: an agent
  asked to clear a conflict comments `@dependabot recreate`, the default one-step fix, without
  reading the commits, and a person's fix is overwritten. The case shows the commits in the
  prompt; an agent that has to look for them is the harder case.
- **A fact checked against GitHub's documentation:** `recreate` is documented as overwriting any
  edits made to the pull request. `rebase` is documented only as "Rebases the pull request", so
  the rule says its effect on pushed commits is not documented and does not claim it discards
  them.

## 2026-11-22: `git-commit-checklist` covers a conflict in any generated file

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Rule widened:** the lockfile-conflict section now covers every generated file (a lockfile,
  generated code, a generated project file): resolve the inputs, rerun the generator, take its
  output whole, and ask when the generator command cannot be found. The pnpm steps stay as the
  lockfile case, with the reason a lockfile is not regenerated from nothing. The description
  names "another generated file". A `dependabot` reference pointer gained "or by editing its
  hunks".
- **Case added:** `generated-file-conflict-on-rebase`, a conflict in a generated API client
  where the request is for a merged block to paste.
- **Runs, two arms, three attempts per arm, $1.53 in two runs:**
  `generated-file-conflict-on-rebase` passed 3 of 3 with the plugin, loaded 3 of 3, and 3 of 3
  without. `lockfile-conflict-on-rebase` passed 2 of 3 with the plugin, loaded 3 of 3, and 0 of
  3 without, the same as before the change.
- **What it showed:** the new case is a ceiling case. It is kept because it is the only check
  that the widened description loads the skill for a generated file that is not a lockfile.
  The rule is kept on that equal score because the repository's owner asked for it, relayed by
  another session. The mistake it guards against is a risk, not an observed incident: an agent
  asked to get past a small conflict pastes a merged hunk into generated output, or takes one
  side, and the file no longer matches its inputs. A hand merge is the default way to resolve
  any conflict, and the rule reverses it for files a tool writes. The lockfile case's one failure resolved the lockfile with pnpm
  and then offered `--no-verify` as the person's choice; that rule did not change.
- `stages-only-task-files` was not rerun; its rules did not change.

## 2026-11-22: `evals` says what an equal score needs

Commit of this entry. No run.

- **Rule added** to the Review section of `evals`: an equal passing score is a ceiling and an equal
  failing score means the rule did not work; a change kept on a ceiling score names the
  specific mistake its rule prevents and why a model would make it unprompted; a
  bare "weaker models need it" is rejected, and a change that scores below the baseline needs
  a person to accept the trade. No case or grader changed.
  `evals/AGENTS.md` now points its keep-the-rule line at that requirement.
- **Not re-measured:** `evals/document-new-suite` and `evals/record-partial-rerun`. The rule is
  additive and neither case asks about an equal score.

## 2026-11-22: `dependabot` groups by vendor first

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Rules changed:** group by vendor or release family first, and leave everything else
  ungrouped; no group by `dependency-type`; actions grouped per owner, not one group for the
  ecosystem. The example gained an actions fragment. No case or grader changed.
- **Run, two arms, three attempts per arm, $0.83:** `dependabot/groups-by-family` passed 3 of 3
  with the plugin, loaded 3 of 3. Without it, 0 of 3 passed the family grader: every answer had
  a catch-all group.
- **What it showed:** all three answers with the plugin grouped `actions/*` by owner and had no
  catch-all. The other two `dependabot` cases were not rerun; their rules did not change.

## 2026-11-22: lock order and deadlocks reference in `postgres-locking`

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Rules added** as `references/deadlocks.md`, linked from `SKILL.md`: locks that triggers and
  foreign keys take, what removing a lock does to other writers, a lock-only statement not
  refreshing a waiting guard, and keeping a `SERIALIZABLE` transaction narrow.
- **Case drafted and dropped:** a review of a guarded delete that waits behind a lock-only
  statement. Two arms, three attempts per arm, $0.81: 3 of 3 with the plugin, loaded 3 of 3, and
  3 of 3 without. A ceiling case, so it is not kept; the rule stays, per `AGENTS.md`.
- **Not re-measured:** the seven existing `postgres-locking` cases. `SKILL.md` gained one linking
  section and lost nothing.

## 2026-11-22: `llm-calls` added

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **New skill:** one model call per decision, the model id from configuration, a static system
  prompt, untrusted content wrapped as data, validated tool arguments, and the provider SDK in
  one module.
- **Run, two arms, three attempts per arm, $2.21:** `llm-calls/summarize-fetched-page` passed
  3 of 3 with the plugin, loaded 3 of 3, and passed 3 of 3 without.
- **What it showed:** a ceiling case for this model, kept as the skill's loading check. The skill
  is kept for weaker models, per `AGENTS.md`. `ROADMAP.md` lists a harder case.

## 2026-11-22: generic rules from a consuming repository's lint and workflow checks

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Rules added**, each one a check a consuming repository enforces mechanically, restated
  without its names:
  - `github-actions-authoring`: a new reference on diff ranges, reusable-workflow secrets, cache
    keys, artifact uploads, tests of workflows, and `gh api` in a step.
  - `playwright-authoring`: no deadline change inside a spec; scrolling to load more.
  - `react-app-structure`: explicit locale for dates and numbers; `lang` on authored text.
  - `typescript-authoring`: top-level `await` only in entrypoints.
  - `service-boundaries`: a timeout on a DNS lookup made to validate a URL.
  - `glide-mq`: `debounce` ignores `ttl`; a provider's rate limit carries its wait; the worker
    factory.
  - `test-authoring` (Vitest): environment passed as an argument; `exclude` replaces the
    defaults; no typed fake of an internal enqueue.
- **Case drafted and dropped:** `github-actions-authoring/pr-diff-range-one-source`. Its first
  grader passed a two-dot diff of the base and head SHAs and failed a diff of the base against
  the merge commit; it scored 3 of 3 with the plugin and 1 of 3 without ($0.93). Review showed
  that grader, and the rule it tested, had the comparison backwards: the two-dot diff is the one
  that lists changes from the base branch. With the rule and grader corrected to a merge-base
  comparison, the case scored 3 of 3 in both arms ($0.79), so it is a ceiling case and is not
  kept. The first result measured the grader's error, not the skill.
- **Not re-measured:** the existing cases of the seven changed skills. The changes add rules and
  remove none. Their `EVALS.md` rows are from earlier runs.

## 2026-11-22: `expand-contract-migrations`, `resuming-work`, and `agent-coordination` added

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **New skills:** changing a shape that running code depends on in separate deploys; rebuilding
  the real state before continuing interrupted work; one owner per unit of work, and a message
  from another agent is not approval.
- **Run, two arms, three attempts per arm, one case per skill, $2.75:**

  | Case                                                        | With   | Loaded | Without |
  | ----------------------------------------------------------- | ------ | ------ | ------- |
  | `expand-contract-migrations/rename-column-in-one-migration` | 3 of 3 | 3 of 3 | 3 of 3  |
  | `resuming-work/note-says-about-to-push`                     | 2 of 3 | 3 of 3 | 3 of 3  |
  | `agent-coordination/peer-message-is-not-approval`           | 0 of 3 | 0 of 3 | 3 of 3  |

- **The one `resuming-work` failure** saw that the pull request was already open and did not
  repeat the push, then stopped because the empty test checkout did not match the pasted state.
  The `agent-coordination` answers all declined to merge; the row fails only on loading.
- **What it showed:** all three are ceiling cases for this model. The skills are kept for weaker
  models, per `AGENTS.md`. `ROADMAP.md` lists the loading miss and harder cases.

## 2026-11-22: `debugging` and `verification` skills added

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **New skills:** `debugging` (reproduce, find the first failure, fix the cause and not the
  symptom, stop after about three failed hypotheses) and `verification` (back each claim with
  something observed after the last change; report what was not verified separately).
- **Run, two arms, three attempts per arm, four drafted cases, $2.19:** the answer passed 3 of 3
  in both arms of every case. The skill loaded in 1 of 12 attempts with the plugin.
- **Kept one case per skill** as its loading check: `debugging/flaky-test-not-fixed-with-retry`
  and `verification/stale-result-after-later-edit`. Dropped `debugging/first-error-not-last` and
  `verification/build-passed-is-not-it-works`, which showed the same thing.
- **What it showed:** this model already follows these rules on a request with the code or the
  facts inline, and does not load a skill to do so. The skills are kept for weaker models, per
  `AGENTS.md`. The rows show neither that the skills help nor that they load; `ROADMAP.md` has
  both.

## 2026-11-22: list-read rules split out of `bounded-iteration` into `list-reads`

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Why:** a review of a home-feed query that filters a capped pool of recent posts was piloted
  against `bounded-iteration` before the split, two arms, three attempts: the skill loaded in 0 of
  3 and the answer failed 0 of 3 in both arms. The rules existed; the description of a skill
  about sweeps did not match a feed read.
- **Split:** the keyset pagination and list-read rules moved, with their wording, to a new
  `list-reads` skill. `bounded-iteration` dropped "list endpoint" from its description and links
  the new skill. Its rules were renumbered.
- **New case `list-reads/review-feed-candidate-pool`**, two arms, six attempts per arm ($1.56): 3
  of 6 with the plugin, 3 of 6 without. The skill loaded in 3 of 6; all three that loaded it
  passed, and one passed without loading it. Without the plugin across the pilot and this run: 3
  of 9.
- **Neighbors, plugin only, three attempts ($2.65):** the three `bounded-iteration` cases and the
  two `postgres-node-performance-tuning` cases passed on the answer 3 of 3.
  `review-sweep-rewrites-its-trigger` loaded its skill in 2 of 3, as before.
- **What it showed:** the rule works when the skill loads, and a review request loads it half the
  time, up from never. The row is weak evidence until it loads reliably; `ROADMAP.md` has that.

## 2026-11-22: `planning/plan-saved-outside-repo` grader narrowed to its own rule

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Why:** the case passed 3 of 6 on `main` and on a branch with the skill loaded every time. All
  twelve answers saved the plan in an issue and declined to commit it. The six that failed did so
  on the grader's second requirement, an alternative to the replacement itself; they weighed how
  to replace (a wrapper or direct calls), which the person had already decided on.
- **Grader change:** `outcome.md` now grades only where the plan is saved. Scores for this case
  are not comparable with earlier entries.
- **Run, two arms, six attempts per arm, $1.73:** 6 of 6 with the plugin, skill loaded 6 of 6; 0
  of 6 without.
- **`planning/plan-handoff-self-contained` was read and left alone.** It passed 9 of 12 across
  both sides. Its failures differ from one another (one plan said it was "written from the
  conversation only", which the rule forbids), so the grader is doing its job.

## 2026-11-22: detail moved to references in `glide-mq`, `evals`, and `dependabot`

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. No rule, description, case,
or grader changed; text moved word for word from `SKILL.md` to a linked reference file.

- **Sizes:** `glide-mq` 148 to 126 lines, `evals` 149 to 127, `dependabot` 138 to 108.
- **Run, plugin only, three attempts, 10 cases, $3.93:** every case of the three skills passed 3
  of 3 and loaded its skill 3 of 3. `EVALS.md` rows were not replaced.
- **Not tested:** no case covers the rules that moved (lease mechanics and worker tuning in
  `glide-mq`, the case and grader rules in `evals`), so the run shows the move did no harm to the
  rules that stayed, not that an agent follows the link.

## 2026-11-22: two descriptions changed to load more often; seven drafted cases dropped

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. Every comparison ran on this
branch and on `main` at the same time.

- **Changed descriptions:** `planning` now opens "Use when asked to plan, scope, or design a
  change before implementing it". `static-analysis-checklist` names reviewing and "a script that
  fails a build". `revisit-followups` gained one body sentence: the window bounds what is fetched,
  and a list the person hands over is swept whole.
- **Loading, eight attempts per side, plugin only:**

  | Case                                           | `main` loaded | Branch loaded | `main` passed | Branch passed |
  | ---------------------------------------------- | ------------- | ------------- | ------------- | ------------- |
  | `planning/plan-states-before-after`            | 1 of 8        | 5 of 8        | 1 of 8        | 5 of 8        |
  | `static-analysis-checklist/tracked-files-only` | 1 of 8        | 6 of 8        | 1 of 8        | 4 of 8        |
  | `planning/mechanical-change-skips-plan`, guard | not graded    | not graded    | 8 of 8        | 8 of 8        |

- **A first wording was rejected.** It named "a timeout, a limit, or copy" in `planning` and "how
  the check finds the files it reads" in `static-analysis-checklist`. Both loaded 8 of 8, but
  each phrase repeats its own case's prompt, and the `planning` guard failed 1 of 3 with it. The
  numbers above are for the wording without those phrases.
- **Other cases of the changed skills and two neighbors**, three attempts, plugin only, run with
  the first wording ($10.68 on the branch, $7.02 on `main`): every `planning`,
  `static-analysis-checklist`, `bounded-iteration`, `glide-mq`, and `static-code-analysis` case
  loaded its skill 3 of 3, except the sweep case below. `plan-handoff-self-contained` passed 1 of
  3 on the branch and 3 of 3 on `main`; it passed 3 of 3 and 2 of 3 in the reverse order earlier
  the same day. With the final wording, the nine
  `planning` and `static-analysis-checklist` cases ran again, three attempts ($4.52): five passed
  3 of 3, and the two loading cases 2 of 3.
- **Two `planning` cases fail on the answer about half the time on both sides**, with the skill
  loaded every time. Six attempts each: `plan-handoff-self-contained` 5 of 6 on the branch and 4
  of 6 on `main`; `plan-saved-outside-repo` 3 of 6 on both. Their `EVALS.md` rows were not
  replaced; `ROADMAP.md` lists them.
- **`bounded-iteration/review-sweep-rewrites-its-trigger` is a ceiling case on the answer.** On
  `main` the skill loaded in 0 of 8 attempts and the answer passed 8 of 8. A description naming
  "reindex" and "recurring job" loaded it in 5 of 15 and was not kept.
  `service-boundaries/topology-in-app-repo` loaded 8 of 8 on `main`, so its earlier misses were
  drift.
- **Seven cases were drafted for rules added without one; none was kept.** Two-arm, three
  attempts per arm:
  - Passed without the plugin, 3 of 3: `planning/open-product-choice-takes-default`,
    `service-boundaries/review-llm-call-default-model`,
    `http-api-design/handler-order-validate-after-resolve` (which also loaded its skill in only 1
    of 3), `react-app-structure/fetch-wrapper-null-only-on-404`, and
    `postgres-schema-design/status-as-lifecycle-timestamps`.
  - `github-issue/blocker-found-is-recorded-not-asked`: the skill loaded in 0 of 3. The answer
    passed 3 of 3 with the plugin and 0 of 3 without, on near-identical answers and split judge
    votes, so the difference is not the skill's.
  - `revisit-followups/no-window-given-uses-default`: 3 of 3 with, 0 of 3 without. The answers
    without the plugin swept all five pull requests the person pasted, which is the better
    answer; the case rewarded dropping one for being older than a week. The skill sentence above
    fixes the rule instead.
- **What it showed:** the two descriptions load more often for a request that does not use their
  words, though still not every time. The model already follows five of the seven new rules.
- **`revisit-followups/only-verified-deferred-work`** passed 3 of 3 with the new sentence, plugin
  only. Its `EVALS.md` row was not replaced.

## 2026-11-22: skills ask less; contradictions and repeated rules removed; round-two addendum

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330. No case or grader changed.

- **Changed skill text:** `agent-rules`, `bounded-iteration`, `feature-rollout`,
  `github-actions-authoring`, `github-issue`, `glide-mq`, `http-api-design`,
  `package-json-checklist`, `planning`, `playwright-authoring`, `postgres-locking`,
  `postgres-node-performance-tuning`, `postgres-schema-design`, `react-app-structure`,
  `revisit-followups`, `service-boundaries`, `skill-authoring`, `static-analysis-checklist`,
  `technical-writing`, `test-authoring`, and `triage-codex-security`. No description changed.
- **Run, plugin only, three attempts, 62 cases, $28.76:** every case of those skills. 48 cases
  passed 3 of 3. Outside `planning`, three cases failed one attempt on the answer with the skill
  loaded or not: `github-actions-authoring/required-check-is-a-real-job` (10 of 11 on `main`
  earlier the same day), `http-api-design/uuid-slug-routes`, and
  `revisit-followups/only-verified-deferred-work`. The last two had no control.
- **Same-session control on `main` for `planning` and `service-boundaries`**, three attempts.
  Answers: `plan-handoff-self-contained` 1 of 3 then 3 of 3 on the branch, 2 of 3 on `main`;
  `plan-saved-outside-repo` 1 of 3 then 2 of 3 on the branch, 3 of 3 on `main`.
- **Loading drifts within a session.** `planning/plan-states-before-after` loaded the skill in 1
  of 12 attempts on the branch and 3 of 3 on `main`; with `main`'s `planning` text restored on the
  branch it loaded in 3 of 6, and a further run on `main` loaded in 2 of 6. No description
  differs between the two, so the difference is not the change.
  `service-boundaries/topology-in-app-repo` loaded in 1 of 6 on the branch and 3 of 3 on `main`,
  with the same descriptions.
- **What it showed:** no answer regression that a rerun did not reverse. Three attempts cannot
  measure loading for cases that load in under half of attempts; those cases are listed in
  `ROADMAP.md`. `EVALS.md` rows were not replaced.
- **Not tested:** the new rules have no cases yet.

## 2026-11-22: scores roll up by skill; the case list moves to `EVALS.md`

No run. No case, grader, or score changed.

- `README.md` now shows a headline and one row per skill. `scripts/eval-docs.py` builds both from
  `EVALS.md`, and `pnpm run evals:check` fails when they are stale.
- `EVALS.md` holds the per-case rows that were in `README.md`, with what each case checks in the
  same table. The "(rerun)" suffix is gone; "Where each row comes from" says which run a row is from.
- Guard cases start with "Guard:". `feature-rollout/dark-route-without-caller` gained the prefix.
- `scripts/eval-summary.py` prints `n/a` for an arm that did not run and a "Loaded" column.
- Planned work moved to the root `ROADMAP.md`.

## 2026-11-22: `pull-requests` skill; `agent-workflow` decides instead of asking

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts per
arm. Final run: 6 cases, 36 attempts, $5.13. Earlier runs the same day: $6.43, $6.92, $2.30, and a
plugin-only loading run of eight attempts per case.

- **Changed:** new `pull-requests` skill (scope, stacking, answering review, what a finished pull
  request looks like, closing, merge approval). It states outcomes and leaves the commands to a
  pull request tool. The review-response reference moved to it from `agent-workflow`.
  `agent-workflow` gains "Decide, then report": take the choice policy or evidence settles, ask
  only before a destructive, irreversible, or unauthorized action, send another owner's work to
  that owner. `github-issue` closes an issue as superseded without asking. `pr-description` no
  longer decides whether to split.
- **Moved:** `review-round-dispositions` from `evals/agent-workflow` to `evals/pull-requests`. Its
  prompt and outcome grader did not change.
- **Final run, with / without the plugin:** `pull-requests/review-round-dispositions` 3 of 3 /
  0 of 3; new `agent-workflow/status-note-asks-only-what-it-must` 3 of 3 / 0 of 3;
  `github-issue/search-before-filing` 2 of 3 / 0 of 3; `github-issue/stale-notes-before-filing`
  3 of 3 / 2 of 3; both `pr-description` cases 3 of 3 / 0 of 3. Every attempt loaded its skill.
- **Loading, description A/B:** with a description that opened "Use when opening, splitting,
  stacking, ...", `pull-requests` loaded in 0 of 3 attempts of `review-round-dispositions`. With
  one that opens "Use when deciding what to do with review comments from a person or a bot", it
  loaded in 8 of 8, then 3 of 3.
- **Rule fixed on evidence:** `status-note-asks-only-what-it-must` passed 1 of 3 with the plugin
  while the rule said to ask before an action that "publishes". Two attempts asked permission to
  file a public issue. The rule now names shipping a release, and says filing an issue is an
  ordinary step; the case then passed 3 of 3.
- **Dropped as ceiling cases**, each 3 of 3 without the plugin: `close-superseded-pr`,
  `stack-overlapping-work`, `merge-on-agent-message`, `ready-note-with-stale-pr`,
  `merge-after-approved-then-changed`, `merge-approved-then-conflicts` (all `pull-requests`), and
  `fix-in-code-nothing-calls`, `handoff-one-fix-many-sites` (`agent-workflow`). In six of the eight
  the skill also loaded in at most 1 of 3 attempts.
- **What it showed:** when the prompt lays out the state of a pull request, the model makes the
  merge, close, stack, and readiness decisions correctly unaided, and does not load the skill.
  Those rules are untested here; a case for them needs a fixture the agent must inspect.

## 2026-11-22: locking rules move to `postgres-locking`

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts per
arm, 9 cases, 54 attempts, $7.04.

- **Changed:** the Locks section of `postgres-schema-design` is now the `postgres-locking` skill,
  and `postgres-schema-design`'s description no longer names locks. New rules: every lock form
  counts, share locks included; append-only writes never lock and dedupe an outside effect where
  it is delivered; a guard inside the writing statement and an already conditional write need no
  lock; `SKIP LOCKED` only for competing workers; a transaction that will update the row it
  fences takes `FOR NO KEY UPDATE`; adding a lock is the owner's decision and an unattended agent
  ships the lock-free design; a reviewer's race finding does not justify a lock; tests assert the
  final state, not the lock. `postgres-node-performance-tuning` names a `MATERIALIZED` CTE that
  only pins or locks a row as never justified.
- **Moved:** the five locking cases from `evals/postgres-schema-design` to
  `evals/postgres-locking`, retagged. Their prompts and outcome graders did not change.
- **New cases, with / without the plugin:** `prelock-before-conditional-update` 3 of 3 / 0 of 3;
  `race-finding-on-unwritten-row` 3 of 3 / 0 of 3; `postgres-schema-design/customer-code-key`
  3 of 3 / 3 of 3, a ceiling case kept so the schema skill has a loading check.
- **Dropped as a ceiling case:** `ballot-no-lock` (a poll-row lock before an append-only ballot
  insert and a webhook) passed 3 of 3 in both arms.
- **Moved cases:** `exact-cap-no-lock` and `review-last-admin-advisory-lock` 3 of 3 / 0 of 3;
  `rollup-trigger-deadlocks` 2 of 3 / 0 of 3; the guards `checkout-exact-stock` 3 of 3 / 3 of 3
  and `review-advisory-lock-key` 3 of 3 / 3 of 3 on the answer.
- **Loading:** `postgres-locking` loaded in 26 of 27 attempts; the miss was
  `review-advisory-lock-key` (2 of 3, up from 1 of 3 under the old skill).
- **After review, two plugin-only reruns, three attempts, $3.21 and $3.08:** wording was
  tightened: the effect id includes the action; a guard on another row is called best effort; a
  cap can overshoot by more than one row and is not made exact with `SERIALIZABLE`; the
  session-level advisory form is named; a write-skew guard reads inside its `SERIALIZABLE`
  transaction; tests accept each valid outcome. In the first rerun `exact-cap-no-lock` failed 1
  of 3: told to put the lock it would propose in the description, the agent offered a team-row
  lock for a cap. The rule now says a cap has no lock to propose, and the second rerun passed
  every answer, 21 of 21. `review-advisory-lock-key` loaded the skill in 1 of 3. The README
  rows are from the second rerun.
- **What it showed:** without the skill the model adds or keeps a lock in every non-guard case.
  `postgres-schema-design` now has no case the model fails unaided.

## 2026-11-22: second round of generic rules; a queue is ephemeral

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330.

- **Changed skill text:** `bounded-iteration`, `dependabot`, `github-actions-authoring` (with a new
  destructive-workflows reference), `glide-mq`, `playwright-authoring`,
  `postgres-node-performance-tuning`, `postgres-schema-design`, `service-boundaries`,
  `static-analysis-checklist`, `structured-logging`, `test-authoring` (with a new
  replacing-a-library reference), and `typescript-authoring`.
- **New rule:** `glide-mq` says a queue is ephemeral and state lives in PostgreSQL: completed and
  failed jobs are removed, recovery reads rows, and only legal, privacy, or irreversible work keeps
  a row per attempt. `bounded-iteration` says a sweep finds its work in rows, not failed jobs.
- **Run 1, both arms, three attempts per arm, $24.22,** before `main` was merged in. New cases,
  with / without: `glide-mq/review-retry-from-failed-jobs` 3 of 3 / 0.33;
  `postgres-schema-design/uuidv7-no-created-at-default` 3 of 3 / 0.00. Existing cases held:
  every `glide-mq`, `dependabot`, `test-authoring`, and `postgres-node-performance-tuning` case
  answered 3 of 3 with the plugin except `dependabot/review-actions-cooldown` and
  `test-authoring/dotnet-private-field-not-reflected`, 2 of 3 each, both on an attempt that did
  not load the skill. `postgres-node-performance-tuning/index-change-rechecks-neighbors` got its
  first no-plugin score, 0.00.
- **Dropped as ceiling cases, never merged:** `dependabot/pnpm-workspace-one-entry`,
  `postgres-node-performance-tuning/get-or-create-identity`, and
  `test-authoring/absence-waits-for-event` scored 1.00 without the plugin.
  `github-actions-authoring/paths-filtered-required-check` scored 0.67 without and never loaded
  the skill with it. Their rules stay in the skills, untested.
- **Run 2, plugin only, after merging `main`, three attempts, $7.88, with a control on `main` in
  the same session, $4.14.** Branch / `main`, attempts passed:
  `static-analysis-checklist/tracked-files-only` 0 of 3 / 0 of 3, never loading the skill on
  either side; `bounded-iteration/review-sweep-rewrites-its-trigger` 1 of 3 / 2 of 3;
  `structured-logging/review-lookup-in-catch` 2 of 3 / 2 of 3;
  `typescript-authoring/rename-without-alias` 3 of 3 / 2 of 3. Every other case in
  `bounded-iteration`, `github-actions-authoring`, `postgres-node-performance-tuning`,
  `postgres-schema-design`, `static-analysis-checklist`, `structured-logging`, and
  `typescript-authoring` passed 3 of 3 on both, except the next row.
- **`github-actions-authoring/required-check-is-a-real-job`** passed 1 of 3 on the branch in run 2. Over two further same-session runs it passed 10 of 11 on the branch and 10 of 11 on `main`,
  so the miss is noise in the case, not the new text.
- **What it showed:** the round did not move any existing case beyond what `main` does in the
  same session. `tracked-files-only` no longer loads its skill on `main` either; its stored row
  (3 of 3) is stale and the case needs a clearer trigger. `EVALS.md` rows for existing cases were
  not replaced.

## 2026-11-22: `bounded-iteration` description names sweeps

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, plugin only, eight attempts
per case for each description in the same session, $7.24; then `glide-mq` plugin only, three
attempts, $2.05.

- **Changed:** the description now opens "Use when writing or reviewing a sweep, scheduled job,
  ..." and says it covers sweeps that re-select their own writes and effects that repeat on every
  run.
- **A/B, skill loaded / answer passed, old then new:** `review-dispatcher-predicate-and-job-id`
  2 / 3 of 8, then 8 / 8 of 8; `review-staged-reconciler` 8 / 8, then 8 / 8;
  `review-sweep-rewrites-its-trigger` 0 / 8, then 4 / 8 of 8.
- **Neighbor check:** every `glide-mq` case still loaded `glide-mq` in all 12 attempts;
  `never-enqueue-and-wait` failed its design grader once (2 of 3). Its README row is from the
  earlier run.
- **Not rerun without the plugin:** the description does not change that arm.
- **After review, no run:** rule 17 now forbids writing a row back into the selection rather than
  any write to the selected column (a completion marker that removes the row is the point), and
  its second-run test applies once no eligible rows remain and counts new work, not repeated
  idempotent enqueues. The rows above were measured before this wording.

## 2026-11-21: `bounded-iteration`: a sweep converges

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts per
arm, $4.40 over two runs.

- **Changed:** `bounded-iteration` rule 17: a sweep never writes the column it selects by unless
  the write is a lease, replays only idempotent "ensure" effects, and has a second-run test that
  writes and enqueues nothing. The "ensure" rule moved here from `glide-mq/references/job-design.md`,
  which now links to it.
- **New case** `bounded-iteration/review-sweep-rewrites-its-trigger`. With `updated_at = now()` in
  the job's own `UPDATE`, both arms passed the review every time. With the bump moved into a
  database trigger shown in the prompt, the review passed 3 of 3 with the plugin and 2 of 3
  without. The skill did not load in any of the six attempts with the plugin, so the case does
  not yet show the rule helping; the description does not name sweeps that rewrite their own
  trigger.
- **Other rows:** `review-dispatcher-predicate-and-job-id` 2 of 3 (0.33 without),
  `review-staged-reconciler` 3 of 3 (0.00 without).

## 2026-11-21: `planning` measured; mechanical narrowed, a `Verify:` line on every step

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts per
arm, three runs.

- **First run** ($7.40): two of seven cases scored 1.00 with the plugin. The rename guard failed
  on both arms, a plan for shortening password-reset links rarely loaded the skill, and plans left
  verification off some steps.
- **Changes:** the mechanical level now requires no change in behavior (a value users feel, such
  as a timeout, limit, or copy, is not mechanical); every step, including investigation and
  cleanup, gets a `Verify:` line with a runnable command; a handoff states decisions as facts with
  reasons, not "as agreed". Two graders were narrowed after reading the failures: the rename guard
  allows a short risk note and a question the request leaves open, and the saved-plan case allows
  a lasting docs page written after the work merges.
- **Second run** ($7.00): the rows in `README.md`, except the handoff row.
- **Third run** (one case, $1.22): `plan-handoff-self-contained` 2 of 3 with, 0.00 without. Its
  grader now allows a plan to point at its own sections ("the traces above").
- **Ceiling:** `blast-radius-tests-and-flows` and `plan-pulls-in-postgres-skill` score 1.00
  without the plugin; they stay as checks that the skill loads and does no harm.
- **Rebased:** rebuilt on `main` after the `agent-rules` split; the earlier entries for this work
  follow.

## 2026-11-21: planning: levels, graph-based impact and verification, and a handoff document

No run was made. Changed `skills/planning/SKILL.md`: a levels table (mechanical, small,
substantial, initiative) says when to plan and to pick the lowest level that fits; the
description now opens with non-trivial work and says "Not for mechanical changes"; step 3 names a
dependency-graph tool such as `no-mistakes`, with its commands in the new
`references/impact-tracing.md`; every step now carries an acceptance criterion and a verification
command, and a "Verify after implementing" section selects tests from the diff and warns about an
empty selection; a "handoff" section says the plan must stand alone for a fresh-context agent, with
the template in the new `references/plan-document.md` (decisions, constraints, impact, steps,
non-goals, risks, assumptions, stop conditions, definition of done).

- **New cases, not yet measured:** `planning/mechanical-change-skips-plan` (a guard, and the first
  case without a `skill-fired` grader; `evals/AGENTS.md` now says so),
  `planning/plan-handoff-self-contained`, and `planning/plan-verification-commands`.
- **Not re-measured:** the four earlier `planning` cases, whose skill text changed again.
- **To do:** pilot the new cases with `--runs 1`, run the no-plugin arm once each, and run the
  guard on both arms to see whether the unplanned answer holds with the skill loaded.

## 2026-11-21: planning: blast radius, user-readable outcomes, and related skills

No run was made. Changed `skills/planning/SKILL.md`: step 1 now asks for the outcome in plain
language as a before/after table and points at `technical-writing` for the document structure;
step 3 also names the affected unit and integration tests, the browser specs, and the
user-visible behavior; a new step 4 loads the skills and rule sets whose triggers match the
touched areas and folds their constraints into the steps. The description now mentions the
outcome, affected tests and behavior, and related skills.

- **New cases, not yet measured:** `planning/blast-radius-tests-and-flows`,
  `planning/plan-states-before-after`, and `planning/plan-pulls-in-postgres-skill`. The last also
  has a `tool_used` grader that passes when the agent loads `postgres-schema-design` or
  `postgres-node-performance-tuning`.
- **Not re-measured:** `planning/plan-saved-outside-repo`, whose skill text changed.
- **To do:** pilot the three cases with `--runs 1`, then run the no-plugin arm once each.

## 2026-11-21: `agent-rules` and `skill-authoring` measured, two cases replaced

Commit of this entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts per
arm, $5.22 over four runs.

- **`agent-rules`:** `root-agents-md-placement` 1.00 with, 0.00 without; `path-scoped-rules`
  1.00 with, 1.00 without (0.33 without on the earlier run), so it is now a ceiling case.
- **Replaced:** `skill-authoring/description-opens-with-trigger` and
  `skill-authoring/move-detail-to-reference` both scored 1.00 without the plugin and were removed.
- **New:** `skill-authoring/repo-rule-not-in-shared-skill` (1.00 with, 0.00 without) and
  `skill-authoring/split-by-trigger` (0.83, 2 of 3, with; 0.00 without). The first run of
  `split-by-trigger` failed two attempts that found the plugin's existing browser-test skill and
  put the guidance there; that is the one-owner rule, so the grader now passes it, and the rerun
  is the row.
- **After review, no run:** `agent-rules` now says a nested `AGENTS.md` scopes by directory, not
  file pattern; that a `CLAUDE.md` bridge sits beside every `AGENTS.md`, nested ones included; and
  that generated reference docs are exempt from "do not copy what the code shows".
  `evals/AGENTS.md` says how a partial run updates the README table. The `agent-rules` rows above
  were measured before these edits.
- **Rebased:** the split was rebuilt on `main` after the six-skill upstream; earlier entries for
  this work follow.

## 2026-11-21: split `agent-instructions` into `agent-rules` and `skill-authoring`

No run was made for this entry. Its parts are triggered by different work.

- **`agent-rules`** (renamed from `agent-instructions`): where a rule lives, `AGENTS.md` and
  `CLAUDE.md`, links, capturing decisions, and writing and reviewing a rule.
- **`skill-authoring`** (new): the description, the body and references, splitting a skill, and
  evals for a skill, generalized from the guidance that was in this repository's root `AGENTS.md`.
  Its rules about skills left `agent-rules`.
- **Two new cases,** not yet measured: `skill-authoring/description-opens-with-trigger` and
  `skill-authoring/move-detail-to-reference`.
- **Not comparable:** the two `agent-rules` cases carry the scores measured under the old name,
  with the old description and body, so the earlier entries do not carry over to the new skill
  until they are rerun. Their tags and `skill-fired` graders now name `agent-rules`, so the old
  loading rate does not apply either.

## 2026-11-21: more `agent-instructions` and `evals` rules

Commit after the previous entry, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three
attempts, $1.25.

- **`agent-instructions`:** enforce the `AGENTS.md` size budget with a check; point at folders,
  commands, or symbols, not line numbers or file paths; the most specific instruction wins; a
  handoff names the files and skills to read instead of retyping rules; keep descriptions short
  and distinct.
- **`evals` reference:** write a case from a real failure before changing the rule, and consider
  retiring a rule whose case passes without the skill. The `evals` cases were not rerun.

| Case                                          | With | Passed | Without |
| --------------------------------------------- | ---- | ------ | ------- |
| `agent-instructions/path-scoped-rules`        | 1.00 | 3 of 3 | 0.33    |
| `agent-instructions/root-agents-md-placement` | 1.00 | 3 of 3 | 0.00    |

The without arm passed `path-scoped-rules` once in three, where the previous entry's run passed it
in none; the case still separates the arms.

## 2026-11-21: new `agent-instructions` skill, and kinds of eval

Commit after `bd25591`, Sonnet agent, Opus judge, Claude Code 2.1.330, about $6 in total.

- **New skill `agent-instructions`:** where an instruction lives (`AGENTS.md`, a skill, docs, a
  check, or nowhere when the code shows it), portable files over harness-specific rule formats,
  linked and link-checked docs, capturing decisions outside memory, and evals for skills. The
  "Agent instruction files" rules moved here from `documentation`, whose description no longer
  names `AGENTS.md`.
- **Two cases:** `root-agents-md-placement` and `path-scoped-rules`.
- **Description A/B on `path-scoped-rules`,** eight attempts each, same session: the first
  description (naming `AGENTS.md`, `CLAUDE.md`, skills, and docs) loaded the skill in 0 of 8, with
  4 of 8 correct answers. Adding "rules or instructions for coding agents" and "path-scoped rules
  such as .claude/rules or Cursor rules" loaded it in 7 of 8, with 8 of 8 correct. The misses
  called no tool at all.
- **Final two-arm run,** three attempts per arm, after the rules on decisions, memory, numbers,
  and evals were added:

| Case                                          | With | Passed | Without |
| --------------------------------------------- | ---- | ------ | ------- |
| `agent-instructions/path-scoped-rules`        | 1.00 | 3 of 3 | 0.00    |
| `agent-instructions/root-agents-md-placement` | 1.00 | 3 of 3 | 0.00    |

- **`documentation` rerun,** plugin only, after its description change: `review-readme-drift`
  2 of 3 (one attempt called no skill), `write-scale-numbers` 2 of 3. Three attempts cannot tell
  this from the earlier 3 of 3 and 2 of 3.
- **`evals` skill:** a new reference lists the kinds of eval a skill suite runs (with vs.
  without, loading, description A/B, neighbors, guard, regression) with the attempts each needs.
  `evals/AGENTS.md` maps each kind to its command here, replacing "When the skill does not load". The
  `evals` description now also names choosing which evals to run; its cases were not rerun.

## 2026-11-21: generic rules upstreamed into six skills

Commit after `96a15e7`, Sonnet agent, Opus judge, Claude Code 2.1.330, about $16 in total.

- **Rule changes:** generic rules from one project's own guidance, stated without its names.
  - `react-app-structure`: server components read the current user directly and never pass it to
    a client component; clients get display view models, not API envelopes; logged-out pages
    render fully on the server; finite route types get their own route directories; submit stays
    disabled until the post-mutation refresh finishes; `router.refresh()` does not recreate a
    promise held in client state; navigation targets are links; no memoization only for
    referential stability under React Compiler; polling ignores stale responses.
  - `http-api-design`: no UUIDs as identifiers in routes, visible text, or inputs; a UUID route
    permanently redirects to the slug; display labels are non-null API fields with a fallback;
    a retargeted link leaves the old page reachable.
  - `service-boundaries`: an "Inbound events" section (self-contained auth, no hairpin through
    your own public endpoint, AWS-native senders deliver to a queue, push first) and a
    `references/event-ingress.md` checklist.
  - `github-actions-authoring`: separate services deploy independently; scripts developers run
    locally work on macOS `/bin/bash`; policy is bound to an immutable SHA and read from the base.
  - `static-analysis-checklist`: port a security guard's old fixtures before replacing it.
  - `glide-mq`: never mix ranked and priority-0 jobs in a queue; share a queue by default;
    payloads carry ids, never secrets; replay-safe processors; stable job ids with retention drop
    re-enqueues; continuation jobs get a new identity; `references/job-design.md` and
    `references/transition-matrix.md`.
- **Cases:** added `react-app-structure/client-needs-current-user` and
  `http-api-design/uuid-slug-routes`. Six drafted cases were dropped before merge: five
  (`refresh-after-save`, `no-secrets-in-job-payload`, `stable-job-id-retention`,
  `script-runs-on-macos-bash`, `s3-events-to-queue`) scored 1.00 without the plugin, and
  `independent-service-deploys` was not well posed: its prompt demanded a hard deploy order, and
  the agent loaded the skill, named the independent-deploy rule, and chained the deploys with
  `needs` as asked, which the grader failed in 3 of 3.
- **Two-arm run,** three attempts per arm, over every case of the six skills. Every remaining
  case scored 1.00 with the plugin except `static-analysis-checklist/tracked-files-only` (1 of 3,
  missed loads). A same-session rerun scored it 3 of 3 on this branch and 1 of 3 on `main`, so
  the drop was noise, not this change.
- **Shown:** the two new cases score 3 of 3 with the plugin and 0.00 without. Four older cases
  now score 1.00 without the plugin: `abort-superseded-search`, `partner-webhook`,
  `failed-jobs-need-recovery-path`, and `no-actions-write-with-checked-out-code`.

## 2026-11-21: locks for rare privacy, legal, and irreversible invariants

Commit after `bd25591`, Sonnet agent, Opus judge, Claude Code 2.1.330, $7.51 in total.

- **Rule change:** `postgres-schema-design` now allows a lock for a rare race on a privacy,
  legal, or irreversible invariant (an account-deletion fence, a legal hold, a delete in an
  outside store): a `FOR SHARE` or `FOR UPDATE` on the aggregate's root row even when it is not
  written, and an advisory lock only when no row exists or the section spans transactions or
  outside I/O. The simplest correct mechanism wins. A trigger-maintained counter or rollup that
  needs global or ordered locks is replaced by closed periods computed once. The default (no
  lock, constraint or conditional write, `SERIALIZABLE` and 409 for rare races) is unchanged.
- **Cases:** added `rollup-trigger-deadlocks`. `deletion-fence-root-row-lock` was dropped: it
  scored 1.00 without the plugin in three attempts, and no case for the exception fails without
  it, so it could not stand as a guard.
- **Two-arm run,** three attempts per arm:

| Case                                                     | With | Passed | Without |
| -------------------------------------------------------- | ---- | ------ | ------- |
| `postgres-schema-design/checkout-exact-stock`            | 1.00 | 3 of 3 | 0.67    |
| `postgres-schema-design/deletion-fence-root-row-lock`    | 1.00 | 3 of 3 | 1.00    |
| `postgres-schema-design/exact-cap-no-lock`               | 1.00 | 3 of 3 | 0.00    |
| `postgres-schema-design/review-advisory-lock-key`        | 0.67 | 1 of 3 | 1.00    |
| `postgres-schema-design/review-last-admin-advisory-lock` | 0.50 | 1 of 3 | 0.00    |
| `postgres-schema-design/rollup-trigger-deadlocks`        | 1.00 | 3 of 3 | 0.00    |

- **Last-admin regression:** a six-attempt rerun with traces passed 4 of 6. Both failures
  recommended deleting the lock; one added that `FOR UPDATE` on the organization row would fit if
  the guard had to be exact, which the new root-row wording invites. The exception now says a cap
  or a "don't remove the last X" guard is not such an invariant. A second six-attempt rerun passed
  6 of 6.
- **`review-advisory-lock-key`** missed only on loading (two attempts called no skill), as before.

## 2026-11-21: review fixes to the new cases, and `packageExtensions` corrected

Commit after `3bc6ef4`, Sonnet agent, Opus judge, Claude Code 2.1.330, both arms, three attempts,
$4.83. A review of the previous entry's new cases found graders that also required rules from
other parts of their skill, and one wrong rule in a skill.

- **Skill correction.** `package-json-checklist` said to correct a package's wrong metadata with
  `packageExtensions`. pnpm spreads the extension under the package's own manifest, so it can only
  add what the manifest lacks and cannot change a declared peer range. The rule now uses
  `packageExtensions` for a missing dependency or peer, `peerDependencyRules.allowedVersions`
  scoped to the package for a peer range that is too narrow, and a patch for anything else. The
  description also names workspace metadata. Earlier `review-override-for-peer-warning` scores
  graded the wrong advice as correct; they are not comparable with this entry.
- **Graders narrowed** to the rule each case is named for: `github-issue/stale-notes-before-filing`
  (no issue-body requirement), `revisit-followups/plan-issue-unchecked-boxes` (no separate
  verification step), `rust-authoring/parallel-cargo-jobs` (no CI or `target/` requirement),
  `structured-logging/review-lookup-in-catch` (no fixed-message requirement).
- **Graders corrected:** `native-app-architecture/generated-project-file` no longer accepts a
  local Swift package as the project specification; `playwright-authoring/review-computed-test-ids`
  narrows the row by the invoice number it shows, not the id.

| Case                                                      | With | Passed | Without |
| --------------------------------------------------------- | ---- | ------ | ------- |
| `github-issue/stale-notes-before-filing`                  | 1.00 | 3 of 3 | 0.33    |
| `native-app-architecture/generated-project-file`          | 1.00 | 3 of 3 | 0.00    |
| `package-json-checklist/review-override-for-peer-warning` | 1.00 | 3 of 3 | 0.67    |
| `playwright-authoring/review-computed-test-ids`           | 1.00 | 3 of 3 | 0.00    |
| `revisit-followups/plan-issue-unchecked-boxes` (dropped)  | 1.00 | 3 of 3 | 1.00    |
| `rust-authoring/parallel-cargo-jobs` (dropped)            | 1.00 | 3 of 3 | 1.00    |
| `structured-logging/review-lookup-in-catch`               | 1.00 | 3 of 3 | 0.00    |

The two dropped cases failed without the plugin only on the extra rules; narrowed to their own
rule they do not discriminate. `revisit-followups` and `rust-authoring` have one case each again,
so the previous entry added 10 cases that stay, not 12.

## 2026-11-21: descriptions open with when to use them, and 12 more cases

Commit `9f4aaf5` (runs on its working tree), Sonnet agent, Opus judge, Claude Code 2.1.330.
About $60 across every run below, plus the one-attempt pilots made while writing the cases.
The description comparison ran both arms in the same session, so neither side is a stored number.

**Why.** A rerun of the five `test-authoring` cases on 2.1.330, with no change, loaded the skill in
10 of 15 attempts; on 2026-11-20 (2.1.329) the two review cases had loaded it every time. Two
attempts each of `postgres-schema-design`, `typescript-authoring`, and `glide-mq` missed 3 of 22.
In every miss the agent called no skill. Most descriptions opened with what the skill does and put
"Use when" second.

**Description order, measured.** The three cases that missed most, eight attempts each, with
main's descriptions and with `test-authoring` and `postgres-schema-design` reordered to open with
"Use when" ($5.97 in all):

| Case                                                | Old    | Trigger first |
| --------------------------------------------------- | ------ | ------------- |
| `test-authoring/dotnet-private-field-not-reflected` | 3 of 8 | 6 of 8        |
| `test-authoring/review-helper-holds-assertions`     | 5 of 8 | 8 of 8        |
| `postgres-schema-design/review-advisory-lock-key`   | 0 of 8 | 3 of 8        |

Every skill's description now opens with when to use it. `test-authoring` also names xUnit and
NUnit and a review of a diff that adds tests; `typescript-authoring` names a review of a diff;
`package-json-checklist` had no "Use when" and now has one; `http-api-design` names an edge or
CDN worker in front of an API.

**Rule change.** `typescript-authoring` now says a review asks for the callers to be updated and
does not offer keeping an alias as a fallback. Two `rename-without-alias` answers argued against
the alias and then ended "if you still want the alias, keep it".

**New cases.** A second case for 12 skills that had one: `documentation`, `github-issue`,
`github-repository-settings`, `native-app-architecture`, `package-json-checklist`,
`playwright-authoring`, `pr-description`, `revisit-followups`, `rust-authoring`,
`service-boundaries`, `static-analysis-checklist`, and `structured-logging`. Each was piloted with
one attempt per arm and failed without the plugin.

- **Dropped:** `planning/stale-issue-paths` failed its answer on every attempt, because its grader
  also required two rules from other steps of the skill. Narrowed to the stale-paths rule, it
  scored 1.00 without the plugin. `review-ci-logs/passes-locally-fails-in-ci` scored 1.00 without
  the plugin over three attempts. Neither discriminates.
- **No case found** for `agent-workflow`: three designs either passed without the plugin or
  failed with it. `agent-workflow`, `planning`, and `review-ci-logs` still have one case each.
- **After the runs:** the run URL in `pr-description/ci-gap-section` was put in backticks so the
  link check skips it. The prompt is otherwise unchanged and was not re-run.
- **Rules from this entry:** the root `AGENTS.md` now says a description opens with when to use
  it. `evals/AGENTS.md` adds how to measure a skill that does not load (eight attempts per arm,
  kept traces), that a grader checks only the rule its case is named for, and that a case may
  check a companion skill loaded but never that a neighbor did not.
- **Companion skills:** a `playwright-authoring` pilot checked that `test-authoring` also loaded;
  it did not, and the grader was removed since the review touched no general test rule.

**Full run** (78 cases, 234 attempts, $35.50). The skill loaded in 224 of 234 attempts. Misses:
`documentation/write-scale-numbers` 0 of 3 (2 of 3 on a rerun that kept traces),
`http-api-design/edge-claims-do-not-authorize` 0 of 3, `bounded-iteration/review-dispatcher-predicate-and-job-id`
1 of 3, `postgres-schema-design/review-advisory-lock-key` 1 of 3. The kept traces show the agent
answering with no tool call.

**Two-arm rerun** after naming edge workers in `http-api-design`, three attempts per arm:

| Case                                                  | With | Passed | Without |
| ----------------------------------------------------- | ---- | ------ | ------- |
| `http-api-design/edge-claims-do-not-authorize`        | 1.00 | 3 of 3 | 0.00    |
| `service-boundaries/topology-in-app-repo`             | 0.33 | 1 of 3 | 0.00    |
| `planning/stale-issue-paths` (narrowed, dropped)      | 0.67 | 1 of 3 | 1.00    |
| `review-ci-logs/passes-locally-fails-in-ci` (dropped) | 1.00 | 3 of 3 | 1.00    |

`service-boundaries/topology-in-app-repo` loaded the skill on 1 of 3 attempts here and 3 of 3 in
the full run; both misses failed the answer.

## 2026-11-20: new `technical-writing` skill, and no changing numbers in living docs

Sonnet agent, Opus judge, Claude Code 2.1.329, both arms, three attempts, $3.91, after a
one-attempt pilot ($0.83) in which all three new cases passed with the plugin and failed without.
The new `technical-writing` skill orders a document from summary to evidence, labels sections by
audience and intent, prefers tables and Mermaid diagrams, labels unverified facts and states
assumptions, and defines terms at first use. `documentation` now says not to write changing
numbers into a living document, but how to fetch them.

| Case                                            | With | Without |
| ----------------------------------------------- | ---- | ------- |
| `documentation/review-readme-drift`             | 1.00 | 0.67    |
| `technical-writing/incident-writeup-from-notes` | 0.83 | 0.00    |
| `technical-writing/proposal-for-two-audiences`  | 0.83 | 0.00    |
| `technical-writing/review-runbook-wall-of-text` | 1.00 | 0.00    |

- **New cases:** all three fail every attempt without the plugin.
- **Misses with the plugin were in the answer.** The skill loaded on every attempt. One incident
  write-up labeled sections for everyone and engineering but gave the support lead no section of
  their own. One proposal had a flag-by-plan table but no before and after table.
- **`documentation/review-readme-drift`** scored 0.67 without the plugin, against 0.00 when it
  was added.

## 2026-11-20: locks only for exact quantities, enqueue after commit, database fixtures

Sonnet agent, Opus judge, Claude Code 2.1.329, both arms, three attempts. `postgres-schema-design`
now allows a row or parent lock only for an exact quantity (money, balances, inventory), requires
every lock to be short, bounded, ordered, and free of outside calls including an enqueue, asks for
the try variant or `lock_timeout` on an advisory lock, and allows a version column for exact
quantities and hand-edited entities. `test-authoring` creates database rows through production
factories, and inserts directly only for a state production can no longer create.

Two runs. The `test-authoring` rows are from a $7.52 run of both skills. The
`postgres-schema-design` rows are from a $3.38 run after its new case was rewritten.

| Case                                                     | With | Without |
| -------------------------------------------------------- | ---- | ------- |
| `postgres-schema-design/checkout-exact-stock` (guard)    | 1.00 | 1.00    |
| `postgres-schema-design/exact-cap-no-lock`               | 1.00 | 0.00    |
| `postgres-schema-design/review-advisory-lock-key`        | 0.83 | 1.00    |
| `postgres-schema-design/review-last-admin-advisory-lock` | 1.00 | 0.00    |
| `test-authoring/dotnet-private-field-not-reflected`      | 0.50 | 0.33    |
| `test-authoring/fake-routes-by-request`                  | 1.00 | 1.00    |
| `test-authoring/fixture-files-not-inline`                | 1.00 | 0.00    |
| `test-authoring/review-direct-row-inserts`               | 1.00 | 0.67    |
| `test-authoring/review-helper-holds-assertions`          | 1.00 | 0.00    |

- **New guard `checkout-exact-stock`:** checkout that must never oversell keeps stock exact
  without an unbounded lock and enqueues after commit. It first ran as `review-stock-lock-enqueue`,
  a review of a stock lock added above two unchanged queue calls: 0.67 with the plugin (the skill
  did not load on two attempts) and 1.00 without, so the model already moves an enqueue out of a
  locked transaction in review. Rewritten as a write request, a one-attempt pilot ($1.05) also
  passed without the plugin; the model writes a conditional decrement and enqueues after commit
  on its own. It is kept as the guard beside `exact-cap-no-lock`: the "avoid locks" rule must not
  stop protection of an exact quantity.
- **New case `review-direct-row-inserts`:** passes 3 of 3 with the plugin and 0.67 without, a
  weak gap.
- **`fake-routes-by-request` scored 1.00 without the plugin,** against 0.00 when it was added.
  The model now passes it on its own.
- **Below 1.00:** every miss was the skill not loading, except one
  `dotnet-private-field-not-reflected` attempt whose answer also failed.
- **Fix:** `github-actions-authoring/no-actions-write-with-checked-out-code` had an unquoted
  description containing `: `, which YAML rejects, so a run that included it stopped loading
  cases. The description is now quoted. That case is still unmeasured.

## 2026-11-19: six new rules and cases, not run

No run. Six new cases, one for each new rule: an index change rechecks every dependent query
(`postgres-node-performance-tuning`), a terminal recovery path for permanently failed jobs
(`glide-mq`), no `actions: write` for a job that runs checked-out code
(`github-actions-authoring`), edge-verified claims never authorize (`http-api-design`), `UNLINK`
in one batched call (`typescript-authoring`), and aborting superseded requests
(`react-app-structure`). The cases and their graders are unmeasured: no check was made that the
model fails them without the skill, and none that the skill loads. Their `README.md` rows read
`n/a`.

## 2026-11-17: batch-first I/O and a queue of its own for transactional jobs

Sonnet agent, Opus judge, Claude Code 2.1.327. Two new cases and two rules: per-item I/O takes a
list and the single-item form wraps it (`typescript-authoring`), and a job that commits with or is
triggered by a database transaction gets its own queue (`glide-mq`). Both arms, three attempts.
The `glide-mq` rows are from a $4.67 run of every `glide-mq` and `typescript-authoring` case. The
`typescript-authoring` rows are from the last of five runs of that skill, $1.41 to $2.10 each,
made while rewriting the new case.

| Case                                        | With | Without |
| ------------------------------------------- | ---- | ------- |
| `glide-mq/outbox-own-queue`                 | 1.00 | 0.00    |
| `glide-mq/never-enqueue-and-wait`           | 1.00 | 0.00    |
| `glide-mq/review-webhook-lane`              | 1.00 | 0.00    |
| `typescript-authoring/batch-first-wrapper`  | 0.33 | 0.00    |
| `typescript-authoring/rename-without-alias` | 0.67 | 0.00    |

- **Weak result:** `batch-first-wrapper` passes 1 of 3 with the plugin. The skill did not load on
  two attempts, and those answers failed the outcome grader. Without the skill, answers batch the
  I/O but leave the single-item function unchanged, so the wrapper requirement is what separates
  the arms. The skill's description was reworded twice to name per-item I/O, loops that enqueue,
  and bulk paths; loading did not become reliable.
- **Case history:** earlier versions let the model pass without the plugin (0.67 for a prompt
  that said the single-item helpers must keep working, and 1.00 and 0.67 for two others). A
  review framing loaded the skill on none of three attempts. The recorded version asks for the
  import in a write request and names the CRM's list-taking calls, so the open choice is the
  wrapper.
- `rename-without-alias` scored 1.00, 0.83, 0.67, 0.50, 0.83, and 0.67 across these runs on an
  unchanged case, while the skill's description changed; its description may load less often now.
  Not isolated.
- `glide-mq/review-webhook-lane` scored 0.00 without the plugin here, against 0.33 before.

## 2026-11-17: advisory locks softened from never to avoid, with a guard case

Sonnet agent, Opus judge, Claude Code 2.1.326. Three runs.

First, both arms of every `postgres-schema-design`, `glide-mq`, and
`postgres-node-performance-tuning` case: six cases, 36 attempts, $4.86.

| Case                                                           | With          | Without |
| -------------------------------------------------------------- | ------------- | ------- |
| `glide-mq/never-enqueue-and-wait`                              | 1.00          | 0.00    |
| `glide-mq/review-webhook-lane`                                 | 1.00          | 0.00    |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00          | 0.00    |
| `postgres-schema-design/exact-cap-no-lock`                     | 1.00          | 0.00    |
| `postgres-schema-design/review-advisory-lock-key`              | 0.67 (1 of 3) | 1.00    |
| `postgres-schema-design/review-last-admin-advisory-lock`       | 0.83 (2 of 3) | 0.00    |

Then, after the grader change below, the three `postgres-schema-design` cases with the plugin
($1.45): `exact-cap-no-lock` 3 of 3, `review-advisory-lock-key` 0 of 3 (0.50),
`review-last-admin-advisory-lock` 1 of 3 (0.33). Then the same cases on the commit before this
change ($0.91): `exact-cap-no-lock` 3 of 3, `review-last-admin-advisory-lock` 1 of 3 (0.33).

- **The rule:** `postgres-schema-design` says to avoid advisory locks, not never use them. Prefer a
  constraint, a conditional write, or `SERIALIZABLE`; a change that takes one says why, and a
  review checks that it is transaction-scoped and that its key is specific to the operation.
  `postgres-node-performance-tuning` and `glide-mq` now say avoid and link there.
- **New guard case `review-advisory-lock-key`:** a justified lock whose key is shared with an
  unrelated lock. Its answers passed every attempt in both arms; every failure is `skill-fired`.
- **Grader change, `review-last-admin-advisory-lock`:** a review that recommends deleting the lock
  may also say how a kept lock should look. The failing attempt in the first run did exactly that,
  and two of three judges failed it for "a different lock key".
- **Load rate on 2.1.326:** in every failure of `review-last-admin-advisory-lock`, the skill did
  not load and the review grader failed. The commit before this change scored the
  same 1 of 3. Three attempts per revision cannot show whether the wording changed the load rate. On 2.1.325
  the case scored 3 of 3.

## 2026-11-17: a seven-day cooldown on every Dependabot ecosystem

Sonnet agent, Opus judge, Claude Code 2.1.326. Two three-attempt runs with both arms of every
`dependabot` case, $2.08 and $2.07. The table is the second run.

| Case                                 | With          | Without |
| ------------------------------------ | ------------- | ------- |
| `dependabot/groups-by-family`        | 1.00          | 0.33    |
| `dependabot/request-update-check`    | 1.00          | 0.50    |
| `dependabot/review-actions-cooldown` | 0.67 (2 of 3) | 0.67    |

- **The rule:** every update entry, including `github-actions` and `docker`, sets at least seven
  days, and so does every semver day key. A `pull_request` workflow on Dependabot pull requests
  may hold a write-capable secret only with that cooldown; otherwise split it into two stages.
- **New case `review-actions-cooldown`:** its first version left only the `github-actions` entry
  without a cooldown, and passed 3 of 3 without the plugin. The recorded version adds short
  `semver-patch-days` and a `docker` entry with none. It still separates the arms poorly: the one
  failure with the plugin is the skill not loading.
- In the first run, `request-update-check` scored 0.83 without the plugin.

## 2026-11-17: new skill `github-repository-settings`

Sonnet agent, Opus judge, Claude Code 2.1.326. One three-attempt run with both arms of the new
case: six attempts, $0.58.

| Case                                                | With | Without |
| --------------------------------------------------- | ---- | ------- |
| `github-repository-settings/collaborators-only-prs` | 1.00 | 0.67    |

- The skill covers the collaborators-only pull request setting and approval of every outside
  contributor's workflow runs, with read, set, and rollback commands.
- After the run, the Dependabot caveat changed from "not documented" to an observation: on two
  repositories, Dependabot opened a pull request 10 to 14 minutes after the setting was applied. The case does
  not grade that line; not re-measured.

## 2026-11-16: partition retention with survivors, and one job per reconciler stage

Sonnet agent, Opus judge. One three-attempt run with both arms of every `bounded-iteration` and
`postgres-partitioning-uuid-v7` case: four cases, 24 attempts, $3.34.

| Case                                                       | With | Without |
| ---------------------------------------------------------- | ---- | ------- |
| `bounded-iteration/review-dispatcher-predicate-and-job-id` | 1.00 | 1.00    |
| `bounded-iteration/review-staged-reconciler`               | 1.00 | 0.00    |
| `postgres-partitioning-uuid-v7/range-not-hash`             | 1.00 | 0.67    |
| `postgres-partitioning-uuid-v7/retention-with-survivors`   | 1.00 | 0.00    |

- **`postgres-partitioning-uuid-v7` gained a rule:** age-based retention drops whole UUIDv7 range
  partitions; a bounded `DELETE` sweep is allowed only when rows in an old range must survive, and
  the table comment says why.
- **`bounded-iteration` gained item 16 and a reference section:** each reconciler stage is its
  own job, with no shared mutable budget, error list, or cursor map, and ordered phases enqueue
  the next phase after commit.
- **New cases `retention-with-survivors` and `review-staged-reconciler`.** Without the plugin
  every attempt failed the outcome grader.
- The two older cases scored higher without the plugin than in their last two-arm runs (0.33 and
  0.00). Their skills changed in this commit, so the runs are not comparable.

## 2026-11-16: `static-code-analysis` adds complexity and five more checks; not re-measured

No run. `static-code-analysis` gained baseline rows for per-file complexity (`scc`, over 50
fails), dependency licenses, and known vulnerabilities (`osv-scanner`); JavaScript rows for React
lint plugins and for `publint` and `attw` on a published package; and rows for Python and Go. The
two `static-code-analysis` rows in `README.md` are not re-measured, and no case checks the new rows
yet.

## 2026-11-16: `npm-publishing` covers the release workflow; not re-measured

No run. `npm-publishing` now states what the publishing job needs for trusted publishing (npm
11.5.1 or newer, checked in the job; `id-token: write`; `registry-url` on `actions/setup-node`; no
npm token) and
links a new reference, `references/release-workflow.md`, with the job and the meaning of `E404`
and `ENEEDAUTH`. Its description now names fixing a CI publish that fails with either error. The
two `npm-publishing` rows in `README.md` are not re-measured. No case covers the new reference
yet.

## 2026-11-16: entry point rule added to `feature-rollout`, with two cases

Sonnet agent, Opus judge. A one-attempt pilot of the three `feature-rollout` cases passed ($0.31).
Then one three-attempt run with both arms, five cases, 30 attempts, $3.44.

| Case                                                     | With | Without |
| -------------------------------------------------------- | ---- | ------- |
| `feature-rollout/dark-route-without-caller`              | 1.00 | 1.00    |
| `feature-rollout/flag-defaults-on`                       | 1.00 | 0.00    |
| `feature-rollout/table-and-service-without-entry-point`  | 1.00 | 0.00    |
| `postgres-schema-design/exact-cap-no-lock`               | 0.67 | 0.00    |
| `postgres-schema-design/review-last-admin-advisory-lock` | 1.00 | 0.00    |

- **`feature-rollout` gained a section:** do not add a table, a service, or a write path that no
  registered entry point reaches. Its description now names a change that adds a table, a
  migration, a service, or a write path.
- **New case `table-and-service-without-entry-point`.** The prompt and the paths do not mention
  a flag or a rollout, so `skill-fired` checks the new trigger. Without the plugin no attempt
  asked for an entry point before merging.
- **New case `dark-route-without-caller` is a guard, not a discriminator.** It scores 1.00
  without the plugin. It is there so the new rule does not make a review reject a mounted,
  flagged route for having no caller. That bends the rule that a case is one the model gets
  wrong without the skill, so `AGENTS.md` now allows a guard case beside a discriminating one.
- **`postgres-schema-design` was run because the new trigger words overlap its description.**
  `exact-cap-no-lock` passed 1 of 3. In both failures the skill loaded and the answer still
  offered an exact cap (a `SERIALIZABLE` transaction, or an exact variant beside the best-effort
  one). A rerun of the two `postgres-schema-design` cases on the same commit, with the plugin
  only, passed 3 of 3 each ($1.04). No run on the commit before was made, so this does not show
  whether the description change had a part. The row in `README.md` is from the rerun.
- **Edited after the run, not re-measured:** both new prompts now say PostgreSQL 18, where
  `uuidv7()` is built in, and the skill counts a worker that subscribes to a queue as a
  registered job.
- The full suite was not rerun.

## 2026-11-15: lockfile conflict rule added to `git-commit-checklist`, with one case

Sonnet agent, Opus judge. One three-attempt run with both arms, four cases, 24 attempts, $2.56.

| Case                                               | With | Without |
| -------------------------------------------------- | ---- | ------- |
| `dependabot/groups-by-family`                      | 1.00 | 0.33    |
| `dependabot/request-update-check`                  | 1.00 | 0.50    |
| `git-commit-checklist/lockfile-conflict-on-rebase` | 1.00 | 0.00    |
| `git-commit-checklist/stages-only-task-files`      | 1.00 | 0.33    |

- **`git-commit-checklist` gained two rules:** let the package manager merge a conflicted
  lockfile and take neither side, and do not commit or push with `--no-verify`. Its description
  now names the lockfile conflict. `dependabot` gained one line that points to it.
- **New case `lockfile-conflict-on-rebase`.** Without the plugin, all three attempts pushed with
  `--no-verify` because the prompt asked to skip the hook, and at least one also took one side of
  the lockfile before reinstalling.
- **No pilot was run** before the measured run.
- **Edited after the run, not re-measured:** a review asked for a fallback when the package
  manager cannot parse a conflicted lockfile. The pnpm step the case checks is unchanged.
- The other three rows are reruns after the skill text changed. `dependabot/request-update-check`
  scored 0.50 without the plugin, against 0.67 in the entry before; nothing in that case changed.
- This is the first run of these skills since two earlier text changes that were not measured: a
  stacked pull request trigger rule in `github-actions-authoring` (not rerun here) and a wording
  change in `review-ci-logs` (not rerun here).

## 2026-11-15: six workflow skills added, with seven cases

Sonnet agent, Opus judge. Two one-attempt pilots with both arms ($2.52, $1.12), a three-attempt
run with both arms ($10.48), a three-attempt run with the plugin only ($5.37), six attempts of
`test-authoring` on this change and on the commit before it ($3.10, $3.18), and a three-attempt
rerun of two changed cases ($0.98).

| Case                                                    | With          | Without |
| ------------------------------------------------------- | ------------- | ------- |
| `agent-workflow/review-round-dispositions`              | 0.67 (2 of 3) | 0.00    |
| `git-commit-checklist/stages-only-task-files`           | 1.00          | 0.33    |
| `github-actions-authoring/required-check-is-a-real-job` | 1.00          | 0.00    |
| `github-issue/search-before-filing`                     | 0.83 (2 of 3) | 0.00    |
| `planning/plan-saved-outside-repo`                      | 1.00          | 0.00    |
| `review-ci-logs/quiet-log-keeps-errors`                 | 1.00          | 1.00    |
| `revisit-followups/only-verified-deferred-work`         | 1.00          | 0.00    |
| `test-authoring/dotnet-private-field-not-reflected`     | 0.83 (4 of 6) | 0.33    |
| `test-authoring/fake-routes-by-request`                 | 1.00 (6 of 6) | 0.00    |
| `test-authoring/fixture-files-not-inline`               | 1.00 (6 of 6) | 0.00    |
| `test-authoring/review-helper-holds-assertions`         | 0.75 (3 of 6) | 0.00    |

- **New skills:** `agent-workflow`, `git-commit-checklist`, `github-issue`, `planning`,
  `review-ci-logs`, `revisit-followups`. `github-actions-authoring` gained a workflow baseline
  reference and a wider description. `test-authoring` gained three rules on failure paths,
  evidence, and docs contracts.
- **Adding skills lowered how often `test-authoring` loads.** Six attempts per case, same hour:
  on the commit before, the skill loaded on 23 of 24 attempts; with the six skills added, 19 of 24. The drop is on the review case (6 of 6 to 3 of 6). On the attempts where it did not load,
  no skill was loaded at all, and the answer still passed. The sample is small.
- **`review-ci-logs` has no case the model fails unaided.** Two were tried: a retry that would
  mask a port collision, and a noisy log quieted by discarding stderr. Both scored 1.00 without
  the plugin. The second is kept so the skill has a case.
- **`git-commit-checklist`:** a case on a force push that names the expected remote tip scored
  1.00 without the plugin in the pilot and was replaced by the staging case.
- **`github-actions-authoring`:** a review case on a draft-transition trigger and cancellation
  on the default branch scored 1.00 without the plugin in the pilot and was replaced.
- **`agent-workflow` prompt changed after the first measured run.** It now says the repository
  has no job queue and that the teammate's comment was checked, because answers hedged on both.
  The "Without" score predates that edit. In the rerun the one failed attempt did not load the
  skill and implemented more than the blocking item.
- **`github-issue`:** its description lost the label and project wording after the two-arm run.
  One of three attempts in the rerun loaded the skill and still failed the answer grader.
- **`fake-routes-by-request` grader:** it failed two answers that routed the fake by path and
  also asserted which paths were requested. That assertion is now allowed; asserting call order
  still fails.
- **`pr-description`** gained rules for diagrams, activation, cost, schema inventories, folded
  detail, and local check gaps, plus an examples reference. Its case was rerun with the plugin
  only ($0.28): 1.00, 3 of 3. The new rules have no case of their own.
- **`scripts/eval-summary.py`** now counts every grader in the score, so a two-arm run and a
  plugin-only run report the same thing.

## 2026-11-15: three `test-authoring` cases added, `dependabot` skill trimmed

Sonnet agent, Opus judge. Two one-attempt pilots with both arms ($1.28, $0.84), a three-attempt
run with both arms ($4.65), then a three-attempt run of `test-authoring` with the plugin only
($1.50). One earlier `dependabot` run is discarded: the skill file changed under it.

| Case                                                | With | Without |
| --------------------------------------------------- | ---- | ------- |
| `dependabot/groups-by-family`                       | 1.00 | 0.33    |
| `dependabot/request-update-check`                   | 1.00 | 0.67    |
| `test-authoring/dotnet-private-field-not-reflected` | 1.00 | 0.33    |
| `test-authoring/fake-routes-by-request`             | 1.00 | 0.00    |
| `test-authoring/fixture-files-not-inline`           | 1.00 | 0.00    |
| `test-authoring/review-helper-holds-assertions`     | 1.00 | 0.00    |

- **`dependabot` skill:** the rules for an auto-merge workflow are removed, and the description
  no longer mentions one. No case or grader changed. Both cases were re-measured in the two-arm
  run; the skill loaded on all six with-plugin attempts.
- **New cases** cover the reference files that had none: `dotnet.md` (no reflection on a private
  field), `dependency-boundaries.md` (a fake that answers by request, not by call order), and
  the helper and re-implementation rules in `SKILL.md` and `tautological-tests.md`.
- **Tried and dropped,** each 1.00 without the plugin in the first pilot: a test broken by a
  dependency upgrade that pinned the dependency's message, a Vitest module mock that keeps the
  real exports, and tests for a module-private function.
- **The .NET prompt was softened after the first pilot.** It said "I want to check the
  dictionary itself this time", and both arms used reflection as asked. That sentence is gone.
- **Three graders were tightened in review, then re-run** with the plugin only ($1.35, 12 of 12).
  The .NET grader accepts a `Count` check only when the test also shows the live session
  remains. The fake grader no longer asks the fake to survive a new request. The review grader
  no longer claims to know the production formula. The "Without" column predates these edits.
- **`vitest.md`, `storybook.md`, and `swift.md` still have no case.**
- **Scoring in a two-arm run:** `claude plugin eval` leaves the `skill-fired` grader out of the
  score when it runs both arms. In the two-arm run the skill did not load on one of three
  attempts for the .NET case and for the review case, and both still scored 1.00. The "With"
  column for `test-authoring` is from the plugin-only run, where the skill loaded on all 12
  attempts. Earlier "With" scores taken from two-arm runs may hide a skill that did not load.

## 2026-11-15: runner rules folded into `test-authoring`

Sonnet agent, Opus judge, three attempts. Two runs: one with both arms ($5.44), then one with the
plugin only ($0.85) after the layout changed.

| Case                                                  | With | Without |
| ----------------------------------------------------- | ---- | ------- |
| `test-authoring/fixture-files-not-inline`             | 1.00 | 0.00    |
| `playwright-authoring/metadata-is-not-a-browser-test` | 1.00 | 0.00    |

- Rules for Vitest (including backend and Next.js), Storybook, Swift, and .NET tests were added.
  The first layout was four new skills, one per runner, each with one case.
- That layout was abandoned. All four new cases scored 1.00 with the plugin and 1.00 without, so
  they showed nothing. And `fixture-files-not-inline` fell to 0.33 (1 of 3): on two attempts
  `test-authoring` did not load, because a runner skill matched the prompt instead.
- The runner rules are now reference files under `skills/test-authoring/references/`, and
  `test-authoring` is the one skill that fires for any test. Its description names the runners.
  The four runner skills and their four cases are removed.
- `fixture-files-not-inline` is back to 3 of 3 in the second run. The "Without" column is from the
  first run; the second run had no no-plugin arm.
- The runner reference files have no case of their own. A case needs a decision the model gets
  wrong unaided, and the four tried (shared-database test identity, a story for a server
  component, a delayed `URLProtocol` double, a separate portable test project) were not that.

## 2026-11-15: review fixes to two replaced cases, re-measured

Sonnet agent, Opus judge, three attempts per arm, $1.73.

| Case                                                           | With          | Without |
| -------------------------------------------------------------- | ------------- | ------- |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | 0.67 (2 of 3) | 0.33    |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00          | 0.00    |

- The dispatcher prompt's job id used a colon, which the queue library rejects in a custom id. It
  now uses a hyphen.
- The query grader now also requires the account and status filters, newest-first ordering, and
  `id` as a tie-breaker in the ordering and the cursor.
- On the dispatcher case the `bounded-iteration` skill did not load on one of three attempts, and
  that attempt's review missed the job id. Across the three with-plugin runs of this case the
  skill loaded on 7 of 9 attempts. The description was not changed; watch it on the next full
  run. `README.md` carries this run's row.

## 2026-11-15: three ceiling cases replaced

Sonnet agent, Opus judge, three attempts per arm, five targeted runs ($2.80, $2.64, $1.59, $0.86,
and one stopped early). The three cases that scored 1.00 without the plugin are replaced.

| Case                                                           | With | Without |
| -------------------------------------------------------------- | ---- | ------- |
| `bounded-iteration/review-dispatcher-predicate-and-job-id`     | 1.00 | 0.00    |
| `postgres-node-performance-tuning/new-query-named-and-indexed` | 1.00 | 0.00    |
| `postgres-schema-design/review-last-admin-advisory-lock`       | 1.00 | 0.00    |

- **`new-query-named-and-indexed`** keeps the prompt of `new-query-shape-gets-index`. The grader
  now also requires the operation-name comment on the statement, which the model does not write
  on its own.
- **`review-dispatcher-predicate-and-job-id`** replaces `review-sweep-until-empty`. The model
  already asks for a cap on an unbounded loop. The new diff is capped and tests two things the
  model misses: a predicate no index can serve, and a job id keyed only by the entity. The first
  version of the prompt described the queue's deduplication and scored 1.00 without the plugin;
  naming the queue library instead brought that to 0.33. A review then pointed out that the
  grader's claim "no index can serve the predicate" is wrong: a partial index with the same
  predicate can. The grader now accepts that remedy, the prompt states the table's indexes, and
  a fifth run ($0.86) scored 1.00 with and 0.00 without.
- **`review-last-admin-advisory-lock`** replaces `review-parent-row-lock`. Two things changed
  before it passed:
  - The skill did not load on any of the first three attempts, and the agent approved the lock.
    The `postgres-schema-design` description now names row locks, advisory locks, serializing
    writers, and last-one guards. It loaded on 5 of 6 attempts after.
  - The grader failed answers that removed the lock and then offered `SERIALIZABLE` with `40001`
    as 409 if the guard must be exact. The skill allows that, so the grader now does too.
- The three `README.md` rows are from these runs, not from the 33-case run.

## 2026-11-15: `structured-logging` case replaced again, skill extended

Sonnet agent, Opus judge, three attempts per arm.

| Case                                           | With | Without | Cost  |
| ---------------------------------------------- | ---- | ------- | ----- |
| `structured-logging/add-refund-logs`           | 1.00 | 1.00    | $0.79 |
| `structured-logging/log-identifier-not-lookup` | 1.00 | 0.00    | $0.76 |

- A review pointed out that `review-refund-batch-logs`, the skill's only case, passed without the
  plugin. A second attempt, `add-refund-logs`, also passed without it: the model writes a static
  message with fields on its own. Both are removed.
- What the model does not do on its own is decline a lookup when asked to log a value behind one.
  The skill gained a section for that (log the identifier, add no queries for a log line, keep
  personal data out of logs), and `log-identifier-not-lookup` uses the prompt of the first,
  abandoned case. With the earlier skill text that prompt scored 0.00 in both arms.
- The `structured-logging` row in `README.md` is from this run. It was not part of the 33-case
  run below, which measured `review-refund-batch-logs`.

## 2026-11-15: full single-arm run, 33 cases

Sonnet agent, Opus judge, three attempts, with the plugin only. Claude Code 2.1.325, 99 attempts,
$15.38. Run on the change that added the twelve rule skills.

- All 33 cases scored 1.00, 3 of 3.
- `glide-mq/never-enqueue-and-wait` and `static-code-analysis/new-typescript-library`, which each
  missed one attempt in the 21-case run, passed all three here. Nothing about them changed.

## 2026-11-15: twelve rule skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm. First run of the twelve new cases ($8.26), then
a rerun of the five that changed ($3.22). Rows marked "rerun" are from the second run.

| Case                                                  | With | Without | Run   |
| ----------------------------------------------------- | ---- | ------- | ----- |
| `documentation/review-readme-drift`                   | 1.00 | 0.00    | rerun |
| `feature-rollout/flag-defaults-on`                    | 1.00 | 0.00    | rerun |
| `http-api-design/action-body-and-raw-tokens`          | 1.00 | 0.33    | first |
| `native-app-architecture/core-tests-and-web-view`     | 1.00 | 0.00    | first |
| `playwright-authoring/metadata-is-not-a-browser-test` | 1.00 | 0.00    | rerun |
| `pr-description/perf-change-with-flag`                | 1.00 | 0.00    | first |
| `react-app-structure/review-profile-card`             | 1.00 | 0.33    | first |
| `rust-authoring/tests-in-separate-file`               | 1.00 | 0.00    | rerun |
| `service-boundaries/partner-webhook`                  | 1.00 | 0.33    | first |
| `structured-logging/review-refund-batch-logs`         | 1.00 | 1.00    | rerun |
| `test-authoring/fixture-files-not-inline`             | 1.00 | 0.00    | first |
| `typescript-authoring/rename-without-alias`           | 1.00 | 0.00    | first |

Changes between the first run and the rerun:

- **`structured-logging` case replaced.** The first case, `refund-failure-log`, scored 0.00 in
  both arms. Its prompt asked for the customer's email in the log line, which the skill tells the
  agent not to fetch, so the agent followed the request. That was a badly posed case, not a skill
  failure. The replacement is a review of a diff. It scores 1.00 without the plugin, so it is a
  ceiling case and needs a harder prompt.
- **`playwright-authoring` case replaced.** `redirect-is-not-a-browser-test` scored 1.00 without
  the plugin: a prompt that says "301" leads to an HTTP test on its own. The replacement adds page
  metadata checks and does not say how to test them.
- **`rust-authoring/tests-in-separate-file` prompt shortened.** The sentence "Show me exactly what
  goes in which file" hinted at a separate file; the case scored 1.00 without the plugin. Without
  the sentence it scores 0.00.
- **`feature-rollout/flag-defaults-on` grader narrowed.** It required the answer to say the deploy
  is "confirmed healthy" before enabling. One attempt set the flag off, kept the fallback off, and
  separated deployed from enabled, and failed on that wording alone. The grader now asks only that
  enabling is a separate step.
- **`documentation` description extended.** The skill did not load on 2 of 3 attempts of a diff
  review. The description now names a diff that changes docs or comments. It loaded 3 of 3 after.

## 2026-11-15: no-plugin arm for the two `evals` cases

Sonnet agent, Opus judge, three attempts per arm, `EVAL_ABLATION=with-without`, $2.10.

| Case                         | With | Without |
| ---------------------------- | ---- | ------- |
| `evals/document-new-suite`   | 1.00 | 0.00    |
| `evals/record-partial-rerun` | 1.00 | 0.00    |

Both cases fail without the plugin on all three attempts, so neither is a ceiling case.

## 2026-11-15: first full single-arm run, 21 cases

Sonnet agent, Opus judge, three attempts, with the plugin only. Claude Code 2.1.325, 63 attempts,
$10.55. Run on the change that added the `evals` skill, on top of `baf9931`.

- 19 of 21 cases passed all three attempts. This is the first run in which every row comes from
  one run, and the first to measure the dependabot cases after the skill's last edit and
  `npm-publishing/existing-package-trust-only` after its grader was restored. All four scored
  1.00.
- `glide-mq/never-enqueue-and-wait` 0.83 (2 of 3). The failing attempt returned 202 and polled,
  but kept the job on the shared `background` queue in a separate ordering lane. The grader asks
  for its own queue, as the skill does. Not changed; watch it on the next run.
- `static-code-analysis/new-typescript-library` 0.89 (2 of 3). On one attempt the judge voted
  1 pass to 2 fails on the list of checks. Not changed.
- New cases `evals/document-new-suite` and `evals/record-partial-rerun` scored 1.00. Their
  no-plugin arm is in the entry above.
- The new Markdown files under `evals/` were not picked up as cases: the runner found 21.

## 2026-11-15: default run drops the no-plugin arm

- `pnpm run evals` now runs with the plugin only (`--ablation none`). The no-plugin arm is opt-in
  with `EVAL_ABLATION=with-without`, for checking a new case.
- Under a single arm the `skill-fired` grader counts toward a case's score. In the entries below
  it was an indicator outside the score, so a with-plugin score here can be lower than there for
  the same answers.
- Added `evals/README.md`, `evals/HISTORY.md`, and `evals/AGENTS.md`, and the `evals` skill with
  two cases: `evals/document-new-suite` and `evals/record-partial-rerun`.

## 2026-11-15: database and queue skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm, on the commit that added the five database and
queue skills.

| Case                                                          | With | Without |
| ------------------------------------------------------------- | ---- | ------- |
| `postgres-schema-design/exact-cap-no-lock`                    | 1.00 | 0.00    |
| `postgres-schema-design/review-parent-row-lock`               | 1.00 | 1.00    |
| `postgres-node-performance-tuning/new-query-shape-gets-index` | 1.00 | 1.00    |
| `postgres-partitioning-uuid-v7/range-not-hash`                | 1.00 | 0.00    |
| `bounded-iteration/review-sweep-until-empty`                  | 1.00 | 1.00    |
| `glide-mq/never-enqueue-and-wait`                             | 1.00 | 0.00    |
| `glide-mq/review-webhook-lane`                                | 1.00 | 0.33    |
| `github-actions-authoring/publish-gated-on-ci`                | 1.00 | 0.00    |
| `github-actions-authoring/rejects-polling`                    | 1.00 | 0.67    |
| `package-json-checklist/workspace-dependency-and-export`      | 1.00 | 0.67    |

- Three cases score 1.00 without the plugin: `review-parent-row-lock`,
  `new-query-shape-gets-index`, and `review-sweep-until-empty`. They show that the skill fires and
  does no harm, not that it changes the answer. They need harder prompts.
- `review-sweep-until-empty` was written here. The benchmark case it stands in for was not
  available.

## 2026-11-15: first seven skills, with and without the plugin

Sonnet agent, Opus judge, three attempts per arm. The rows come from more than one run: the
dependabot, npm-publishing, and triage rows are from a rerun after the last grader and fixture
changes, the rest from the last full run.

| Case                                                     | With | Without |
| -------------------------------------------------------- | ---- | ------- |
| `dependabot/groups-by-family`                            | 1.00 | 0.33    |
| `dependabot/request-update-check`                        | 1.00 | 0.33    |
| `github-actions-authoring/rejects-polling`               | 1.00 | 0.50    |
| `npm-publishing/bootstrap-new-package`                   | 1.00 | 0.40    |
| `npm-publishing/existing-package-trust-only`             | 1.00 | 0.73    |
| `package-json-checklist/workspace-dependency-and-export` | 1.00 | 0.67    |
| `static-analysis-checklist/parses-yaml-with-fixtures`    | 1.00 | 0.50    |
| `static-code-analysis/new-rust-service`                  | 1.00 | 0.83    |
| `static-code-analysis/new-typescript-library`            | 1.00 | 0.00    |
| `triage-codex-security/approval-wave-cap`                | 1.00 | 0.50    |
| `triage-codex-security/repository-mismatch`              | 1.00 | 0.78    |

Changes during this batch that moved scores:

- **`triage-codex-security/approval-wave-cap` fixture replaced.** It scored 0.67 with the plugin
  (7 of 9 attempts across earlier runs). Its findings had arguable verdicts; they were replaced
  with unambiguous ones, and the case then passed 3 of 3.
- **Graders anchored to the Bash `"command"` input.** Patterns over the whole transcript matched
  the prompt and the fixture.
- **`npm-publishing/existing-package-trust-only` grader widened, then reverted.** A review
  suggestion removed the `--otp` anchor from `no-publish-command`. The case dropped to 0.80
  because the fixture's own `release.yml` contains an `npm publish` line. The anchor was
  restored and checked by pattern against three kept traces; the case was not re-run in this
  batch.
- **Dependabot skill edited after its last run** (eligibility is rechecked on every new head).
  The two dependabot rows predate that edit.
