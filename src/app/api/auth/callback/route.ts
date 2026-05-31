import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Assign default role to OAuth users if not already set
      const role = data.user.user_metadata?.role
      if (!role) {
        await supabase.auth.updateUser({
          data: { role: 'applicant' },
        })

        // Also seed client_profiles for first-time OAuth users
        await supabase.from('client_profiles').upsert({
          user_id: data.user.id,
          name: data.user.user_metadata?.full_name ?? '',
          nationality: '',
          address: '',
          age: 0,
          birthday: '',
          sex: 'male',
        }, { onConflict: 'user_id' })
      }

      const destination = role === 'admin' ? '/admin/dashboard' : '/applicant/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}