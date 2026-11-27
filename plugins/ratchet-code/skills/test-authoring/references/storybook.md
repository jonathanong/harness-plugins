# Storybook

These rules add to the general ones in the skill.

- Keep a direct story for each supported state of a reusable component, with realistic args and
  fixtures.
- Keep story data local and deterministic: no network, no clock, no random values.
- Expose each important visual or interaction variant as its own story.
- Add browser-mode coverage where it catches behavior a unit test cannot see, and where the story
  owns the component's contract.
- When a component needs a server-only module, request context, or an import that breaks in the
  browser, split out the presentational surface and write the story for that, or alias the
  boundary to a deterministic fixture. Do not make the story fetch real data.
- Do not use a story as end-to-end setup, and do not put production data handling in one.
- Fix an accessibility violation in the component first: focusable scroll areas, contrast, labels.
  Mark decorative content `aria-hidden="true"`; `role="presentation"` is a semantic role, not a
  suppression. Only when valid production behavior cannot satisfy the rule, suppress it narrowly,
  in that one story, with a comment naming the production constraint.
- Let story discovery follow the module graph and the glob configuration. Do not maintain a
  second, hand-written list of stories, and do not assume a browser at module top level.

A consuming repository owns Storybook configuration, exclusions, visual baselines, and commands.
