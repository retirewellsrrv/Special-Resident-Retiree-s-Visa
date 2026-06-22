'use client'

import { getSession } from '@/actions/auth'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, Users, Package2, FileText, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'


const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profiles', label: 'Client Profiles', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Package2 },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    getSession().then(setUser)
  }, [])

  const role = user?.user_metadata.role;
  const userName = user?.user_metadata.name
  return (
    <SidebarLayout navItems={NAV_ITEMS} title="Admin" user={{ name: userName || 'Admin User', role: role || 'Admin' }}>
      {children}
    </SidebarLayout>
  )
}
