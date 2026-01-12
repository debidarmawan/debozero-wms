'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { stockMovementService } from '@/services/stockMovementService'
import { productService } from '@/services/productService'
import { locationService } from '@/services/locationService'
import { StockMovement, Product, Location } from '@/types'
import { format } from 'date-fns'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function MovementsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Filters
  const [filters, setFilters] = useState({
    product_id: '',
    location_id: '',
    type: '',
    start_date: '',
    end_date: '',
    reference: '',
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProducts()
    loadLocations()
  }, [isAuthenticated, router])

  useEffect(() => {
    loadMovements()
  }, [page, filters])

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

  const loadMovements = async () => {
    setLoading(true)
    try {
      const filterParams: any = {}
      if (filters.product_id) filterParams.product_id = filters.product_id
      if (filters.location_id) filterParams.location_id = filters.location_id
      if (filters.type) filterParams.type = filters.type
      if (filters.start_date) filterParams.start_date = filters.start_date
      if (filters.end_date) filterParams.end_date = filters.end_date
      if (filters.reference) filterParams.reference = filters.reference

      const response = await stockMovementService.getAll(page, 20, filterParams)
      if (response.data) {
        setMovements(response.data)
        setTotal(response.meta?.total || 0)
      }
    } catch (error) {
      console.error('Failed to load movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setFilters({
      product_id: '',
      location_id: '',
      type: '',
      start_date: '',
      end_date: '',
      reference: '',
    })
    setPage(1)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound':
        return 'bg-green-100 text-green-800'
      case 'outbound':
        return 'bg-red-100 text-red-800'
      case 'transfer':
        return 'bg-blue-100 text-blue-800'
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuantityDisplay = (movement: StockMovement) => {
    const sign = movement.quantity >= 0 ? '+' : ''
    return `${sign}${movement.quantity}`
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AuthenticatedLayout title="Stock Movement History">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={filters.product_id}
                onChange={(e) => handleFilterChange('product_id', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={filters.location_id}
                onChange={(e) => handleFilterChange('location_id', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={filters.reference}
                onChange={(e) => handleFilterChange('reference', e.target.value)}
                placeholder="PO/SO number"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Movements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {movements.length === 0 ? (
                  <li className="px-4 py-5 sm:px-6">
                    <p className="text-sm text-gray-500">No stock movements found</p>
                  </li>
                ) : (
                  movements.map((movement) => (
                    <li key={movement.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                movement.type
                              )}`}
                            >
                              {movement.type.toUpperCase()}
                            </span>
                            <p className="text-sm font-medium text-gray-900">
                              {movement.product?.name || 'Unknown Product'}
                            </p>
                            {movement.reference && (
                              <span className="text-sm text-gray-500">({movement.reference})</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                              {movement.from_location
                                ? `From: ${movement.from_location.name}`
                                : 'From: External'}
                            </span>
                            <span>→</span>
                            <span>To: {movement.to_location?.name || 'Unknown'}</span>
                            {movement.user && <span>By: {movement.user.name}</span>}
                            <span>
                              {format(new Date(movement.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          {movement.notes && (
                            <p className="mt-1 text-sm text-gray-400">{movement.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {getQuantityDisplay(movement)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} movements
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
    </AuthenticatedLayout>
  )
}
