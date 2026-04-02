import { NextRequest } from "next/server";
import { ProductSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = ProductSchema.partial().parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.delete({
      where: { id: params.id },
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
