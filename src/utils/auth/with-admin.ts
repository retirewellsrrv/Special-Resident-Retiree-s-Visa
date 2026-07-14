import { requireRole } from "@/utils/auth/getUser";
import type { UserRole } from "@/utils/auth/getUser";

type AnyFn = (...args: any[]) => Promise<Record<string, any>>;

/**
 * Wraps a Server Action with a role check. If unauthorized,
 * returns `{ error, success: false }` matching the shape most
 * admin actions already use for error responses.
 */
function withRoleCheck(allowedRoles: UserRole[], fn: AnyFn): AnyFn {
  return async (...args: any[]) => {
    const auth = await requireRole(allowedRoles);
    if (!auth.authorized) return { error: auth.error, success: false };
    return fn(...args);
  };
}

/**
 * Require the caller to be an admin or super_admin.
 */
export const withAdmin = (fn: AnyFn): AnyFn =>
  withRoleCheck(["admin", "super_admin"], fn);

/**
 * Require the caller to be a super_admin only.
 */
export const withSuperAdmin = (fn: AnyFn): AnyFn =>
  withRoleCheck(["super_admin"], fn);
