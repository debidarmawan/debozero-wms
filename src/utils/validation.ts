import { z } from "zod";

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Item schemas (create + update; partial() used for PUT)
export const ProductSchema = z.object({
  code: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Item name is required"),
  status: z.boolean().optional(),
  item_type_id: z.union([z.string().min(1), z.null()]).optional(),
  control_stock: z.boolean().optional(),
  safety_stock: z.coerce.number().int().min(0).optional(),
  minimum_order_quantity: z.coerce.number().int().min(1).optional(),
  lead_time_in_days: z.coerce.number().int().min(0).optional(),
  warehouse_id: z.union([z.string().uuid(), z.null()]).optional(),
  specification: z.union([z.string(), z.null()]).optional(),
  remark: z.union([z.string(), z.null()]).optional(),
});

// Warehouse schemas
export const WarehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  capacity: z.number().positive("Capacity must be positive"),
});

// Order schemas
export const CreateOrderSchema = z.object({
  order_number: z.string().min(1, "Order number is required"),
  type: z.enum(["inbound", "outbound"]),
  warehouse_id: z.string().uuid("Warehouse ID must be a valid UUID"),
  details: z.array(
    z.object({
      item_id: z.string().uuid("Item ID must be a valid UUID"),
      quantity: z.number().positive(),
      unit_price: z.number().positive(),
    })
  ),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type WarehouseInput = z.infer<typeof WarehouseSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
