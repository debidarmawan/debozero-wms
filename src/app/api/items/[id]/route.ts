import { NextRequest } from "next/server";
import { ProductSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";

// GET single item
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!item) {
      return notFoundResponse("Item not found");
    }

    return successResponse(item, "Item retrieved");
  } catch (error: any) {
    console.error("Get item error:", error);
    return errorResponse(error.message || "Failed to get item");
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = ProductSchema.partial().parse(body);

    const item = await prisma.item.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(item, "Item updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Item not found");
    }
    console.error("Update item error:", error);
    return errorResponse(error.message || "Failed to update item");
  }
}

// DELETE - Delete item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const item = await prisma.item.delete({
      where: { id },
    });

    return successResponse(item, "Item deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Item not found");
    }
    console.error("Delete item error:", error);
    return errorResponse(error.message || "Failed to delete item");
  }
}
