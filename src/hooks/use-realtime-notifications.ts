'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export type RealtimeNotificationsOptions = {
  /** Auth user id; subscription starts only when truthy. */
  userId?: string | null
  /** Which notification table to listen on. */
  table: 'notifications' | 'admin_notifications'
  /** The column that scopes rows to the current user. */
  filterColumn: 'user_id' | 'admin_user_id'
  /** Called whenever a matching row is inserted. */
  onEvent?: () => void
}

/**
 * Subscribes to new notifications for the current user via Supabase
 * Realtime postgres_changes. On INSERT it invokes `onEvent` (typically a
 * refetch of the existing notifications server action), so the unread badge
 * updates live without opening the dropdown.
 *
 * Relies on the RLS SELECT policies from
 * `20260811000002_notifications_rls_realtime.sql` — Realtime only delivers
 * events the subscriber can read.
 */
export function useRealtimeNotifications({
  userId,
  table,
  filterColumn,
  onEvent,
}: RealtimeNotificationsOptions) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const filter = `${filterColumn}=eq.${userId}`

    const channel = supabase
      .channel(`notifications:${table}:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, filter },
        () => onEventRef.current?.(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, table, filterColumn])
}
