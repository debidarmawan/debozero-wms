import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/utils/response";
import { z } from "zod";

// GET single shipment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          include: { details: { include: { product: true } } },
        },
        warehouse: true,
        trackings: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!shipment) {
      return notFoundResponse("Shipment not found");
    }

    return successResponse(shipment, "Shipment retrieved");
  } catch (error: any) {
    console.error("Get shipment error:", error);
    return errorResponse(error.message || "Failed to get shipment");
  }
}

// PUT - Update shipment status
const UpdateShipmentSchema = z.object({
  status: z.enum(["pending", "in_transit", "delivered", "cancelled"]),
  shippedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateShipmentSchema.parse(body);

    const shipment = await prisma.shipment.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        shippedAt: validatedData.shippedAt
          ? new Date(validatedData.shippedAt)
          : undefined,
        deliveredAt: validatedData.deliveredAt
          ? new Date(validatedData.deliveredAt)
          : undefined,
      },
      include: {
        orders: {
          include: { details: { include: { product: true } } },
        },
        warehouse: true,
        trackings: true,
      },
    });

    return successResponse(shipment, "Shipment updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return notFoundResponse("Shipment not found");
    }
    console.error("Update shipment error:", error);
    return errorResponse(error.message || "Failed to update shipment");
  }
}

// Add tracking update
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const TrackingSchema = z.object({
      status: z.string().min(1),
      location: z.string().optional(),
      notes: z.string().optional(),
    });

    const trackingData = TrackingSchema.parse(body);

    const tracking = await prisma.shipment_tracking.create({
      data: {
        shipmentId: params.id,
        ...trackingData,
      },
    });

    return successResponse(tracking, "Tracking update added successfully");
  } catch (error: any) {
    console.error("Add tracking error:", error);
    return errorResponse(error.message || "Failed to add tracking update");
  }
}
