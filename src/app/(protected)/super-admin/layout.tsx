'use client'

import { getSession } from '@/actions/auth'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, Shield, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/admins', label: 'Manage Admins', icon: Shield },
  { href: '/super-admin/users', label: 'Users', icon: Users },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    getSession().then(setUser)
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
