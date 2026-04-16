export const dynamic = 'force-dynamic'

import { HotelForm } from '../HotelForm'

export default function NewHotelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Hotel</h1>
      <HotelForm />
    </div>
  )
}

