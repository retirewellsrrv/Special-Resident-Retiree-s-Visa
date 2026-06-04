'use client'

import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LayoutDashboard, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/applicant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applicant/application', label: 'Application', icon: FileText },
]

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout navItems={NAV_ITEMS} title="Applicant">
      {children}
    </SidebarLayout>
  )
}
