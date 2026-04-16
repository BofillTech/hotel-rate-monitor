export const dynamic = 'force-dynamic'

export default async function AlertsPage({
  params,
  }: {
    params: Promise<{ slug: string }>
    }) {
      const { slug } = await params

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h1>
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                                <p className="text-lg mb-2">Alert configuration coming soon</p>
                                        <p className="text-sm">Price drop notifications, parity alerts, and competitor monitoring will be wired here.</p>
                                              </div>
                                                  </div>
                                                    )
                                                    }