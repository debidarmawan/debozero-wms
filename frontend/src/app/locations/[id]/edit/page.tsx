'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { locationService } from '@/services/locationService'
import { useAuthStore } from '@/store/authStore'
import { Location } from '@/types'

const locationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  zone: z.string().optional(),
  aisle: z.string().optional(),
  shelf: z.string().optional(),
  capacity: z.number().optional(),
  is_active: z.boolean().default(true),
})

type LocationForm = z.infer<typeof locationSchema>

export default function EditLocationPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const loadLocation = async () => {
      try {
        const id = params.id as string
        const data = await locationService.getById(id)
        setLocation(data)
        reset({
          code: data.code,
          name: data.name,
          zone: data.zone || '',
          aisle: data.aisle || '',
          shelf: data.shelf || '',
          capacity: data.capacity,
          is_active: data.is_active,
        })
      } catch (error) {
        console.error('Failed to load location:', error)
        router.push('/locations')
      } finally {
        setLoadingLocation(false)
      }
    }

    if (params.id) {
      loadLocation()
    }
  }, [params.id, isAuthenticated, router, reset])

  if (!isAuthenticated || loadingLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const onSubmit = async (data: LocationForm) => {
    setError('')
    setLoading(true)
    try {
      const id = params.id as string
      await locationService.update(id, data)
      router.push('/locations')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Location</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code * <span className="text-gray-400 text-xs">(e.g., A-01-01)</span>
            </label>
            <input
              {...register('code')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="A-01-01"
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              {...register('name')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Zone A, Aisle 1, Shelf 1"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone</label>
              <input
                {...register('zone')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="A, B, C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aisle</label>
              <input
                {...register('aisle')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="01, 02"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shelf</label>
              <input
                {...register('shelf')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="01, 02"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              step="0.01"
              {...register('capacity', { valueAsNumber: true })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Max weight or volume"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Active</label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
