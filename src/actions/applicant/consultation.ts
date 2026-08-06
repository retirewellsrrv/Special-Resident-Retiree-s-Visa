"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";
import { consultationFormSchema } from "@/schemas/consultation";
import type { Database } from "@/types/supabase";

export type MyConsultation = {
  id: number;
  meeting_date: string;
  mode_communication: Database["public"]["Enums"]["communication_mode"];
  purpose: string;
  status: Database["public"]["Enums"]["consultation_status"];
};

export async function getMyConsultation(): Promise<MyConsultation | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("consultations")
    .select("id, meeting_date, mode_communication, purpose, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export type SubmitConsultationState = {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
};

export async function submitConsultationAction(
  _prev: SubmitConsultationState,
  formData: FormData,
): Promise<SubmitConsultationState> {
  const user = await getUserServer();
  if (!user) {
    return { error: "Unauthorized", fieldErrors: null, success: false };
  }

  const supabase = await createClient();

  const parsed = consultationFormSchema.safeParse({
    meeting_date: formData.get("meeting_date"),
    mode_communication: formData.get("mode_communication"),
    purpose: formData.get("purpose"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
    });
    return { error: null, fieldErrors, success: false };
  }

  // Only one consultation per user: update if it already exists, otherwise insert
  const { data: existing } = await supabase
    .from("consultations")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    existing &&
    (existing.status === "processing" || existing.status === "accepted")
  ) {
    return {
      error:
        "Your consultation is currently being processed and can no longer be modified.",
      fieldErrors: null,
      success: false,
    };
  }

  const values = {
    meeting_date: parsed.data.meeting_date,
    mode_communication: parsed.data.mode_communication,
    purpose: parsed.data.purpose,
  };

  const { error: saveError } = existing
    ? await supabase
        .from("consultations")
        .update(values)
        .eq("id", existing.id)
    : await supabase.from("consultations").insert({
        ...values,
        user_id: user.id,
      });

  if (saveError) {
    return { error: saveError.message, fieldErrors: null, success: false };
  }

  revalidatePath("/applicant/consultation");
  revalidatePath("/applicant/dashboard");
  redirect("/applicant/dashboard?consultation=success");
}
