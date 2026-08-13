'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, CheckCheck, Loader2, Inbox, ExternalLink, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getMyNotifications,
  markNotificationsReadAction,
  markNotificationRead,
} from '@/actions/applicant/notifications'
import type { NotificationItem } from '@/actions/applicant/notifications'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { formatRelativeTime } from '@/lib/format-time'
import { cn } from '@/lib/utils'

export function NotificationBell({ userId }: { userId?: string | null }) {
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unread = items.filter((n) => !n.is_read).length

  async function load() {
    const res = await getMyNotifications()
    setItems(res.items)
    setLoading(false)
  }

  // Refresh when opening the dropdown (fallback for missed/offline events)
  useEffect(() => {
    let active = true
    getMyNotifications().then((res) => {
      if (!active) return
      setItems(res.items)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [open])

  // Live badge: refetch whenever a new notification is inserted
  useRealtimeNotifications({
    userId,
    table: 'notifications',
    filterColumn: 'user_id',
    onEvent: load,
  })

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  async function handleMarkAllRead() {
    setMarking(true)
    await markNotificationsReadAction()
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarking(false)
  }

  function handleOpenNotification(item: NotificationItem) {
    if (!item.link) return
    if (!item.is_read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)))
      markNotificationRead(item.id)
    }
    setOpen(false)
    router.push(item.link)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-brand-neutral-500 hover:text-brand-neutral-800 hover:bg-brand-neutral-100 rounded-full size-9"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-brand-primary-600 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-brand-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-neutral-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-brand-neutral-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={marking}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-700 hover:text-brand-primary-800 disabled:opacity-50"
              >
                {marking ? <Loader2 className="size-3 animate-spin" /> : <CheckCheck className="size-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-10 text-brand-neutral-400">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-xs">Loading notifications…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-brand-neutral-400">
                <Inbox className="size-7" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-neutral-100">
                {items.map((n) => {
                  const clickable = Boolean(n.link)
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        'px-4 py-3 text-sm leading-snug',
                        clickable && 'cursor-pointer',
                        n.is_read ? 'text-brand-neutral-500' : 'bg-brand-primary-50/40 font-medium text-brand-neutral-800',
                      )}
                      onClick={() => handleOpenNotification(n)}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          handleOpenNotification(n)
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-primary-600" />}
                        <div className="min-w-0 flex-1">
                          <span>{n.notification}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-neutral-400">
                            {formatRelativeTime(n.created_at)}
                            {clickable && <ExternalLink className="size-2.5" />}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <Link
            href="/applicant/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-brand-neutral-100 px-4 py-2.5 text-xs font-medium text-brand-primary-700 hover:bg-brand-neutral-50"
          >
            View all notifications
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
