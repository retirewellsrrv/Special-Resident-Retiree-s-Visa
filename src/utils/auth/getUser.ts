import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import { createClient as createServerClient, createAdminClient } from "@/lib/supabase/server";

export type UserRole = 'super_admin' | 'admin' | 'applicant'

export async function getUser(){
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser()
    return user
}

export async function getUserServer() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getUserRole(): Promise<UserRole | null>{
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
      return null;
    } catch {
      return null;
    }
}

export async function assertRole(role: UserRole) {
    const currentRole = await getUserRole();
    if (currentRole !== role) {
        redirect('/unauthorized')
    }
}