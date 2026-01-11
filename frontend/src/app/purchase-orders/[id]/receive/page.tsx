'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { locationService } from '@/services/locationService'
import { useAuthStore } from '@/store/authStore'
import { PurchaseOrder, Location } from '@/types'

const receiveSchema = z.object({
  location_id: z.string().min(1, 'Location is required'),
  items: z.array(
    z.object({
      item_id: z.string(),
      quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
      notes: z.string().optional(),
    })
  ),
})

type ReceiveForm = z.infer<typeof receiveSchema>

export default function ReceivePurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReceiveForm>({
    resolver: zodResolver(receiveSchema),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (params.id) {
      loadData()
    }
  }, [params.id, isAuthenticated, router])

  const loadData = async () => {
    try {
      const id = params.id as string
      const [poData, locationsData] = await Promise.all([
        purchaseOrderService.getById(id),
        locationService.getAll(1, 100, ''),
      ])

      setPo(poData)
      if (locationsData.data) {
        setLocations(locationsData.data.filter((loc) => loc.is_active))
      }

      // Initialize form with items that need to be received
      if (poData.items) {
        const itemsToReceive = poData.items
          .filter((item) => item.quantity > item.received_qty)
          .map((item) => ({
            item_id: item.id,
            quantity: item.quantity - item.received_qty,
            notes: '',
          }))

        reset({
          location_id: '',
          items: itemsToReceive,
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      router.push('/purchase-orders')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!po || po.status === 'received' || po.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-red-600">Cannot receive items for this purchase order.</p>
            <button
              onClick={() => router.push(`/purchase-orders/${po?.id}`)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to PO
            </button>
          </div>
        </div>
      </div>
    )
  }


  const onSubmit = async (data: ReceiveForm) => {
    setError('')
    setSubmitting(true)
    try {
      await purchaseOrderService.receive(po.id, {
        location_id: data.location_id,
        items: data.items,
      })
      router.push(`/purchase-orders/${po.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to receive items')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Receive Items - {po.po_number}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <select
              {...register('location_id')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-600">{errors.location_id.message}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items to Receive</h3>
            <div className="space-y-4">
              {po.items
                ?.filter((item) => item.quantity > item.received_qty)
                .map((item, index) => {
                  const remaining = item.quantity - item.received_qty
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-md p-4">
                      <input
                        type="hidden"
                        {...register(`items.${index}.item_id` as const)}
                        value={item.id}
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ordered: {item.quantity} | Received: {item.received_qty} | Remaining:{' '}
                            {remaining}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Quantity to Receive *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            max={remaining}
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            defaultValue={remaining}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Notes</label>
                          <input
                            {...register(`items.${index}.notes` as const)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Optional notes"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
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
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Receiving...' : 'Receive Items'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
