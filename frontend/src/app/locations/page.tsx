'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { locationService } from '@/services/locationService'
import { Location } from '@/types'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function LocationsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadLocations()
  }, [isAuthenticated, router])

  const loadLocations = async () => {
    try {
      const response = await locationService.getAll(1, 50, search)
      if (response.data) {
        setLocations(response.data)
      }
    } catch (error) {
      console.error('Failed to load locations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLocations()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return
    }

    try {
      await locationService.delete(id)
      loadLocations()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete location')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AuthenticatedLayout title="Locations">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <Link
            href="/locations/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Location
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {locations.length === 0 ? (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No locations found</p>
                </li>
              ) : (
                locations.map((location) => (
                  <li key={location.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {location.name}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {location.code}
                          </span>
                          {!location.is_active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {location.zone && (
                            <span className="mr-4">Zone: {location.zone}</span>
                          )}
                          {location.aisle && (
                            <span className="mr-4">Aisle: {location.aisle}</span>
                          )}
                          {location.shelf && (
                            <span className="mr-4">Shelf: {location.shelf}</span>
                          )}
                          {location.capacity && (
                            <span>Capacity: {location.capacity}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/locations/${location.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
    </AuthenticatedLayout>
  )
}
