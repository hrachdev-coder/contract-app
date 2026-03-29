-- Contract acceptance audit trail fields
-- Adds immutable evidence metadata to strengthen enforceability

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS accepted_ip text;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS accepted_user_agent text;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS accepted_consent boolean;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS accepted_consent_text text;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS contract_hash text;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS contract_snapshot jsonb;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS acceptance_evidence jsonb;

CREATE INDEX IF NOT EXISTS contracts_accepted_at_idx
  ON public.contracts (accepted_at);
