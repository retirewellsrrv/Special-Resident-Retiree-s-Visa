import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form";

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <>
      <LoginForm error={error} />

      {/* Bottom legal info */}
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