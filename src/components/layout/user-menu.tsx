'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { logoutAction } from '@/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  user: {
    name: string
    role: string
    avatarUrl?: string
  }
}

/**
 * Header user menu shown on all portal layouts. The name/role/avatar cluster
 * acts as the dropdown trigger; logout lives here instead of the sidebar
 * footer. Replaces the former bottom-left `SidebarLogout`.
 */
export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      router.replace('/login')
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        disabled={pending}
        className={cn(
          'flex items-center gap-3 rounded-full outline-none',
          'focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2',
          'hover:opacity-80 transition-opacity',
          pending && 'cursor-wait opacity-60',
        )}
      >
        <span className="text-right hidden sm:block">
          <span className="block text-sm font-semibold text-brand-neutral-800 leading-tight">
            {user.name}
          </span>
          <span className="block text-[11px] text-brand-neutral-400 leading-tight">
            {user.role}
          </span>
        </span>
        <Avatar className="size-8 ring-2 ring-brand-neutral-200">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-xs font-bold text-white bg-brand-primary-600">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-semibold text-brand-neutral-800">{user.name}</span>
          <span className="text-xs font-normal text-brand-neutral-400">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={pending}
          aria-label={pending ? 'Logging out' : 'Logout'}
        >
          <LogOut />
          {pending ? 'Logging out…' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
