import { LogoutBtn } from "@/components/auth/logout-btn";

export default function applicantDashboardPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-start gap-6 px-4 py-8">
            <h1 className="text-3xl font-bold">Applicant Dashboard</h1>
            <p className="text-lg text-muted-foreground">
                Welcome to the applicant dashboard. Here you can view your application status, update your profile, and access resources for your retirement planning.
            </p>

            <LogoutBtn />
        </div>
    )
}