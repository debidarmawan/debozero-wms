import api from '@/lib/api'
import { ApiResponse, StockMovement } from '@/types'

interface StockMovementFilters {
  product_id?: string
  location_id?: string
  type?: string
  start_date?: string
  end_date?: string
  reference?: string
}

export const stockMovementService = {
  getAll: async (page = 1, limit = 20, filters: StockMovementFilters = {}) => {
    const params: any = { page, limit }
    if (filters.product_id) params.product_id = filters.product_id
    if (filters.location_id) params.location_id = filters.location_id
    if (filters.type) params.type = filters.type
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date
    if (filters.reference) params.reference = filters.reference

    const response = await api.get<ApiResponse<StockMovement[]>>('/stock-movements', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<StockMovement>>(`/stock-movements/${id}`)
    return response.data.data!
  },

  getByProduct: async (productId: string, page = 1, limit = 20) => {
    const response = await api.get<ApiResponse<StockMovement[]>>(
      `/stock-movements/product/${productId}`,
      { params: { page, limit } }
    )
    return response.data
  },
}
