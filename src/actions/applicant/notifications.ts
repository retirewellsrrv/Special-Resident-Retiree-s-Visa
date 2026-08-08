"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";

export type NotificationItem = {
  id: number;
  notification: string;
  is_read: boolean;
};

export type NotificationsResult = {
  unread: number;
  items: NotificationItem[];
};

export async function getMyNotifications(): Promise<NotificationsResult> {
  const user = await getUserServer();
  if (!user) return { unread: 0, items: [] };

  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, notification, is_read")
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .limit(20);

  const items = (data ?? []) as NotificationItem[];

  return {
    unread: items.filter((n) => !n.is_read).length,
    items,
  };
}

export async function markNotificationsReadAction(): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return { success: !error };
}