SELECT id, owner_id AS "ownerId", balance_cents AS "balanceCents", closed_at AS "closedAt"
  FROM accounts
 WHERE id = $1
