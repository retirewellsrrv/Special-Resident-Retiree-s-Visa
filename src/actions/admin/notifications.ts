"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getUserServer } from "@/utils/auth/getUser";

export type AdminNotificationItem = {
  id: number;
  notification: string;
  is_read: boolean;
  type: string | null;
  link: string | null;
  created_at: string | null;
};

export type AdminNotificationsResult = {
  unread: number;
  items: AdminNotificationItem[];
  hasMore: boolean;
};

export async function getAdminNotifications(
  page = 1,
  pageSize = 20,
): Promise<AdminNotificationsResult> {
  const user = await getUserServer();
  if (!user) return { unread: 0, items: [], hasMore: false };

  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data } = await supabase
    .from("admin_notifications")
    .select("id, notification, is_read, type, link, created_at")
    .eq("admin_user_id", user.id)
    .order("id", { ascending: false })
    .range(from, to);

  const items = (data ?? []) as AdminNotificationItem[];

  return {
    unread: items.filter((n) => !n.is_read).length,
    items,
    hasMore: items.length === pageSize,
  };
}

export async function markAdminNotificationsReadAction(): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("admin_user_id", user.id)
    .eq("is_read", false);

  return { success: !error };
}

export async function markAdminNotificationRead(id: number): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("admin_user_id", user.id);

  return { success: !error };
}

export async function deleteAdminNotificationsAction(): Promise<{ success: boolean }> {
  const user = await getUserServer();
  if (!user) return { success: false };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("admin_notifications")
    .delete()
    .eq("admin_user_id", user.id);

  return { success: !error };
}
