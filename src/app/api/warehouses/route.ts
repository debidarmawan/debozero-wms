import { NextRequest } from "next/server";
import { WarehouseSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";

// GET all warehouses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        skip,
        take: limit,
        include: {
          users: { select: { id: true, name: true, email: true } },
          _count: {
            select: { inventories: true, orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.warehouse.count(),
    ]);

    return successResponse(
      {
        data: warehouses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Warehouses retrieved"
    );
  } catch (error: any) {
    console.error("Get warehouses error:", error);
    return errorResponse(error.message || "Failed to get warehouses");
  }
}

// POST - Create new warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = WarehouseSchema.parse(body);

    const warehouse = await prisma.warehouse.create({
      data: validatedData,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return createdResponse(warehouse, "Warehouse created successfully");
  } catch (error: any) {
    console.error("Create warehouse error:", error);
    return errorResponse(error.message || "Failed to create warehouse");
  }
}
