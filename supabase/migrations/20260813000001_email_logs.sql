-- ─────────────────────────────────────────────
-- EMAIL DELIVERY AUDIT LOG
-- Tracks every outbound email attempt (sent / failed / skipped)
-- for SRRV record-keeping. Written exclusively by the service-role
-- client (RLS bypass); no policies are granted, so authenticated
-- users cannot read or write it directly.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_logs (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  to_address   text NOT NULL,
  from_address text,
  subject      text,
  status       text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_logs_created_at_idx
  ON email_logs (created_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
