import api from '@/lib/api'
import { ApiResponse, Location } from '@/types'

export const locationService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get<ApiResponse<Location[]>>('/locations', {
      params: { page, limit, search },
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Location>>(`/locations/${id}`)
    return response.data.data!
  },

  create: async (location: Partial<Location>) => {
    const response = await api.post<ApiResponse<Location>>('/locations', location)
    return response.data.data!
  },

  update: async (id: string, location: Partial<Location>) => {
    const response = await api.put<ApiResponse<Location>>(`/locations/${id}`, location)
    return response.data.data!
  },

  delete: async (id: string) => {
    await api.delete(`/locations/${id}`)
  },
}
