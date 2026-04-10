import { NextRequest } from "next/server";
import { ProductSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";

// GET single product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await prisma.item.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return notFoundResponse("Product not found");
    }

    return successResponse(product, "Product retrieved");
  } catch (error: any) {
    console.error("Get product error:", error);
    return errorResponse(error.message || "Failed to get product");
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = ProductSchema.partial().parse(body);

    const product = await prisma.item.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(product, "Product updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Product not found");
    }
    console.error("Update product error:", error);
    return errorResponse(error.message || "Failed to update product");
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await prisma.item.delete({
      where: { id },
    });

    return successResponse(product, "Product deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Product not found");
    }
    console.error("Delete product error:", error);
    return errorResponse(error.message || "Failed to delete product");
  }
}
