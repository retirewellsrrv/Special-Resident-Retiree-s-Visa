'use client'

import { createClient } from '@/lib/supabase/client'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, Shield, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/manage-admins', label: 'Admins', icon: Shield },
  { href: '/super-admin/manage-clients', label: 'Clients', icon: Users },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user ?? null))
  }, [])

  const role = user?.user_metadata.role
  const userName = user?.user_metadata.name
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      title="Super Admin"
      ctaLabel="New Admin"
      user={{ name: userName || 'Super Admin', role: 'Super Admin' }}
    >
      {children}
    </SidebarLayout>
  )
}
