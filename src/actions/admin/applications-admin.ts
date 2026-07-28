"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { ApplicationStatusEnum } from "@/schemas/client-profiles";
import { withAdmin } from "@/utils/auth/with-admin";

export type AppRow = {
    id: number
    client_id: string
    name: string
    application_code: string
    status: string
    created_at: string
    updated_at: string
}

export type AppStats = {
  total: number;
  paused: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type ActionState = { error: string | null; success: boolean };

export const getApplicationStats = unstable_cache(
  async (): Promise<AppStats> => {
  const supabase = createAdminClient();

  const [
    { count: total },
    { count: paused },
    { count: pendingCount },
    { count: approved },
    { count: rejected },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "paused"),
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
  ]);

  return {
    total: total ?? 0,
    paused: paused ?? 0,
    pending: pendingCount ?? 0,
    approved: approved ?? 0,
    rejected: rejected ?? 0,
  };
},
  ["admin-applications-stats"],
  { revalidate: 30, tags: ["admin-applications"] },
)

function escapeSearch(val: string) {
  return val.replace(/[%_]/g, '\\$&')
}

export async function getApplications({
  page = 1,
  limit = 10,
  status,
  userId,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  search?: string;
} = {}): Promise<{ rows: AppRow[]; total: number }> {
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
            created_at,
            updated_at,
            client_profiles!applications_user_id_fkey (
                name
            )
            `,
            { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)

    if (status) query = query.eq('status', status as Database['public']['Enums']['application_status'])
    if (userId) query = query.eq('user_id', userId)

    if (search) {
      const q = escapeSearch(search)
      const { data: matchingUsers } = await supabase
        .from('client_profiles')
        .select('user_id')
        .ilike('name', `%${q}%`)
      const targetIds = (matchingUsers ?? []).map((u) => u.user_id)
      const appCodeCond = `application_code.ilike.%${q}%`
      if (targetIds.length > 0) {
        const userIdConds = targetIds.map((id) => `user_id.eq.${id}`).join(',')
        query = query.or(`${userIdConds},${appCodeCond}`)
      } else {
        query = query.ilike('application_code', `%${q}%`)
      }
    }

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    const rows: AppRow[] = (data ?? []).map((row: any) => ({
        id: row.id,
        client_id: row.user_id,
        name: row.client_profiles?.name ?? 'Unknown',
        application_code: row.application_code,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }))

  return { rows, total: count ?? 0 };
}

export type AppDetail = {
  id: number
  user_id: string
  application_code: string
  status: string
  created_at: string
  updated_at: string
  applicant_name: string
  phone_number: string
  email?: string
  street: string
  ph_address: string | null
  emergency_name: string | null
  emergency_phone: string | null
  emergency_relationship: string | null
  future_plans: string | null
  applicant_profile: {
    civil_status: string
    date_of_birth: string
    gender: string
    height: number
    first_name: string
    last_name: string
    middle_name: string
    nationality: string
    place_of_birth: string
    religion: string
    weight: number
  } | null
  passport: {
    passport_number: string
    date_of_issue: string
    expiration: string
    place_of_issue: string
  } | null
  visa_details: {
    entry_visa_type: string | null
    date_of_arrival: string | null
    exp_date_tourist_visa: string | null
  } | null
  educations: {
    school: string
    location: string
    start_date: string
    end_date: string
  }[]
  employments: {
    company_name: string | null
    company_address: string | null
    contact_no: string | null
    job_title: string | null
    start_date: string | null
    end_date: string | null
    is_current: boolean | null
  }[]
  dependents: {
    name: string
    age: number
    passport_no: string
    relationship: string
    is_included: boolean
  }[]
  family_backgrounds: {
    father_name: string
    father_age: number | null
    mother_name: string
    mother_age: number | null
  } | null
  payment: {
    id: number
    amount: number
    status: string
    payment_method: string
    transaction_code: string
    created_at: string
  } | null
  documents: {
    id: number
    name: string
    type: string
    format: string
    status: string
    review_note: string | null
    path: string
    created_at: string
  }[]
}

export async function getApplicationDetail(id: number): Promise<AppDetail | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      client_profiles!applications_user_id_fkey (
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) return null

  const [docs, paymentData, contactData, emergencyData,
       appProfileData, passportData, visaData, eduData, empData, depData, famData] = await Promise.all([
    // review_note was added via migration — re-run `supabase gen types` to remove cast
    supabase
      .from("documents")
      .select("id, name, type, format, status, review_note, path, created_at")
      .eq("application_id", id)
      .order("created_at") as unknown as Promise<{
      data: { id: number; name: string; type: string; format: string; status: string; review_note: string | null; path: string; created_at: string }[] | null
      error: unknown
    }>,
    supabase
      .from("payments")
      .select("id, amount, status, payment_method, transaction_code, created_at")
      .eq("user_id", data.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("contacts")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
    supabase
      .from("emergency_contacts")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
    supabase
      .from("applicant_profiles")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
    supabase
      .from("passports")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
    supabase
      .from("visa_details")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
    supabase
      .from("educations")
      .select("*")
      .eq("application_id", id),
    supabase
      .from("employments")
      .select("*")
      .eq("application_id", id),
    supabase
      .from("dependents")
      .select("*")
      .eq("application_id", id),
    supabase
      .from("family_backgrounds")
      .select("*")
      .eq("application_id", id)
      .maybeSingle(),
  ])

  return {
    id: data.id,
    user_id: data.user_id,
    application_code: data.application_code,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Cast needed because joined relation isn't in generated types
    applicant_name: (data as { client_profiles?: { name: string } }).client_profiles?.name ?? "Unknown",
    phone_number: contactData.data?.mobile_no ?? "",
    email: contactData.data?.email ?? undefined,
    street: contactData.data?.home_country_address ?? "",
    ph_address: contactData.data?.primary_address_ph ?? null,
    emergency_name: emergencyData.data?.name ?? null,
    emergency_phone: emergencyData.data?.phone_no ?? null,
    emergency_relationship: emergencyData.data?.relationship ?? null,
    future_plans: data.future_plans,
    applicant_profile: appProfileData.data
      ? {
          civil_status: appProfileData.data.civil_status,
          date_of_birth: appProfileData.data.date_of_birth,
          gender: appProfileData.data.gender,
          height: appProfileData.data.height,
          first_name: appProfileData.data.first_name,
          last_name: appProfileData.data.last_name,
          middle_name: appProfileData.data.middle_name,
          nationality: appProfileData.data.nationality,
          place_of_birth: appProfileData.data.place_of_birth,
          religion: appProfileData.data.religion,
          weight: appProfileData.data.weight,
        }
      : null,
    passport: passportData.data
      ? {
          passport_number: passportData.data.passport_number,
          date_of_issue: passportData.data.date_of_issue,
          expiration: passportData.data.expiration,
          place_of_issue: passportData.data.place_of_issue,
        }
      : null,
    visa_details: visaData.data
      ? {
          entry_visa_type: visaData.data.entry_visa_type,
          date_of_arrival: visaData.data.date_of_arrival,
          exp_date_tourist_visa: visaData.data.exp_date_tourist_visa,
        }
      : null,
    educations: (eduData.data ?? []).map((e: any) => ({
      school: e.school,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date,
    })),
    employments: (empData.data ?? []).map((e: any) => ({
      company_name: e.company_name,
      company_address: e.company_address,
      contact_no: e.contact_no,
      job_title: e.job_title,
      start_date: e.start_date,
      end_date: e.end_date,
      is_current: e.is_current,
    })),
    dependents: (depData.data ?? []).map((d: any) => ({
      name: d.name,
      age: d.age,
      passport_no: d.passport_no,
      relationship: d.relationship,
      is_included: d.is_included,
    })),
    family_backgrounds: famData.data
      ? {
          father_name: famData.data.father_name,
          father_age: famData.data.father_age,
          mother_name: famData.data.mother_name,
          mother_age: famData.data.mother_age,
        }
      : null,
    payment: paymentData.data
      ? {
          id: paymentData.data.id,
          amount: paymentData.data.amount,
          status: paymentData.data.status,
          payment_method: paymentData.data.payment_method,
          transaction_code: paymentData.data.transaction_code,
          created_at: paymentData.data.created_at,
        }
      : null,
    documents: (docs.data ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      format: d.format,
      status: d.status,
      review_note: d.review_note,
      path: d.path,
      created_at: d.created_at,
    })),
  }
}

export const updateAppStatus = withAdmin(async function updateAppStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createAdminClient();

  const appId = formData.get("app_id");
  const status = formData.get("status");

  if (!appId || typeof appId !== "string")
    return { error: "Missing application ID", success: false };

  const parsed = ApplicationStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid status value", success: false };

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", Number(appId))
    .single();

  if (fetchError || !app) return { error: "Application not found", success: false };

  const target = parsed.data

  if (target === 'approved') {
    // Validate contact fields exist
    const { data: contactCheck } = await supabase
      .from("contacts")
      .select("mobile_no, home_country_address")
      .eq("application_id", app.id)
      .maybeSingle()

    if (!contactCheck || !contactCheck.mobile_no || !contactCheck.home_country_address) {
      return { error: "Cannot approve: missing required contact fields (Phone Number, Address)", success: false }
    }

    // Validate payment was successful
    const { data: payment } = await supabase
      .from("payments")
      .select("status")
      .eq("user_id", app.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!payment || payment.status !== 'success') {
      return { error: "Cannot approve: no successful payment found", success: false }
    }

    // Validate all documents are accepted
    const { data: docs } = await supabase
      .from("documents")
      .select("status")
      .eq("application_id", app.id)
    const unapproved = (docs ?? []).filter((d) => d.status !== 'accepted')
    if (unapproved.length > 0) {
      return { error: `Cannot approve: ${unapproved.length} document(s) not yet accepted`, success: false }
    }

    // Validate applicant profile exists
    const { data: appProfile } = await supabase
      .from("applicant_profiles")
      .select("id")
      .eq("application_id", app.id)
      .maybeSingle()
    if (!appProfile) {
      return { error: "Cannot approve: applicant profile is missing", success: false }
    }

    // Validate passport was submitted
    const { data: passport } = await supabase
      .from("passports")
      .select("id")
      .eq("application_id", app.id)
      .maybeSingle()
    if (!passport) {
      return { error: "Cannot approve: passport information is missing", success: false }
    }
  }

  if (target === 'processing') {
    const { data: contactCheck } = await supabase
      .from("contacts")
      .select("mobile_no, home_country_address")
      .eq("application_id", app.id)
      .maybeSingle()

    if (!contactCheck || !contactCheck.mobile_no || !contactCheck.home_country_address) {
      return { error: "Cannot set to processing: missing required contact fields (Phone Number, Address)", success: false }
    }
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: target })
    .eq("id", Number(appId));

  if (error) return { error: error.message, success: false };

  revalidatePath("/admin/applications");
  revalidateTag("admin-applications", 'seconds');
  return { error: null, success: true };
});
