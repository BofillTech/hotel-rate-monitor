export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from './AdminNav'

export const metadata = {
  title: 'Admin | Rate Monitor',
  description: 'Global admin dashboard for Rate Monitor',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav email={session.user.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
