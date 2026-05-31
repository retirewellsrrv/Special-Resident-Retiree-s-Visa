import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
      <Link href="/login" className="text-primary hover:underline">Go to login</Link>
    </div>
  )
}
