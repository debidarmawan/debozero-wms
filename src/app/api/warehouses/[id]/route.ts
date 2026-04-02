import { NextRequest } from "next/server";
import { WarehouseSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";

// GET single warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        inventories: {
          include: { product: true },
          take: 10,
        },
        _count: {
          select: { users: true, inventories: true, orders: true },
        },
      },
    });

    if (!warehouse) {
      return notFoundResponse("Warehouse not found");
    }

    return successResponse(warehouse, "Warehouse retrieved");
  } catch (error: any) {
    console.error("Get warehouse error:", error);
    return errorResponse(error.message || "Failed to get warehouse");
  }
}

// PUT - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = WarehouseSchema.partial().parse(body);

    const warehouse = await prisma.warehouse.update({
      where: { id: params.id },
      data: validatedData,
    });

    return successResponse(warehouse, "Warehouse updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Warehouse not found");
    }
    console.error("Update warehouse error:", error);
    return errorResponse(error.message || "Failed to update warehouse");
  }
}

// DELETE - Delete warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouse = await prisma.warehouse.delete({
      where: { id: params.id },
    });

    return successResponse(warehouse, "Warehouse deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Warehouse not found");
    }
    console.error("Delete warehouse error:", error);
    return errorResponse(error.message || "Failed to delete warehouse");
  }
}
