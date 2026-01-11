'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { PurchaseOrder } from '@/types'
import { format } from 'date-fns'

export default function PurchaseOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (params.id) {
      loadPO()
    }
  }, [params.id, isAuthenticated, router])

  const loadPO = async () => {
    try {
      const id = params.id as string
      const data = await purchaseOrderService.getById(id)
      setPo(data)
    } catch (error) {
      console.error('Failed to load purchase order:', error)
      router.push('/purchase-orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this purchase order?')) {
      return
    }

    try {
      await purchaseOrderService.cancel(po!.id)
      loadPO()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel PO')
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

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!po) {
    return null
  }

  const canReceive = po.status === 'pending' || po.status === 'partial'
  const canCancel = po.status !== 'received' && po.status !== 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Purchase Order: {po.po_number}</h1>
            <div className="flex space-x-2">
              {canReceive && (
                <Link
                  href={`/purchase-orders/${po.id}/receive`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Receive Items
                </Link>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel PO
                </button>
              )}
              <Link
                href="/purchase-orders"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                  po.status
                )}`}
              >
                {po.status.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Vendor</h3>
              <p className="mt-1 text-sm text-gray-900">{po.vendor_name}</p>
              {po.vendor_email && (
                <p className="text-sm text-gray-500">{po.vendor_email}</p>
              )}
            </div>
            {po.expected_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(po.expected_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {po.received_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Received Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(po.received_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {po.notes && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-sm text-gray-900">{po.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {po.items && po.items.length > 0 ? (
                  po.items.map((item) => {
                    const remaining = item.quantity - item.received_qty
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Unknown Product'}
                          </div>
                          <div className="text-sm text-gray-500">{item.product?.sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.received_qty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              remaining > 0 ? 'text-yellow-600' : 'text-green-600'
                            }`}
                          >
                            {remaining}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No items in this purchase order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
