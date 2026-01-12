'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { inventoryService } from '@/services/inventoryService'
import { Inventory } from '@/types'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function InventoryPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInventory()
  }, [isAuthenticated, router])

  const loadInventory = async () => {
    try {
      const response = await inventoryService.getAll(1, 50)
      if (response.data) {
        setInventories(response.data)
      }
    } catch (error) {
      console.error('Failed to load inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AuthenticatedLayout title="Inventory">
        <div className="mb-4 flex justify-end">
          <Link
            href="/inventory/adjust"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Adjust Stock
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {inventories.length === 0 ? (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No inventory records found</p>
                </li>
              ) : (
                inventories.map((inventory) => (
                  <li key={inventory.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inventory.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Location: {inventory.location?.name || inventory.location?.code || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Qty: {inventory.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Available: {inventory.available}
                        </p>
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
