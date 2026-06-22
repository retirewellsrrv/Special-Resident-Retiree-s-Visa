import ConfirmEmailForm from '@/components/auth/confirm-email'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ email?: string; error?: string }>
}

export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <>
      <ConfirmEmailForm
        email={email ?? ''}
      />

      <footer className="pointer-events-none absolute bottom-6 w-full px-4 text-center">
        <p className="mx-auto max-w-[600px] text-xs leading-4 text-white/70">
          © 2024 Retire Well SRRV. Professional Visa Consultation Services.
          <span className="mx-2">|</span>
          <Link
            href="#"
            className="pointer-events-auto transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
        </p>
      </footer>
    </>
  )
}
