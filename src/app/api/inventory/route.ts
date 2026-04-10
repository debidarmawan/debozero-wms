import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";
import { z } from "zod";

const InventorySchema = z.object({
  item_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  quantity: z.number().positive(),
  min_stock: z.number().nonnegative().optional(),
});

// GET inventory items with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouse_id = searchParams.get("warehouse_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (warehouse_id) {
      where.warehouse_id = warehouse_id;
    }

    const [items, total] = await Promise.all([
      prisma.inventory_item.findMany({
        where,
        skip,
        take: limit,
        include: {
          item: true,
          warehouse: true,
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.inventory_item.count({ where }),
    ]);

    return successResponse(
      {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Inventory items retrieved"
    );
  } catch (error: any) {
    console.error("Get inventory error:", error);
    return errorResponse(error.message || "Failed to get inventory");
  }
}

// POST - Add/Update inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = InventorySchema.parse(body);

    // Check if already exists
    const existing = await prisma.inventory_item.findUnique({
      where: {
        item_id_warehouse_id: {
          item_id: validatedData.item_id,
          warehouse_id: validatedData.warehouse_id,
        },
      },
    });

    if (existing) {
      // Update existing inventory
      const updated = await prisma.inventory_item.update({
        where: {
          item_id_warehouse_id: {
            item_id: validatedData.item_id,
            warehouse_id: validatedData.warehouse_id,
          },
        },
        data: {
          quantity: validatedData.quantity,
          min_stock: validatedData.min_stock,
          last_restocked: new Date(),
        },
        include: {
          item: true,
          warehouse: true,
        },
      });

      return successResponse(updated, "Inventory updated successfully");
    }

    // Create new inventory item
    const inventoryItem = await prisma.inventory_item.create({
      data: validatedData,
      include: {
        item: true,
        warehouse: true,
      },
    });

    return createdResponse(inventoryItem, "Inventory item created successfully");
  } catch (error: any) {
    console.error("Create/update inventory error:", error);
    return errorResponse(error.message || "Failed to update inventory");
  }
}
