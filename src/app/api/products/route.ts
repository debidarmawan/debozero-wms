import { NextRequest } from "next/server";
import { ProductSchema } from "@/utils/validation";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse, notFoundResponse } from "@/utils/response";

// GET all products with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
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
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products retrieved"
    );
  } catch (error: any) {
    console.error("Get products error:", error);
    return errorResponse(error.message || "Failed to get products");
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = ProductSchema.parse(body);

    // Check if SKU already exists
    const existingProduct = await prisma.item.findUnique({
      where: { code: validatedData.code },
    });

    if (existingProduct) {
      return errorResponse("SKU already exists", 400, "Bad Request");
    }

    const product = await prisma.item.create({
      data: validatedData,
    });

    return createdResponse(product, "Product created successfully");
  } catch (error: any) {
    console.error("Create product error:", error);
    return errorResponse(error.message || "Failed to create product");
  }
}
