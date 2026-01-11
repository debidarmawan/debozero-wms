import api from '@/lib/api'
import { ApiResponse, PurchaseOrder, PurchaseOrderItem } from '@/types'

interface ReceiveItemsRequest {
  location_id: string
  items: Array<{
    item_id: string
    quantity: number
    notes?: string
  }>
}

export const purchaseOrderService = {
  getAll: async (page = 1, limit = 10, search = '', status = '') => {
    const params: any = { page, limit }
    if (search) params.search = search
    if (status) params.status = status

    const response = await api.get<ApiResponse<PurchaseOrder[]>>('/purchase-orders', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`)
    return response.data.data!
  },

  create: async (po: Partial<PurchaseOrder>) => {
    const response = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', po)
    return response.data.data!
  },

  update: async (id: string, po: Partial<PurchaseOrder>) => {
    const response = await api.put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`, po)
    return response.data.data!
  },

  cancel: async (id: string) => {
    await api.post(`/purchase-orders/${id}/cancel`)
  },

  addItem: async (poId: string, item: Partial<PurchaseOrderItem>) => {
    const response = await api.post<ApiResponse<PurchaseOrderItem>>(
      `/purchase-orders/${poId}/items`,
      item
    )
    return response.data.data!
  },

  updateItem: async (poId: string, itemId: string, item: Partial<PurchaseOrderItem>) => {
    const response = await api.put<ApiResponse<PurchaseOrderItem>>(
      `/purchase-orders/${poId}/items/${itemId}`,
      item
    )
    return response.data.data!
  },

  deleteItem: async (poId: string, itemId: string) => {
    await api.delete(`/purchase-orders/${poId}/items/${itemId}`)
  },

  receive: async (poId: string, data: ReceiveItemsRequest) => {
    const response = await api.post<ApiResponse<PurchaseOrder>>(
      `/purchase-orders/${poId}/receive`,
      data
    )
    return response.data
  },
}
