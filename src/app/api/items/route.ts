import { NextRequest } from "next/server";
import { ProductSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";

// GET all items with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: search
          ? {
              OR: [
                { code: { contains: search } },
                { name: { contains: search } },
              ],
            }
          : {},
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.item.count({
        where: search
          ? {
              OR: [
                { code: { contains: search } },
                { name: { contains: search } },
              ],
            }
          : {},
      }),
    ]);

    return successResponse(
      {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Items retrieved"
    );
  } catch (error: any) {
    console.error("Get items error:", error);
    return errorResponse(error.message || "Failed to get items");
  }
}

// POST - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = ProductSchema.parse(body);

    const existingItem = await prisma.item.findUnique({
      where: { code: validatedData.code },
    });

    if (existingItem) {
      return errorResponse("SKU already exists", 400, "Bad Request");
    }

    const item = await prisma.item.create({
      data: validatedData,
    });

    return createdResponse(item, "Item created successfully");
  } catch (error: any) {
    console.error("Create item error:", error);
    return errorResponse(error.message || "Failed to create item");
  }
}
