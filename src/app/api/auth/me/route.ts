import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse } from "@/utils/response";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return unauthorizedResponse("No token provided");
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return unauthorizedResponse("Invalid token");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        warehouse_id: true,
      },
    });

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    return successResponse(user, "User profile retrieved");
  } catch (error: any) {
    console.error("Profile error:", error);
    return unauthorizedResponse("Invalid token");
  }
}
