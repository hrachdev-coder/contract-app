-- Contract status system
-- Adds: status, public_token, feedback

-- 1) Status column (text, NOT NULL, default 'sent')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contracts'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.contracts
      ADD COLUMN status text NOT NULL DEFAULT 'sent';
  ELSE
    -- Ensure existing rows remain valid
    UPDATE public.contracts
      SET status = 'sent'
      WHERE status IS NULL;

    ALTER TABLE public.contracts
      ALTER COLUMN status SET DEFAULT 'sent';

    ALTER TABLE public.contracts
      ALTER COLUMN status SET NOT NULL;
  END IF;
END
$$;

-- 2) Token + feedback columns
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS public_token text;

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS feedback text;

-- 3) Unique constraint for public_token
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contracts_public_token_unique'
  ) THEN
    ALTER TABLE public.contracts
      ADD CONSTRAINT contracts_public_token_unique UNIQUE (public_token);
  END IF;
END
$$;

-- 4) Backfill existing statuses (best-effort)
UPDATE public.contracts
  SET status = 'sent'
  WHERE status = 'pending';

UPDATE public.contracts
  SET status = 'completed'
  WHERE status = 'signed';

