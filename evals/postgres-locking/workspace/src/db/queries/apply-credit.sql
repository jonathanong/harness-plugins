WITH credit AS (
  INSERT INTO account_credits (account_id, amount_cents, reference)
  SELECT $1, $2, $3
   WHERE EXISTS (SELECT FROM accounts WHERE id = $1 AND closed_at IS NULL)
  ON CONFLICT ON CONSTRAINT account_credits_reference_key DO NOTHING
  RETURNING amount_cents
)
UPDATE accounts
   SET balance_cents = balance_cents + credit.amount_cents
  FROM credit
 WHERE accounts.id = $1
   AND accounts.closed_at IS NULL
RETURNING balance_cents AS "balanceCents"
