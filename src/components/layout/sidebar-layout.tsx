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
import { Plus, Bell } from 'lucide-react'
import type { ReactNode } from 'react'
import logo from '@/assets/images/logo.jpg'

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
  notifications?: ReactNode
  /** Hide the notifications bell entirely (used by portals without a notifications feature) */
  hideNotifications?: boolean
}

export function SidebarLayout({
  children,
  navItems,
  title,
  ctaLabel = 'New Application',
  onCta,
  user = { name: 'Admin User', role: 'Senior Registrar' },
  notifications,
  hideNotifications = false,
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
        <div className="flex flex-row min-h-svh w-full">
          <Sidebar
            collapsible="icon"
            className="border-r border-brand-neutral-200 bg-brand-tertiary-500"
          >
            {/* ── Brand header ── */}
            <SidebarHeader className="h-14 px-4 border-b border-brand-neutral-200 flex justify-center">
              <div className="flex items-center justify-center w-full group-data-[collapsible=icon]:justify-center">
                {/* Full logo — hidden when collapsed */}
                <div className="group-data-[collapsible=icon]:hidden w-full">
                  <Image
                    src={logo}
                    alt="Retire Well SRRV"
                    width={200}
                    height={64}
                    className="object-contain w-full h-auto max-h-12"
                    priority
                  />
                </div>
                {/* Icon-only mark when collapsed — RW initials */}
                <div
                  className="hidden group-data-[collapsible=icon]:flex size-8 items-center justify-center rounded-md font-black text-sm text-white bg-brand-primary-600"
                >
                  RW
                </div>
              </div>
            </SidebarHeader>

            {/* ── Nav items ── */}
            <SidebarContent className="px-2 py-3">
              <NavItems items={navItems} />
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="px-3 pb-4 pt-2 gap-2 border-t border-brand-neutral-200">
              <SidebarLogout />
              {onCta && (
                <Button
                  onClick={onCta}
                  size="sm"
                  className="
                    w-full justify-start gap-2
                    bg-brand-primary-600 hover:bg-brand-primary-800 active:bg-brand-primary-800
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
              )}
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          {/* ── Main content area ── */}
          <SidebarInset className="flex flex-col flex-1 min-w-0 max-h-svh bg-white">

            {/* ── Top header ── */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-brand-neutral-200 bg-white px-4 gap-4 sticky top-0 z-10">
              <SidebarTrigger className="text-brand-neutral-400 hover:text-brand-neutral-700 shrink-0" />

              <div className="flex items-center gap-1">
                {!hideNotifications && (notifications ?? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-brand-neutral-500 hover:text-brand-neutral-800 hover:bg-brand-neutral-100 rounded-full size-9"
                    aria-label="Notifications"
                  >
                    <Bell className="size-[18px]" />
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-primary-500 ring-2 ring-white" />
                  </Button>
                ))}

                <div className="mx-2 h-6 w-px bg-brand-neutral-200" />

                {/* User info + avatar */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-brand-neutral-800 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-brand-neutral-400 leading-tight">
                      {user.role}
                    </p>
                  </div>
                  <Avatar className="size-8 ring-2 ring-brand-neutral-200">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback
                      className="text-xs font-bold text-white bg-brand-primary-600"
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6 animate-in fade-in duration-300">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}