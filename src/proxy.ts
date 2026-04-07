import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  // Check if route needs authentication
  const protectedRoutes = ["/api/admin", "/api/products", "/api/warehouses", "/api/orders", "/api/inventory", "/api/shipments"];
  
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
