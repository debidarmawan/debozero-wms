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

// Product schemas
export const ProductSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  weight: z.number().positive("Weight must be positive").optional(),
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
  orderNumber: z.string().min(1, "Order number is required"),
  type: z.enum(["inbound", "outbound"]),
  warehouseId: z.string().uuid("Warehouse ID must be a valid UUID"),
  details: z.array(
    z.object({
      productId: z.string().uuid("Product ID must be a valid UUID"),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
    })
  ),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type WarehouseInput = z.infer<typeof WarehouseSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
