import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type UserRole = 'super_admin' | 'admin' | 'applicant'

/**
 * Fetches the current authenticated user.
 * Wrapped in React.cache() so multiple calls within the same request
 * hit Supabase Auth only once.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export async function getUserServer() {
  return getUser()
}

/**
 * Resolves the current user's role by checking super_admin_profiles,
 * then admin_profiles. Wrapped in React.cache() so the 2 DB queries
 * execute at most once per request, no matter how many admin actions
 * call requireAdmin().
 */
export const getUserRole = cache(async (): Promise<UserRole | null> => {
    const user = await getUser();
    if (!user) return null;

    try {
      const adminSupabase = createAdminClient();

      const [{ data: superAdminProfile }, { data: adminProfile }] = await Promise.all([
        adminSupabase
          .from('super_admin_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle(),
        adminSupabase
          .from('admin_profiles')
          .select('is_active')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (superAdminProfile) return 'super_admin';
      if (adminProfile?.is_active) return 'admin';
      return 'applicant';
    } catch {
      return null;
    }
})

export async function assertRole(role: UserRole) {
    const currentRole = await getUserRole();
    if (currentRole !== role) {
        redirect('/unauthorized')
    }
}

// ── Authorization helpers for Server Actions ──────────────────────────────────

type AuthResult =
  | { authorized: true }
  | { authorized: false; error: string }

/**
 * Checks that the current user has one of the allowed roles.
 * Returns `{ authorized: false; error }` instead of redirecting,
 * so Server Actions can return a proper error response.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
  const role = await getUserRole();
  if (!role) {
    return { authorized: false, error: 'Authentication required. Please log in.' };
  }
  if (!allowedRoles.includes(role)) {
    return { authorized: false, error: 'Forbidden. You do not have permission to perform this action.' };
  }
  return { authorized: true };
}

/**
 * Require the caller to be an admin or super_admin.
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(['admin', 'super_admin']);
}

/**
 * Require the caller to be a super_admin only.
 */
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireRole(['super_admin']);
}

/**
 * Require the caller to be an applicant only.
 */
export async function requireApplicant(): Promise<AuthResult> {
  return requireRole(['applicant']);
}

