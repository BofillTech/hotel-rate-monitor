export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">
          This dashboard link is invalid or has been deactivated.
        </p>
        <p className="text-sm text-gray-400">
          Contact your account manager for a new link.
        </p>
      </div>
    </div>
  )
}
