"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import {
  clientProfileSchema,
  ApplicationStatusEnum,
} from "@/schemas/client-profiles";
import { withAdmin } from "@/utils/auth/with-admin";
import { getUser, requireAdmin } from "@/utils/auth/getUser";

/** Throws when the caller is not an admin / super_admin (defense-in-depth). */
async function assertAdmin() {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error(auth.error);
}

export type ActionState = { error: string | null; success: boolean };

export type ClientRow = {
    user_id: string
    name: string
    application_code: string | null
    status: string | null
    updated_at: string | null
}

function escapeSearch(val: string) {
    return val.replace(/[%_]/g, "\\$&");
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
      .from("client_profiles")
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
    status,
    q,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    q?: string;
  } = {}): Promise<{ rows: ClientRow[]; total: number }> => {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Resolve the application status filter to matching user_ids first,
  // then filter client_profiles on those ids.
  let targetUserIds: string[] | undefined;

  if (status) {
    const { data: apps } = await supabase
      .from("applications")
      .select("user_id")
      .eq("status", status as any);
    targetUserIds = (apps ?? []).map((a) => a.user_id);

    // Nothing matches the status filter → short-circuit
    if (targetUserIds.length === 0) {
      return { rows: [], total: 0 };
    }
  }

  // Base query: all registered users (client_profiles), not just those
  // who have submitted an application.
  let query = supabase
    .from("client_profiles")
    .select("user_id, name", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.ilike("name", `%${escapeSearch(q)}%`);
  }
  if (targetUserIds) {
    query = query.in("user_id", targetUserIds);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  // Fetch the latest application per user on this page (single extra query,
  // avoids N+1) so the directory still shows application code/status/date.
  const userIds = data.map((c) => c.user_id);
  const { data: apps } = await supabase
    .from("applications")
    .select("user_id, application_code, status, updated_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  const latestByUser = new Map<
    string,
    { application_code: string; status: string; updated_at: string }
  >();
  for (const app of apps ?? []) {
    if (!latestByUser.has(app.user_id)) {
      latestByUser.set(app.user_id, {
        application_code: app.application_code,
        status: app.status,
        updated_at: app.updated_at,
      });
    }
  }

  const rows: ClientRow[] = (data ?? []).map((row) => {
    const app = latestByUser.get(row.user_id);
    return {
      user_id: row.user_id,
      name: row.name,
      application_code: app?.application_code ?? null,
      status: app?.status ?? null,
      updated_at: app?.updated_at ?? null,
    };
  });

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

export type ClientDetail = {
  profile: {
    user_id: string;
    name: string;
    sex: string;
    birthday: string;
    marital_status: string;
    nationality: string;
    age: number;
  };
  applications: {
    id: number;
    application_code: string;
    status: string;
    created_at: string;
    updated_at: string;
    /** Full application breakdown — only populated for APPROVED applications. */
    fullDetail: ApprovedApplicationDetail | null;
  }[];
  consultations: {
    id: number;
    status: string;
    meeting_date: string;
    mode_communication: string;
    purpose: string;
    created_at: string;
  }[];
  payments: {
    id: number;
    transaction_code: string;
    amount: number;
    status: string;
    payment_method: string;
    service_type: string;
    created_at: string;
  }[];
};

export type ApprovedApplicationDetail = {
  phone_number: string;
  email?: string;
  street: string;
  ph_address: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relationship: string | null;
  future_plans: string | null;
  applicant_profile: {
    civil_status: string;
    date_of_birth: string;
    gender: string;
    height: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    nationality: string;
    place_of_birth: string;
    religion: string;
    weight: number;
  } | null;
  passport: {
    passport_number: string;
    date_of_issue: string;
    expiration: string;
    place_of_issue: string;
  } | null;
  visa_details: {
    entry_visa_type: string | null;
    date_of_arrival: string | null;
    exp_date_tourist_visa: string | null;
  } | null;
  educations: {
    educ_attainment: string;
    school: string;
    location: string;
    from_date: string;
    to_date: string;
  }[];
  employments: {
    company_name: string | null;
    company_address: string | null;
    contact_no: string | null;
    job_title: string | null;
    from_date: string | null;
    to_date: string | null;
    is_current: boolean | null;
  }[];
  dependents: {
    name: string;
    age: number;
    passport_no: string;
    relationship: string;
    is_included: boolean;
  }[];
  family_backgrounds: {
    father_name: string;
    father_age: number | null;
    mother_name: string;
    mother_age: number | null;
  } | null;
  documents: {
    id: number;
    name: string;
    type: string;
    format: string;
    status: string;
    review_note: string | null;
    created_at: string;
  }[];
};

export async function getClientDetail(userId: string): Promise<ClientDetail | null> {
  await assertAdmin();

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("user_id, name, sex, birthday, marital_status, nationality, age")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return null;

  const [applications, consultations, payments] = await Promise.all([
    supabase
      .from("applications")
      .select("id, application_code, status, created_at, updated_at, future_plans")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("consultations")
      .select("id, status, meeting_date, mode_communication, purpose, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, transaction_code, amount, status, payment_method, service_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const appRows = applications.data ?? [];

  // Full breakdown is fetched ONLY for approved applications (PII exposure
  // limited to the point where admin actually processes the SRRV).
  const approvedIds = appRows.filter((a) => a.status === "approved").map((a) => a.id);

  const breakdownByApp = new Map<number, ApprovedApplicationDetail>();
  if (approvedIds.length > 0) {
    const [
      contactData,
      emergencyData,
      appProfileData,
      passportData,
      visaData,
      eduData,
      empData,
      depData,
      famData,
      docData,
    ] = await Promise.all([
      supabase.from("contacts").select("*").in("application_id", approvedIds),
      supabase.from("emergency_contacts").select("*").in("application_id", approvedIds),
      supabase.from("applicant_profiles").select("*").in("application_id", approvedIds),
      supabase.from("passports").select("*").in("application_id", approvedIds),
      supabase.from("visa_details").select("*").in("application_id", approvedIds),
      supabase.from("educations").select("*").in("application_id", approvedIds),
      supabase.from("employments").select("*").in("application_id", approvedIds),
      supabase.from("dependents").select("*").in("application_id", approvedIds),
      supabase.from("family_backgrounds").select("*").in("application_id", approvedIds),
      supabase
        .from("documents")
        .select("id, name, type, format, status, review_note, created_at, application_id")
        .in("application_id", approvedIds),
    ]);

    // Group related rows by application_id so each approved app gets its own detail.
    const contactsByApp = new Map((contactData.data ?? []).map((r) => [r.application_id, r]));
    const emergenciesByApp = new Map((emergencyData.data ?? []).map((r) => [r.application_id, r]));
    const profilesByApp = new Map((appProfileData.data ?? []).map((r) => [r.application_id, r]));
    const passportsByApp = new Map((passportData.data ?? []).map((r) => [r.application_id, r]));
    const visasByApp = new Map((visaData.data ?? []).map((r) => [r.application_id, r]));
    const familiesByApp = new Map((famData.data ?? []).map((r) => [r.application_id, r]));

    for (const appId of approvedIds) {
      const contact = contactsByApp.get(appId);
      const emergency = emergenciesByApp.get(appId);
      const applicantProfile = profilesByApp.get(appId);
      const passport = passportsByApp.get(appId);
      const visa = visasByApp.get(appId);
      const family = familiesByApp.get(appId);

      const educationRows = (eduData.data ?? []).filter((r) => r.application_id === appId);
      const employmentRows = (empData.data ?? []).filter((r) => r.application_id === appId);
      const dependentRows = (depData.data ?? []).filter((r) => r.application_id === appId);
      const documentRows = (docData.data ?? []).filter((r) => r.application_id === appId);

      breakdownByApp.set(appId, {
        phone_number: contact?.mobile_no ?? "",
        email: contact?.email ?? undefined,
        street: contact?.home_country_address ?? "",
        ph_address: contact?.primary_address_ph ?? null,
        emergency_name: emergency?.name ?? null,
        emergency_phone: emergency?.phone_no ?? null,
        emergency_relationship: emergency?.relationship ?? null,
        future_plans: appRows.find((a) => a.id === appId)?.future_plans ?? null,
        applicant_profile: applicantProfile
          ? {
              civil_status: applicantProfile.civil_status,
              date_of_birth: applicantProfile.date_of_birth,
              gender: applicantProfile.gender,
              height: applicantProfile.height,
              first_name: applicantProfile.first_name,
              last_name: applicantProfile.last_name,
              middle_name: applicantProfile.middle_name,
              nationality: applicantProfile.nationality,
              place_of_birth: applicantProfile.place_of_birth,
              religion: applicantProfile.religion,
              weight: applicantProfile.weight,
            }
          : null,
        passport: passport
          ? {
              passport_number: passport.passport_number,
              date_of_issue: passport.date_of_issue,
              expiration: passport.expiration,
              place_of_issue: passport.place_of_issue,
            }
          : null,
        visa_details: visa
          ? {
              entry_visa_type: visa.entry_visa_type,
              date_of_arrival: visa.date_of_arrival,
              exp_date_tourist_visa: visa.exp_date_tourist_visa,
            }
          : null,
        educations: educationRows.map((e) => ({
          educ_attainment: e.educ_attainment,
          school: e.school,
          location: e.location,
          from_date: e.from_date,
          to_date: e.to_date,
        })),
        employments: employmentRows.map((e) => ({
          company_name: e.company_name,
          company_address: e.company_address,
          contact_no: e.contact_no,
          job_title: e.job_title,
          from_date: e.from_date,
          to_date: e.to_date,
          is_current: e.is_current,
        })),
        dependents: dependentRows.map((d) => ({
          name: d.name,
          age: d.age,
          passport_no: d.passport_no,
          relationship: d.relationship,
          is_included: d.is_included,
        })),
        family_backgrounds: family
          ? {
              father_name: family.father_name,
              father_age: family.father_age,
              mother_name: family.mother_name,
              mother_age: family.mother_age,
            }
          : null,
        documents: documentRows.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          format: d.format,
          status: d.status,
          review_note: d.review_note,
          created_at: d.created_at,
        })),
      });
    }
  }

  return {
    profile: {
      user_id: profile.user_id,
      name: profile.name,
      sex: profile.sex,
      birthday: profile.birthday,
      marital_status: profile.marital_status,
      nationality: profile.nationality,
      age: profile.age,
    },
    applications: appRows.map((a) => ({
      id: a.id,
      application_code: a.application_code,
      status: a.status,
      created_at: a.created_at,
      updated_at: a.updated_at,
      fullDetail: breakdownByApp.get(a.id) ?? null,
    })),
    consultations: (consultations.data ?? []).map((c) => ({
      id: c.id,
      status: c.status,
      meeting_date: c.meeting_date,
      mode_communication: c.mode_communication,
      purpose: c.purpose,
      created_at: c.created_at,
    })),
    payments: (payments.data ?? []).map((p) => ({
      id: p.id,
      transaction_code: p.transaction_code,
      amount: p.amount,
      status: p.status,
      payment_method: p.payment_method,
      service_type: p.service_type,
      created_at: p.created_at,
    })),
  };
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
