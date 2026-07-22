// import { SignupForm } from '@/components/auth/signup-form'

// export default function RegisterPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f4f2ec] px-4 py-12">
//       <SignupForm className="w-full max-w-4xl" />
//     </div>
//   )
// }

import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form";

export default function RegisterPage() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <SignupForm />

      {/* Bottom legal info */}
      <footer className="w-full px-4 text-center">
        <p className="mx-auto max-w-[600px] text-xs leading-4 text-white/70">
          © 2026 Retire Well SRRV. Professional Visa Consultation Services.
          <span className="mx-2">|</span>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}