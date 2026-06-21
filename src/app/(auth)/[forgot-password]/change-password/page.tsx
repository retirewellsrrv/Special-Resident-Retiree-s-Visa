import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChangePasswordForm from '@/components/auth/change-password-form'

export default async function ResetPasswordPage(props: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await props.searchParams

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirect('/forgot-password/change-password')
    }

    redirect('/login?error=auth_failed')
  }

  return <ChangePasswordForm />
}