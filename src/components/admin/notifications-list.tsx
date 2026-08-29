'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck, Inbox, Loader2, Trash2, ExternalLink } from 'lucide-react'
import {
  getAdminNotifications,
  markAdminNotificationsReadAction,
  markAdminNotificationRead,
  deleteAdminNotificationsAction,
} from '@/actions/admin/notifications'
import type { AdminNotificationItem } from '@/actions/admin/notifications'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/format-time'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 50

export function AdminNotificationsList() {
  const router = useRouter()
  const [items, setItems] = useState<AdminNotificationItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [marking, setMarking] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getAdminNotifications(1, PAGE_SIZE).then((res) => {
      if (!active) return
      setItems(res.items)
      setHasMore(res.hasMore)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleLoadMore() {
    setLoadingMore(true)
    const next = page + 1
    const res = await getAdminNotifications(next, PAGE_SIZE)
    setItems((prev) => [...prev, ...res.items])
    setHasMore(res.hasMore)
    setPage(next)
    setLoadingMore(false)
  }

  async function handleMarkAllRead() {
    setMarking(true)
    await markAdminNotificationsReadAction()
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarking(false)
  }

  async function handleClearAll() {
    setClearing(true)
    await deleteAdminNotificationsAction()
    setItems([])
    setHasMore(false)
    setClearing(false)
  }

  function handleOpen(item: AdminNotificationItem) {
    if (!item.link) return
    if (!item.is_read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)))
      void markAdminNotificationRead(item.id)
    }
    router.push(item.link)
  }

  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader className="border-b border-brand-neutral-100">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Admin Notifications</CardTitle>
            {unread > 0 && (
              <span className="rounded-full bg-brand-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {unread} unread
              </span>
            )}
          </div>
        </CardHeader>

        <CardAction className="flex flex-col gap-2 p-4 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={marking || unread === 0}
          >
            {marking ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearing || items.length === 0}
            className="text-destructive"
          >
            {clearing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Clear all
          </Button>
        </CardAction>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-12 text-brand-neutral-400">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-xs">Loading notifications…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-brand-neutral-400">
              <Inbox className="size-8" />
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
                    onClick={() => handleOpen(n)}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleOpen(n)
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
        </CardContent>

        {hasMore && (
          <Button
            variant="outline"
            className="mx-4 mb-4"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore && <Loader2 className="size-3.5 animate-spin" />}
            Load more
          </Button>
        )}
      </Card>
    </div>
  )
}