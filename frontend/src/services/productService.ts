import api from '@/lib/api'
import { ApiResponse, Product } from '@/types'

export const productService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get<ApiResponse<Product[]>>('/products', {
      params: { page, limit, search },
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data!
  },

  create: async (product: Partial<Product>) => {
    const response = await api.post<ApiResponse<Product>>('/products', product)
    return response.data.data!
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, product)
    return response.data.data!
  },

  delete: async (id: string) => {
    await api.delete(`/products/${id}`)
  },
}
