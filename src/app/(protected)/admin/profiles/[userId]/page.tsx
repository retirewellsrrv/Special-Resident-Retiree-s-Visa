import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getClientDetail } from '@/actions/admin/client-profiles'
import { ClientProfileDetail } from '@/components/admin/client-profiles/client-profile-detail'

export default async function ClientProfileDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const detail = await getClientDetail(userId)
  if (!detail) notFound()

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/admin/profiles"
        className="inline-flex items-center gap-1.5 text-sm text-brand-neutral-500 hover:text-brand-neutral-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Client Profiles
      </Link>

      <ClientProfileDetail detail={detail} />
    </div>
  )
}