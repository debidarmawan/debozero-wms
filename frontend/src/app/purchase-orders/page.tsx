'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { PurchaseOrder } from '@/types'
import { format } from 'date-fns'

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadPOs()
  }, [isAuthenticated, _hasHydrated, router, search, statusFilter])

  const loadPOs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await purchaseOrderService.getAll(1, 50, search, statusFilter)
      if (response.data) {
        setPos(response.data)
      } else {
        setPos([])
      }
    } catch (err: any) {
      console.error('Failed to load purchase orders:', err)
      if (err.response?.status === 404) {
        setError('Purchase Orders endpoint not found. Make sure the backend is running and has the latest code.')
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:3000')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load purchase orders')
      }
      setPos([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'partial':
        return 'bg-blue-100 text-blue-800'
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Inventory
            </Link>
            <Link
              href="/locations"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Locations
            </Link>
            <Link
              href="/movements"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Movements
            </Link>
            <Link
              href="/purchase-orders"
              className="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
            >
              Purchase Orders
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-4 flex-1">
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Link
            href="/purchase-orders/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            New Purchase Order
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pos.length === 0 ? (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No purchase orders found</p>
                </li>
              ) : (
                pos.map((po) => (
                  <li key={po.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/purchase-orders/${po.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-gray-900">{po.po_number}</p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                po.status
                              )}`}
                            >
                              {po.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>Vendor: {po.vendor_name}</span>
                            {po.expected_date && (
                              <span>
                                Expected: {format(new Date(po.expected_date), 'MMM dd, yyyy')}
                              </span>
                            )}
                            {po.received_date && (
                              <span>
                                Received: {format(new Date(po.received_date), 'MMM dd, yyyy')}
                              </span>
                            )}
                            <span>
                              Items: {po.items?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {format(new Date(po.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
