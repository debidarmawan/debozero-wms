import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export function successResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(
  error: string,
  status: number = 400,
  message: string = "Error"
) {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error,
  };
  return NextResponse.json(response, { status });
}

export function createdResponse<T>(data: T, message: string = "Created") {
  return successResponse(data, message, 201);
}

export function notFoundResponse(message: string = "Resource not found") {
  return errorResponse(message, 404, "Not Found");
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return errorResponse(message, 401, "Unauthorized");
}

export function forbiddenResponse(message: string = "Forbidden") {
  return errorResponse(message, 403, "Forbidden");
}
