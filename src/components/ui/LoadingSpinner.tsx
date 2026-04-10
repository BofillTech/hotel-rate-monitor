import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 px-5 py-3 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/4" />
      <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
      <div className="h-4 bg-gray-100 rounded w-16" />
      <div className="h-4 bg-gray-100 rounded w-20" />
      <div className="h-4 bg-gray-100 rounded w-14" />
    </div>
  )
}
