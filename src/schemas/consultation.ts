import { z } from "zod";

export const CommunicationModeEnum = z.enum(
  ["zoom_meeting", "google_meet", "whatsApp", "face_2_face", "phone_call"],
  {
    error: "Please select a valid mode of communication",
  },
);

export const ConsultationStatusEnum = z.enum([
  "processing",
  "accepted",
  "rejected",
  "pending",
]);

export const consultationFormSchema = z.object({
  meeting_date: z
    .string()
    .min(1, "Please select a preferred date")
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(`${date}T00:00:00`) >= today;
      },
      "Preferred date must be today or in the future",
    ),
  mode_communication: CommunicationModeEnum,
  purpose: z
    .string()
    .min(1, "Please tell us the purpose of your consultation"),
});
