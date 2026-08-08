'use client'

import { createClient } from '@/lib/supabase/client'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, Users, Package2, FileText, Wallet, FileSearch, CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'


const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profiles', label: 'Client Profiles', icon: Users },
  { href: '/admin/consultations', label: 'Consultations', icon: CalendarClock },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
  { href: '/admin/documents', label: 'Documents', icon: FileSearch },
  { href: '/admin/services', label: 'Services', icon: Package2 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => setUser(null))
  }, [])

  const role = user?.user_metadata.role;
  const userName = user?.user_metadata.name
  return (
    <SidebarLayout navItems={NAV_ITEMS} title="Admin" user={{ name: userName || 'Admin User', role: role || 'Admin' }}>
      {children}
    </SidebarLayout>
  )
}
