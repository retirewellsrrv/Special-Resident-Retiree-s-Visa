"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import {
  clientProfileSchema,
  ApplicationStatusEnum,
} from "@/schemas/client-profiles";
import { withAdmin } from "@/utils/auth/with-admin";
import { getUser } from "@/utils/auth/getUser";

export type ActionState = { error: string | null; success: boolean };

export type ClientRow = {
    user_id: string
    name: string
    application_code: string
    status: string
    updated_at: string
}

export type ClientStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paused: number;
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const getClientStats = unstable_cache(
  async (): Promise<ClientStats> => {
  const supabase = createAdminClient();

  const [
    { count: total },
    { count: pendingCount },
    { count: approved },
    { count: rejected },
    { count: paused },
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "paused"),
  ]);

  return {
    total: total ?? 0,
    pending: pendingCount ?? 0,
    approved: approved ?? 0,
    rejected: rejected ?? 0,
    paused: paused ?? 0,
  };
},
  ["admin-profiles"],
  { revalidate: 30, tags: ["admin-profiles"] },
)

export const getClientDirectory = unstable_cache(
  async ({
    page = 1,
    limit = 10,
    filter = "all",
    status,
    q,
    application_code,
  }: {
    page?: number;
    limit?: number;
    filter?: "all" | "new";
    status?: string;
    q?: string;
    application_code?: string;
  } = {}): Promise<{ rows: ClientRow[]; total: number }> => {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("applications")
    .select(
      `
            id,
            user_id,
            application_code,
            status,
            updated_at,
            created_at,
            client_profiles!applications_user_id_fkey (
                name
            )
            `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filter === "new") {
    const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
    query = query.gte("created_at", cutoff);
  }
  if (status) query = query.eq("status", status as any);
  if (q) {
    const { data: matching } = await supabase
      .from("client_profiles")
      .select("user_id")
      .ilike("name", `%${q}%`)
    const ids = (matching ?? []).map((u) => u.user_id)
    query = query.in("user_id", ids.length > 0 ? ids : [''])
  }
  if (application_code) query = query.ilike("application_code", `%${application_code}%`);

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const rows: ClientRow[] = (data ?? []).map((row: any) => ({
        user_id: row.user_id,
        name: row.client_profiles?.name ?? 'Unknown',
        application_code: row.application_code,
        status: row.status,
        updated_at: row.updated_at,
    }))

  return { rows, total: count ?? 0 };
},
  ["admin-profiles-directory"],
  { revalidate: 30, tags: ["admin-profiles"] },
)

export async function getClientProfiles() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("client_profiles")
    .select("user_id, name, sex, birthday, nationality, age")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export const updateClientProfile = withAdmin(async function updateClientProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const userId = formData.get("user_id");
  if (!userId || typeof userId !== "string")
    return { error: "Missing user ID", success: false };

  const raw = {
    name: formData.get("name"),
    sex: formData.get("sex"),
    birthday: formData.get("birthday"),
    nationality: formData.get("nationality"),
    age: ((v) => (v ? Number(v) : undefined))(formData.get("age")),
  };

  const parsed = clientProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Validation failed",
      success: false,
    };
  }

  const { error } = await supabase
    .from("client_profiles")
    .update(parsed.data)
    .eq("user_id", userId);

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/profiles");
  revalidateTag("admin-profiles", 'seconds');
  return { error: null, success: true };
})

export const resolveReview = withAdmin(async function resolveReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const client_id = formData.get("user_id");
  if (!client_id || typeof client_id !== "string")
    return { error: "Missing user ID", success: false };

  const { error } = await supabase
    .from("applications")
    .update({
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", client_id);

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/profiles");
  revalidateTag("admin-profiles", 'seconds');
  return { error: null, success: true };
})

export const createClientProfile = withAdmin(async function createClientProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const raw = {
    name: formData.get("name"),
    sex: formData.get("sex"),
    birthday: formData.get("birthday"),
    nationality: formData.get("nationality"),
    age: ((v) => (v ? Number(v) : undefined))(formData.get("age")),
  };

  const parsed = clientProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Validation failed",
      success: false,
    };
  }

  const currentUser = await getUser()
  if (!currentUser) {
    return { error: "Authentication required", success: false };
  }
  const { error } = await supabase.from("client_profiles").insert({
    ...parsed.data,
    age: parsed.data.age ?? 0,
    user_id: currentUser.id,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/profiles");
  revalidateTag("admin-profiles", 'seconds');
  return { error: null, success: true };
})

export const updateApplicationStatus = withAdmin(async function updateApplicationStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const client_id = formData.get("user_id");
  const status = formData.get("status");

  if (!client_id || typeof client_id !== "string")
    return { error: "Missing user ID", success: false };

  const parsed = ApplicationStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid status value", success: false };

  const { error } = await supabase
    .from("applications")
    .update({
      status: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", client_id);

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/profiles");
  revalidateTag("admin-profiles", 'seconds');
  return { error: null, success: true };
})
