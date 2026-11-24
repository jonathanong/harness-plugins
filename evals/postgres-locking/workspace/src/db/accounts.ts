import { runNamed } from './named.ts'

export type Account = { id: string; ownerId: string; balanceCents: number; closedAt: Date | null }

export async function findAccount(id: string): Promise<Account | null> {
  const rows = await runNamed<Account>('find-account', [id])
  return rows[0] ?? null
}

/** Credits the account and returns its new balance, or null if the credit was not applied. */
export async function creditAccount(
  account: Account,
  amountCents: number,
  reference: string,
): Promise<number | null> {
  const rows = await runNamed<{ balanceCents: number }>('apply-credit', [
    account.id,
    amountCents,
    reference,
  ])
  return rows[0]?.balanceCents ?? null
}
