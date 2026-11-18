import { referencesPath } from './path-references.mts'
import type { HookPayload, PathTypoRule } from './types.mts'

/** True when `token` is the segment, or has it as a leading, trailing, or interior path segment. */
function tokenReferencesSegment(token: string, segment: string): boolean {
  return (
    token === segment ||
    token.startsWith(`${segment}/`) ||
    token.endsWith(`/${segment}`) ||
    token.includes(`/${segment}/`)
  )
}

/** The first typo rule the payload or command references, or undefined. */
export function findPathTypo(
  payload: HookPayload,
  command: string,
  rules: readonly PathTypoRule[],
): PathTypoRule | undefined {
  return rules.find((rule) =>
    referencesPath(payload, command, (token) => tokenReferencesSegment(token, rule.segment)),
  )
}
