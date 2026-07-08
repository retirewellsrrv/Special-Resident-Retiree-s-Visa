'use client'

import { usePathname } from 'next/navigation'
import { ChatWidget } from '@/components/chat'

export function ConditionalChat() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/super-admin')
  if (isAdmin) return null
  return <ChatWidget />
}
