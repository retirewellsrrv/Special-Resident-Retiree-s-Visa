'use client'
import { LogoutBtn } from "@/components/auth/logout-btn";

export default function AdminDashboardPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-start gap-6 px-4 py-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
                Welcome to the admin dashboard. Here you can manage users, view analytics, and perform administrative tasks.
            </p>

            <LogoutBtn />

        </div>
    )
}
