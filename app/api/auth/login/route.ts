import { NextRequest } from "next/server";
import { LoginSchema } from "@/utils/validation";
import { verifyPassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = LoginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401, "Unauthorized");
    }

    // Verify password
    const passwordMatch = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401, "Unauthorized");
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          warehouseId: user.warehouseId,
        },
        token,
      },
      "Login successful"
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return errorResponse(error.message || "Login failed", 400);
  }
}
