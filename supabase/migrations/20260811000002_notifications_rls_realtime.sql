-- ─────────────────────────────────────────────
-- NOTIFICATIONS: Realtime + RLS
-- Enables Supabase Realtime delivery for the two
-- notification tables and locks them down with RLS.
-- Idempotent: safe to re-run via `supabase db push`.
-- ─────────────────────────────────────────────

-- 1) Add both tables to the default realtime publication.
--    Realtime postgres_changes only emits events for tables
--    present in a publication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'admin_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  END IF;
END $$;

-- 2) RLS — enable + scoped policies.
--    App writes go through the service-role client (RLS bypass),
--    so only the browser-facing operations need policies:
--      SELECT  → realtime delivery + user-scoped reads
--      UPDATE  → "mark read" via the authenticated client
--      DELETE  → "clear all" via the authenticated client
--    Admin rows are keyed on admin_user_id (admin_profiles).

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- ── notifications (applicant-facing) ──────────────────────────

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── admin_notifications (admin-facing) ────────────────────────
-- Reads/mark-read/clear happen via the service-role client, so a
-- single SELECT policy is enough (also powers realtime delivery).

DROP POLICY IF EXISTS "admin_notifications_select_own" ON public.admin_notifications;
CREATE POLICY "admin_notifications_select_own"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid());
