'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/admin', label: 'Hotels' },
]

interface AdminNavProps {
  email?: string
}

export function AdminNav({ email }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Rate Monitor Admin</span>
        </div>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm transition-colors',
              pathname === link.href
                ? 'text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{email}</span>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-400 hover:text-gray-600 ml-2"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

