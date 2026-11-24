import Router from '@koa/router'
import { creditAccount, findAccount } from '../db/accounts.ts'

export const credits = new Router()

credits.post('/accounts/:id/credits', async (ctx) => {
  const { amountCents, reference } = ctx.request.body as { amountCents: number; reference: string }
  if (!Number.isInteger(amountCents) || amountCents <= 0 || !reference) ctx.throw(422)

  const account = await findAccount(ctx.params.id)
  if (!account || account.ownerId !== ctx.state.userId) ctx.throw(404)

  const balanceCents = await creditAccount(account, amountCents, reference)
  if (balanceCents === null) ctx.throw(409, 'account is closed or the reference was already used')

  ctx.status = 201
  ctx.body = { balanceCents }
})
