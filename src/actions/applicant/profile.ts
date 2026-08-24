"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";
import { clientProfileSchema } from "@/schemas/client-profiles";

export type ApplicantProfileData = {
  name: string;
  birthday: string;
  sex: string;
  nationality: string;
  marital_status: string;
  email: string;
};

export async function getProfile(): Promise<ApplicantProfileData | null> {
  const user = await getUserServer();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("client_profiles")
    .select("name, birthday, sex, nationality, marital_status")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return {
      name: "",
      birthday: "",
      sex: "",
      nationality: "",
      marital_status: "",
      email: user.email ?? "",
    };
  }

  return {
    name: profile.name,
    birthday: profile.birthday,
    sex: profile.sex,
    nationality: profile.nationality,
    marital_status: profile.marital_status,
    email: user.email ?? "",
  };
}

export type UpdateProfileState = {
  error: string | null;
  success: boolean;
};

export async function updateApplicantProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const user = await getUserServer();
  if (!user) return { error: "Unauthorized", success: false };

  const supabase = await createClient();

  const parsed = clientProfileSchema.safeParse({
    name: formData.get("name"),
    sex: formData.get("sex"),
    birthday: formData.get("birthday"),
    nationality: formData.get("nationality"),
    marital_status: formData.get("marital_status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Validation failed",
      success: false,
    };
  }

  const age = Math.floor(
    (Date.now() - new Date(parsed.data.birthday).getTime()) / (365.25 * 86400000),
  );

  const { error: upsertError } = await supabase.from("client_profiles").upsert(
    {
      user_id: user.id,
      ...parsed.data,
      age,
    },
    { onConflict: "user_id" },
  );

  if (upsertError) {
    return { error: upsertError.message, success: false };
  }

  revalidatePath("/applicant/profile");
  return { error: null, success: true };
}
