"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";
import { consultationFormSchema } from "@/schemas/consultation";

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

  const { error: insertError } = await supabase.from("consultations").insert({
    user_id: user.id,
    meeting_date: parsed.data.meeting_date,
    mode_communication: parsed.data.mode_communication,
    purpose: parsed.data.purpose,
  });

  if (insertError) {
    return { error: insertError.message, fieldErrors: null, success: false };
  }

  revalidatePath("/applicant/consultation");
  return { error: null, fieldErrors: null, success: true };
}
