import api from '@/lib/api'
import { ApiResponse, Inventory } from '@/types'

interface AdjustStockRequest {
  product_id: string
  location_id: string
  quantity: number
  notes?: string
}

export const inventoryService = {
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<Inventory[]>>('/inventory', {
      params: { page, limit },
    })
    return response.data
  },

  getByProduct: async (productId: string) => {
    const response = await api.get<ApiResponse<Inventory[]>>(`/inventory/product/${productId}`)
    return response.data.data || []
  },

  getTotalStock: async (productId: string) => {
    const response = await api.get<ApiResponse<{ product_id: string; total: number }>>(
      `/inventory/product/${productId}/total`
    )
    return response.data.data!
  },

  adjustStock: async (data: AdjustStockRequest) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/inventory/adjust', data)
    return response.data
  },
}
