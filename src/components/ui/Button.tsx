import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600': variant === 'primary',
            'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200': variant === 'secondary',
            'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 border border-red-600': variant === 'danger',
          },
          {
            'text-xs px-3 h-7': size === 'sm',
            'text-sm px-4 h-9': size === 'md',
            'text-sm px-5 h-11': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
