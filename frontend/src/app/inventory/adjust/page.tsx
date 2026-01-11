'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { inventoryService } from '@/services/inventoryService'
import { productService } from '@/services/productService'
import { locationService } from '@/services/locationService'
import { useAuthStore } from '@/store/authStore'
import { Product, Location } from '@/types'

const adjustStockSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  location_id: z.string().min(1, 'Location is required'),
  quantity: z.number().min(-999999, 'Invalid quantity').max(999999, 'Invalid quantity'),
  notes: z.string().optional(),
})

type AdjustStockForm = z.infer<typeof adjustStockSchema>

export default function AdjustStockPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [currentStock, setCurrentStock] = useState<number | null>(null)
  const [loadingStock, setLoadingStock] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdjustStockForm>({
    resolver: zodResolver(adjustStockSchema),
  })

  const selectedProductId = watch('product_id')
  const selectedLocationId = watch('location_id')
  const quantity = watch('quantity')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadProducts()
    loadLocations()
  }, [isAuthenticated, router])

  useEffect(() => {
    if (selectedProductId && selectedLocationId) {
      loadCurrentStock(selectedProductId, selectedLocationId)
    } else {
      setCurrentStock(null)
    }
  }, [selectedProductId, selectedLocationId])

  const loadProducts = async () => {
    try {
      const response = await productService.getAll(1, 100, '')
      if (response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await locationService.getAll(1, 100, '')
      if (response.data) {
        setLocations(response.data)
      }
    } catch (error) {
      console.error('Failed to load locations:', error)
    }
  }

  const loadCurrentStock = async (productId: string, locationId: string) => {
    setLoadingStock(true)
    try {
      const inventories = await inventoryService.getByProduct(productId)
      const inventory = inventories.find((inv) => inv.location_id === locationId)
      setCurrentStock(inventory ? inventory.quantity : 0)
    } catch (error) {
      console.error('Failed to load current stock:', error)
      setCurrentStock(0)
    } finally {
      setLoadingStock(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const onSubmit = async (data: AdjustStockForm) => {
    setError('')
    setLoading(true)
    try {
      await inventoryService.adjustStock({
        product_id: data.product_id,
        location_id: data.location_id,
        quantity: data.quantity,
        notes: data.notes,
      })
      router.push('/inventory')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  const newStock = currentStock !== null && quantity !== undefined ? currentStock + quantity : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Adjust Stock</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Products
            </Link>
            <Link
              href="/inventory"
              className="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
            >
              Inventory
            </Link>
            <Link
              href="/locations"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Locations
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Product *</label>
            <select
              {...register('product_id')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <select
              {...register('location_id')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a location</option>
              {locations
                .filter((loc) => loc.is_active)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
            </select>
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-600">{errors.location_id.message}</p>
            )}
          </div>

          {/* Current Stock Display */}
          {currentStock !== null && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="text-sm text-gray-600">Current Stock</div>
              <div className="text-2xl font-bold text-gray-900">{currentStock}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adjustment Quantity *
              <span className="text-gray-400 text-xs ml-2">
                (Positive to add, negative to remove)
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 10 or -5"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
            {quantity !== undefined && quantity !== 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {quantity > 0 ? 'Adding' : 'Removing'} {Math.abs(quantity)} units
              </p>
            )}
          </div>

          {/* New Stock Preview */}
          {newStock !== null && quantity !== undefined && quantity !== 0 && (
            <div
              className={`border rounded-md p-4 ${
                newStock < 0
                  ? 'bg-red-50 border-red-200'
                  : newStock === 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="text-sm text-gray-600">New Stock After Adjustment</div>
              <div
                className={`text-2xl font-bold ${
                  newStock < 0 ? 'text-red-700' : newStock === 0 ? 'text-yellow-700' : 'text-green-700'
                }`}
              >
                {newStock < 0 ? '⚠️ ' : ''}
                {newStock.toFixed(2)}
                {newStock < 0 && ' (Negative stock!)'}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional notes about this adjustment..."
            />
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
              disabled={loading || loadingStock}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Adjusting...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
