/**
 * Allowed values for the `type` column on `notifications` and
 * `admin_notifications`. Kept as a TS union (not a DB enum) so the four
 * insert sites are type-checked without a schema migration.
 */
export type NotificationType =
  | 'new_consultation'
  | 'new_application'
  | 'application_status'
  | 'consultation_status'
