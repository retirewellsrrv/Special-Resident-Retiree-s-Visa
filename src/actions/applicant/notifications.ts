"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";

export type NotificationItem = {
  id: number;
  notification: string;
  is_read: boolean;
  type: string | null;
  link: string | null;
  created_at: string | null;
};

export type NotificationsResult = {
  unread: number;
  items: NotificationItem[];
  hasMore: boolean;
};

export async function getMyNotifications(
  page = 1,
  pageSize = 20,
): Promise<NotificationsResult> {
  const user = await getUserServer();
  if (!user) return { unread: 0, items: [], hasMore: false };

  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data } = await supabase
    .from("notifications")
    .select("id, notification, is_read, type, link, created_at")
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .range(from, to);

  const items = (data ?? []) as NotificationItem[];

  return {
    unread: items.filter((n) => !n.is_read).length,
    items,
    hasMore: items.length === pageSize,
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

export async function markNotificationRead(id: number): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  return { success: !error };
}

export async function deleteNotificationsAction(): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  return { success: !error };
}
