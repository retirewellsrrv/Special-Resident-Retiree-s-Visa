'use client'

import Image from 'next/image'
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
import { NavItems, type NavItem } from '@/components/layout/sidebar-nav'
import { SidebarLogout } from '@/components/layout/sidebar-logout'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Bell, HelpCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import logo from '@/assets/images/logo.png'

interface SidebarLayoutProps {
  children: ReactNode
  navItems: NavItem[]
  title: string
  ctaLabel?: string
  onCta?: () => void
  user?: {
    name: string
    role: string
    avatarUrl?: string
  }
}

export function SidebarLayout({
  children,
  navItems,
  title,
  ctaLabel = 'New Application',
  onCta,
  user = { name: 'Admin User', role: 'Senior Registrar' },
}: SidebarLayoutProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '13rem',
            '--sidebar-width-icon': '3.25rem',
          } as React.CSSProperties
        }
      >
        <div className="flex min-h-svh w-full">
          <Sidebar
            collapsible="icon"
            className="border-r border-[#E5E0DB]"
            style={{ backgroundColor: '#F0EDEA' }}
          >
            {/* ── Brand header ── */}
            <SidebarHeader className="h-14 px-4 border-b border-[#E5E0DB] flex justify-center">
              <div className="flex items-center justify-center w-full group-data-[collapsible=icon]:justify-center">
                {/* Full logo — hidden when collapsed */}
                <div className="group-data-[collapsible=icon]:hidden w-full">
                  <Image
                    src={logo}
                    alt="Retire Well SRRV"
                    width={160}
                    height={52}
                    className="object-contain w-full h-auto max-h-12"
                    priority
                  />
                </div>
                {/* Icon-only mark when collapsed — RW initials */}
                <div
                  className="hidden group-data-[collapsible=icon]:flex size-8 items-center justify-center rounded-md font-black text-sm text-white"
                  style={{ backgroundColor: '#8B1A1A' }}
                >
                  RW
                </div>
              </div>
            </SidebarHeader>

            {/* ── Nav items ── */}
            <SidebarContent className="px-2 py-3">
              <NavItems items={navItems} label="Navigation" />
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="px-3 pb-4 pt-2 gap-2 border-t border-[#E5E0DB]">
              <SidebarLogout />
              <Button
                onClick={onCta}
                size="sm"
                className="
                  w-full justify-start gap-2
                  bg-[#8B1A1A] hover:bg-[#7C1010] active:bg-[#6B0D0D]
                  text-white font-semibold text-xs tracking-wide
                  rounded-md shadow-sm transition-colors
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:px-0
                "
              >
                <Plus className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {ctaLabel}
                </span>
              </Button>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          {/* ── Main content area ── */}
          <SidebarInset className="flex flex-col flex-1 min-w-0 min-h-svh bg-white">

            {/* ── Top header ── */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 gap-4">
              <SidebarTrigger className="text-zinc-400 hover:text-zinc-700 shrink-0" />

              <div className="flex items-center gap-1">
                {/* Bell */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full size-9"
                  aria-label="Notifications"
                >
                  <Bell className="size-[18px]" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
                </Button>

                {/* Help */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full size-9"
                  aria-label="Help"
                >
                  <HelpCircle className="size-[18px]" />
                </Button>

                <div className="mx-2 h-6 w-px bg-zinc-200" />

                {/* User info + avatar */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-zinc-800 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <Avatar className="size-8 ring-2 ring-zinc-200">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback
                      className="text-xs font-bold text-white"
                      style={{ backgroundColor: '#8B1A1A' }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}