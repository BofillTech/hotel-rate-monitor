import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '../types'

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

  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
                      req.nextUrl.pathname.startsWith('/competitors') ||
                      req.nextUrl.pathname.startsWith('/alerts') ||
                      req.nextUrl.pathname.startsWith('/settings')

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/competitors/:path*',
            '/alerts/:path*', '/settings/:path*', '/login']
}
