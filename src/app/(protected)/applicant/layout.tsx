'use client'

import { getSession } from '@/actions/auth'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { User } from '@supabase/supabase-js'
import { LayoutDashboard, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/applicant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applicant/application', label: 'Application', icon: FileText },
]

export default function ApplicantLayout({
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
    <SidebarLayout navItems={NAV_ITEMS} title="Applicant" user={{ name: userName || 'Applicant User', role: role || 'Applicant' }}>
      {children}
    </SidebarLayout>
  )
}
