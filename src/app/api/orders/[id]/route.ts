import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";
import { z } from "zod";

// GET single order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        warehouse: true,
        details: {
          include: { item: true },
        },
        shipment: {
          include: {
            trackings: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse("Order not found");
    }

    return successResponse(order, "Order retrieved");
  } catch (error: any) {
    console.error("Get order error:", error);
    return errorResponse(error.message || "Failed to get order");
  }
}

// PUT - Update order status
const UpdateOrderSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = UpdateOrderSchema.parse(body);

    const order = await prisma.orders.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        warehouse: true,
        details: { include: { item: true } },
      },
    });

    return successResponse(order, "Order updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Order not found");
    }
    console.error("Update order error:", error);
    return errorResponse(error.message || "Failed to update order");
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.orders.delete({
      where: { id },
    });

    return successResponse(order, "Order cancelled successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Order not found");
    }
    console.error("Delete order error:", error);
    return errorResponse(error.message || "Failed to delete order");
  }
}
