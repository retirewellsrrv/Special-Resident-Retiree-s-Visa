'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavItemsProps {
  items: NavItem[]
  label?: string
}

export function NavItems({ items, label }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    isActive && [
                      '!bg-brand-primary-600 !text-white !font-semibold',
                      'data-active:!shadow-sm',
                      'group-data-[collapsible=icon]:!bg-brand-primary-600 group-data-[collapsible=icon]:!rounded-md group-data-[collapsible=icon]:!shadow-sm group-data-[collapsible=icon]:!h-7 group-data-[collapsible=icon]:!w-auto group-data-[collapsible=icon]:!gap-0',
                    ]
                  )}
                >
                  <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
