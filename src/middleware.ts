import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/types'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          req.cookies.set(name, value)
        })
        res = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        cookiesToSet.forEach(({ name, value }) => {
          res.cookies.set(name, value)
        })
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl
  const isAuthPage = pathname.startsWith('/login')

  // Redirect old /dashboard (exact) to /ratetracker/royalatlantic
  // TODO: When multi-tenant auth is fully set up, resolve the user's hotel slug dynamically
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(new URL('/ratetracker/royalatlantic', req.url))
  }

  // Public token-based dashboards don't require auth
  const isPublicDashboard = /^\/dashboard\/[^/]+$/.test(pathname)
  // /ratetracker/[slug] routes are public (client-facing dashboards)
  const isRateTracker = pathname.startsWith('/ratetracker/')
  const isDashboard = !isPublicDashboard && !isRateTracker && (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/competitors') ||
    pathname.startsWith('/alerts') ||
    pathname.startsWith('/settings')
  )

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/ratetracker/royalatlantic', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/ratetracker/:path*', '/competitors/:path*',
            '/alerts/:path*', '/settings/:path*', '/login']
}
