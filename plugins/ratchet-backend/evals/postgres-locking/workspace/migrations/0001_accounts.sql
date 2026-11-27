CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  owner_id uuid NOT NULL,
  balance_cents bigint NOT NULL DEFAULT 0,
  closed_at timestamptz,
  CONSTRAINT accounts_balance_cents_non_negative CHECK (balance_cents >= 0)
);

COMMENT ON TABLE accounts IS 'One prepaid balance per owner.';
COMMENT ON COLUMN accounts.balance_cents IS 'Current balance in cents. Never negative.';
COMMENT ON COLUMN accounts.closed_at IS 'When the account was closed. Null while open.';

CREATE TABLE account_credits (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,
  reference text NOT NULL,
  CONSTRAINT account_credits_amount_cents_positive CHECK (amount_cents > 0),
  CONSTRAINT account_credits_reference_key UNIQUE (account_id, reference)
);

COMMENT ON TABLE account_credits IS 'One row per credit applied to an account.';
COMMENT ON COLUMN account_credits.reference IS 'The caller''s reference for this credit; a repeat is rejected.';

CREATE INDEX idx_account_credits_account_id ON account_credits (account_id);
