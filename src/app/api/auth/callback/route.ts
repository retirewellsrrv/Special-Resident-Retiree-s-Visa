import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createClient()

  // OAuth flow
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      let role = data.user.user_metadata?.role as string | undefined

      if (!role) {
        role = 'applicant'
        await supabase.auth.updateUser({
          data: { role: 'applicant' },
        })
        await supabase.from('client_profiles').upsert(
          {
            user_id: data.user.id,
            name: data.user.user_metadata?.full_name ?? '',
            nationality: '',
            age: 0,
            birthday: '',
            sex: 'male',
          },
          { onConflict: 'user_id' },
        )
      }

      // Check super_admin_profiles — overrides metadata role
      const { data: superAdminProfile } = await supabase
        .from('super_admin_profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (superAdminProfile) {
        role = 'super_admin'
      }

      // Applicants who signed up via OAuth start with placeholder profile
      // fields (nationality/birthday empty). Send them to complete it first.
      if (role === 'applicant') {
        const { data: profile } = await supabase
          .from('client_profiles')
          .select('nationality, birthday')
          .eq('user_id', data.user.id)
          .maybeSingle()

        const profileIncomplete =
          !profile ||
          !profile.nationality?.trim() ||
          !profile.birthday?.trim()

        if (profileIncomplete) {
          return NextResponse.redirect(`${origin}/applicant/profile?setup=1`)
        }
      }

      const destination =
        role === 'super_admin'
          ? '/super-admin/dashboard'
          : role === 'admin'
            ? '/admin/dashboard'
            : '/applicant/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Email confirmation flow
  if (tokenHash && type === 'email') {
    const { error } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: tokenHash,
    })

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role as string | undefined
      const destination = role === 'admin' ? '/admin/dashboard' : '/applicant/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }

    return NextResponse.redirect(`${origin}/confirm-email?error=expired`)
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}