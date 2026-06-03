import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export type UserRole = 'admin' | 'applicant'

export async function getUser(){
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }
    return user
}

export async function getUserRole(): Promise<UserRole | null>{
    const user = await getUser();
    if (!user) return null;
    return (user.user_metadata.role as UserRole) || null;
}

export async function assertRole(role: UserRole) {
    const currentRole = await getUserRole();
    if (currentRole !== role) {
        redirect('/unauthorized')
    }
}