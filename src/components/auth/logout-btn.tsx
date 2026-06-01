'use client'

import { useTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAction, getSession } from '@/actions/auth'
import { Button } from '../ui/button'
import type { User } from '@supabase/supabase-js'

export function LogoutBtn() {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [user, setUser] = useState<User | null>(null)
    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction()
            router.replace('/login')
            router.refresh()
        })
    }
    useEffect(() => {
        getSession().then(setUser)
    }, [])

    // ! change the design if needed, this is just a placeholder for now
    return (
        <Button
            className="rounded-full"
            variant="outline"
            size="lg"
            onClick={handleLogout}
            disabled={pending || !user}
        >
            {pending ? 'Logging out…' : user ? 'Logout' : 'No user'}
        </Button>
    )
}