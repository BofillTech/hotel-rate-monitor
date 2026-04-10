'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/competitors', label: 'Competitors' },
  { href: '/alerts',      label: 'Alerts' },
  { href: '/settings',    label: 'Settings' },
]

interface NavProps {
  hotelName?: string
  email?: string
  unreadAlerts?: number
}

export function Nav({ hotelName, email, unreadAlerts = 0 }: NavProps) {
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
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Rate Monitor</span>
        </div>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm transition-colors relative',
              pathname === link.href
                ? 'text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {link.label}
            {link.href === '/alerts' && unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {hotelName && (
          <span className="text-xs text-gray-400 border-r border-gray-200 pr-3">{hotelName}</span>
        )}
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
