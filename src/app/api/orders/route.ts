import { NextRequest } from "next/server";
import { CreateOrderSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";
import { Decimal } from "@prisma/client/runtime/library";

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'inbound' or 'outbound'
    const status = searchParams.get("status");
    const warehouseId = searchParams.get("warehouseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          details: {
            include: { product: true },
          },
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.count({ where }),
    ]);

    return successResponse(
      {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Orders retrieved"
    );
  } catch (error: any) {
    console.error("Get orders error:", error);
    return errorResponse(error.message || "Failed to get orders");
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateOrderSchema.parse(body);

    // Calculate total amount
    const totalAmount = validatedData.details.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    // Create order with details
    const order = await prisma.orders.create({
      data: {
        orderNumber: validatedData.orderNumber,
        type: validatedData.type,
        warehouseId: validatedData.warehouseId,
        totalAmount: new Decimal(totalAmount),
        details: {
          createMany: {
            data: validatedData.details,
          },
        },
      },
      include: {
        warehouse: true,
        details: {
          include: { product: true },
        },
      },
    });

    return createdResponse(order, "Order created successfully");
  } catch (error: any) {
    console.error("Create order error:", error);
    return errorResponse(error.message || "Failed to create order");
  }
}
