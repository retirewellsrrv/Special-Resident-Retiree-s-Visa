// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { getSession } from '@/actions/auth'

const PROTECTED_PREFIXES = ['/applicant', '/admin']
const PUBLIC_ONLY_PATHS = ['/login', '/register', '/about', '/contact', '/pricing', '/view-services']
const ADMIN_ONLY_PREFIXES = ['/admin']
const APPLICANT_ONLY_PREFIXES = ['/applicant']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

function isPublicOnly(pathname: string) {
  return PUBLIC_ONLY_PATHS.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const user = await getSession();
  const { pathname } = request.nextUrl
  console.log('🔵 middleware hit:', pathname)
  console.log('👤 user:', user?.id ?? 'null')

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname) // optional: preserve intent
    return NextResponse.redirect(loginUrl)
  }

  if (user && isPublicOnly(pathname)) {
    const userRole = user.user_metadata?.role as string | undefined

    const homeUrl = request.nextUrl.clone()

    if (userRole === 'admin') {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/admin/dashboard'
      return NextResponse.redirect(adminUrl)
    } else if (userRole === 'applicant') {
      const applicantUrl = request.nextUrl.clone()
      applicantUrl.pathname = '/applicant/dashboard'
      return NextResponse.redirect(applicantUrl)
    }

    // TODO: yet yet working properly, need to update this 
    // if (userRole === 'applicant' && ADMIN_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url))
    // }

    // if (userRole === 'admin' && APPLICANT_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url))
    // }

    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}