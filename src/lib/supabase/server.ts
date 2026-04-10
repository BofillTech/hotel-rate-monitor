import { createServerClient as createSupabaseServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies as getCookies } from 'next/headers'
import type { Database } from '../types'

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      async getAll() {
        const cookieStore = await getCookies()
        return cookieStore.getAll()
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await getCookies()
          cookiesToSet.forEach(({ name, value }) => {
            cookieStore.set(name, value)
          })
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware handling cookie updates.
        }
      },
    },
  })
}

/** Service-role client â bypasses RLS. Use for public token-based dashboards. */
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient(supabaseUrl, serviceKey) as any
}
