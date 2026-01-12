'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { productService } from '@/services/productService'
import { Product } from '@/types'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function ProductsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProducts()
  }, [isAuthenticated, router])

  const loadProducts = async () => {
    try {
      const response = await productService.getAll(1, 50, search)
      if (response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  if (!isAuthenticated) {
    return null
  }

  return (
    <AuthenticatedLayout title="Products">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <Link
            href="/products/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <li className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-500">No products found</p>
                </li>
              ) : (
                products.map((product) => (
                  <li key={product.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        {product.description && (
                          <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{product.category || 'Uncategorized'}</p>
                        <p className="text-sm text-gray-400">Unit: {product.unit}</p>
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
