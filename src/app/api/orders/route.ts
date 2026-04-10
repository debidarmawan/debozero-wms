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
    const warehouse_id = searchParams.get("warehouse_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (warehouse_id) where.warehouse_id = warehouse_id;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          details: {
            include: { item: true },
          },
          shipment: true,
        },
        orderBy: { created_at: "desc" },
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
    const total_amount = validatedData.details.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    // Create order with details
    const order = await prisma.orders.create({
      data: {
        order_number: validatedData.order_number,
        type: validatedData.type,
        warehouse_id: validatedData.warehouse_id,
        total_amount: new Decimal(total_amount),
        details: {
          createMany: {
            data: validatedData.details,
          },
        },
      },
      include: {
        warehouse: true,
        details: {
          include: { item: true },
        },
      },
    });

    return createdResponse(order, "Order created successfully");
  } catch (error: any) {
    console.error("Create order error:", error);
    return errorResponse(error.message || "Failed to create order");
  }
}
