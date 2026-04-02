import { NextRequest } from "next/server";
import { RegisterSchema } from "@/utils/validation";
import { hashPassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, createdResponse } from "@/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = RegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse("Email already registered", 400, "Bad Request");
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: "staff",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return createdResponse(
      {
        user,
        token,
      },
      "User registered successfully"
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return errorResponse(error.message || "Registration failed", 400);
  }
}
