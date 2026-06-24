import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
    const metadataRole = user.user_metadata.role as UserRole | undefined;

    // Check super_admin_profiles — overrides metadata role
    try {
      const supabase = await createServerClient();
      const { data: superAdminProfile } = await supabase
        .from('super_admin_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (superAdminProfile) return 'super_admin';
    } catch {
      // fall through to metadata role if DB query fails
    }

    return metadataRole || null;
}

export async function assertRole(role: UserRole) {
    const currentRole = await getUserRole();
    if (currentRole !== role) {
        redirect('/unauthorized')
    }
}