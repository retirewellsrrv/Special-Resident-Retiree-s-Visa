-- ✅ Prevent duplicate active payments for the same user + service type.
--    A user may only ever have one 'pending' OR 'success' payment per
--    service type, so a bailed-out invoice that is later paid can never
--    create a second successful payment.

-- First, demote any pre-existing duplicate active payments to 'failed',
-- keeping only the most recent one per (user_id, service_type).
WITH ranked AS (
  SELECT
    id,
    user_id,
    service_type,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, service_type
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.payments
  WHERE status IN ('pending', 'success')
)
UPDATE public.payments p
SET status = 'failed',
    updated_at = now()
FROM ranked r
WHERE p.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS payments_one_active_per_user_service_idx
  ON public.payments (user_id, service_type)
  WHERE status IN ('pending', 'success');