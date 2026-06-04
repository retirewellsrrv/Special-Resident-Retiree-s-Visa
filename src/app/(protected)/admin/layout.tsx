'use client'

import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, Users, Package2, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profiles', label: 'Client Profiles', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Package2 },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout navItems={NAV_ITEMS} title="Admin">
      {children}
    </SidebarLayout>
  )
}
