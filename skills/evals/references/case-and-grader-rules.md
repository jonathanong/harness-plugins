# Case and grader rules

Defaults for the `Cases` and `Graders` parts of a suite's `AGENTS.md`. Adopt the ones the suite can enforce.

**Cases**

- Give every case a baseline arm when the runner supports one.
- Write prompts the way the request is really asked. Do not use the vocabulary of the thing under
  test; a prompt that quotes it measures recall of the wording.
- Build each case on a decision the model gets wrong on its own. Check that by running the
  baseline arm before keeping the case.
- Make the prompt well posed. If the agent cannot reach something the task needs, say so in the
  prompt, or both arms spend their turns discovering it.
- Add cases where the thing under test must stay out of the way, and grade that it did.
- Keep fixtures synthetic. Point anything that could publish, deploy, pay, or write to a hosted
  service at a dead local endpoint, and grade the attempt, not the effect.

**Graders**

- Grade the outcome, not the wording. Use a model-judged grader for a judgment and a deterministic
  grader (regular expression, tool call, file check) for a fact.
- Anchor a pattern to where the action happens, such as the command an agent ran. A pattern over
  the whole transcript also matches the fixture and the prompt.
- State both what passes and what fails in a judged grader. Say that a correct refusal passes.
- Use a different model for the judge than for the agent, and name both in every result.
- A grader that only detects that the thing under test was used never stands as a case's only
  evidence.
