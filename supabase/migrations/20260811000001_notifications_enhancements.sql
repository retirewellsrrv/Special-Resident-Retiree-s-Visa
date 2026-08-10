-- ✅ Applicant notifications: add timestamp + deep-link/type metadata
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS link text;

-- ✅ Admin notification center (mirrors `notifications` but for admin users,
--    whose user_id does not exist in client_profiles).
CREATE TABLE IF NOT EXISTS admin_notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES admin_profiles(user_id) ON DELETE CASCADE,
  notification text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  type text,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_notifications_admin_user_id_idx
  ON admin_notifications (admin_user_id, id DESC);