'use client'
import { LogoutBtn } from "@/components/auth/logout-btn";
import { PageHeader } from "@/components/admin/shared/page-header";

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col items-center justify-start gap-6">
            <PageHeader
                title="Admin Dashboard"
                description="Welcome to the admin dashboard. Here you can manage users, view analytics, and perform administrative tasks."
                variant="centered"
            />

            <LogoutBtn />

        </div>
    )
}
