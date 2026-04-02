import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";
import { z } from "zod";

const CreateShipmentSchema = z.object({
  orderId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  trackingNumber: z.string().min(1),
  carrier: z.string().optional(),
});

// GET all shipments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const warehouseId = searchParams.get("warehouseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        include: {
          orders: {
            include: { details: { include: { product: true } } },
          },
          warehouse: true,
          trackings: { orderBy: { timestamp: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shipment.count({ where }),
    ]);

    return successResponse(
      {
        data: shipments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Shipments retrieved"
    );
  } catch (error: any) {
    console.error("Get shipments error:", error);
    return errorResponse(error.message || "Failed to get shipments");
  }
}

// POST - Create shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateShipmentSchema.parse(body);

    // Check if order exists
    const order = await prisma.orders.findUnique({
      where: { id: validatedData.orderId },
    });

    if (!order) {
      return errorResponse("Order not found", 404, "Not Found");
    }

    // Check if tracking number is unique
    const existingTracking = await prisma.shipment.findUnique({
      where: { trackingNumber: validatedData.trackingNumber },
    });

    if (existingTracking) {
      return errorResponse("Tracking number already exists", 400, "Bad Request");
    }

    const shipment = await prisma.shipment.create({
      data: {
        ...validatedData,
        trackings: {
          create: {
            status: "pending",
            notes: "Shipment created",
          },
        },
      },
      include: {
        orders: {
          include: { details: { include: { product: true } } },
        },
        warehouse: true,
        trackings: true,
      },
    });

    return createdResponse(shipment, "Shipment created successfully");
  } catch (error: any) {
    console.error("Create shipment error:", error);
    return errorResponse(error.message || "Failed to create shipment");
  }
}
