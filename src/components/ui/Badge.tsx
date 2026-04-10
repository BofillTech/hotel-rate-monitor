import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray' | 'teal'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
      {
        'bg-blue-50 text-blue-700': variant === 'blue',
        'bg-green-50 text-green-700': variant === 'green',
        'bg-red-50 text-red-700': variant === 'red',
        'bg-amber-50 text-amber-700': variant === 'amber',
        'bg-purple-50 text-purple-700': variant === 'purple',
        'bg-gray-100 text-gray-600': variant === 'gray',
        'bg-teal-50 text-teal-700': variant === 'teal',
      },
      className
    )}>
      {children}
    </span>
  )
}
