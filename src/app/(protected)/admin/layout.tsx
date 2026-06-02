'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { NavItems } from '@/components/admin/sidebar-nav'
import { SidebarLogout } from '@/components/admin/sidebar-logout'
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
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="inset">

          <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                S
              </div>
              <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                SRRV Admin
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <NavItems items={NAV_ITEMS} label="Navigation" />
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarLogout />
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">SRRV Admin Panel</span>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}