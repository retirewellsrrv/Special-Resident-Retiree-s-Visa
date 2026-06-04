import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form";

import bgImage from "@/assets/images/bg-rice-terraces.png"

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-8"
      style={{
        backgroundImage: `linear-gradient(rgba(11, 28, 48, 0.45), rgba(11, 28, 48, 0.45)), url('${bgImage.src}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
    </main>
  )
}