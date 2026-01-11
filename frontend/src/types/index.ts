export interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  unit: string
  weight?: number
  length?: number
  width?: number
  height?: number
  barcode?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  code: string
  name: string
  zone?: string
  aisle?: string
  shelf?: string
  capacity?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  product_id: string
  location_id: string
  quantity: number
  reserved: number
  available: number
  product?: Product
  location?: Location
}

export interface StockMovement {
  id: string
  product_id: string
  from_location_id?: string
  to_location_id: string
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment'
  quantity: number
  reference?: string
  notes?: string
  created_by: string
  created_at: string
  product?: Product
  from_location?: Location
  to_location?: Location
  user?: {
    id: string
    name: string
    email: string
  }
}

export type POStatus = 'draft' | 'pending' | 'partial' | 'received' | 'cancelled'

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  quantity: number
  received_qty: number
  unit_price?: number
  notes?: string
  product?: Product
}

export interface PurchaseOrder {
  id: string
  po_number: string
  vendor_name: string
  vendor_email?: string
  vendor_phone?: string
  status: POStatus
  expected_date?: string
  received_date?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
  items?: PurchaseOrderItem[]
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface ApiResponse<T> {
  error: boolean
  data?: T
  message?: string
  meta?: {
    page: number
    limit: number
    total: number
  }
}
