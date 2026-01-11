'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { productService } from '@/services/productService'
import { useAuthStore } from '@/store/authStore'
import { Product } from '@/types'

const poSchema = z.object({
  po_number: z.string().min(1, 'PO number is required'),
  vendor_name: z.string().min(1, 'Vendor name is required'),
  vendor_email: z.string().email().optional().or(z.literal('')),
  vendor_phone: z.string().optional(),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, 'Product is required'),
        quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
        unit_price: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
})

type POForm = z.infer<typeof poSchema>

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<POForm>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      items: [{ product_id: '', quantity: 0, unit_price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProducts()
  }, [isAuthenticated, router])

  const loadProducts = async () => {
    try {
      const response = await productService.getAll(1, 100, '')
      if (response.data) {
        setProducts(response.data.filter((p) => p.is_active))
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const onSubmit = async (data: POForm) => {
    setError('')
    setLoading(true)
    try {
      const poData = {
        ...data,
        vendor_email: data.vendor_email || undefined,
        expected_date: data.expected_date || undefined,
        status: 'pending' as const,
      }
      const created = await purchaseOrderService.create(poData)
      router.push(`/purchase-orders/${created.id}`)
    } catch (err: any) {
      console.error('Create PO error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to create purchase order. Please check the console for details.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Purchase Order</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Number *</label>
              <input
                {...register('po_number')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="PO-2024-001"
              />
              {errors.po_number && (
                <p className="mt-1 text-sm text-red-600">{errors.po_number.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Date</label>
              <input
                type="date"
                {...register('expected_date')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor Name *</label>
            <input
              {...register('vendor_name')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.vendor_name && (
              <p className="mt-1 text-sm text-red-600">{errors.vendor_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Email</label>
              <input
                type="email"
                {...register('vendor_email')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Phone</label>
              <input
                {...register('vendor_phone')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Items *</label>
              <button
                type="button"
                onClick={() => append({ product_id: '', quantity: 0, unit_price: 0 })}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Item
              </button>
            </div>
            {errors.items && (
              <p className="mb-2 text-sm text-red-600">{errors.items.message}</p>
            )}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Product *</label>
                      <select
                        {...register(`items.${index}.product_id`)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.product_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.items[index]?.product_id?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <input
                        {...register(`items.${index}.notes`)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
