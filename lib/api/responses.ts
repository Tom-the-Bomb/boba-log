import { NextResponse } from "next/server";

export function errorResponse(code: string, error: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("unauthorized", "Unauthorized", 401);
}

export function serverErrorResponse() {
  return errorResponse("somethingWentWrong", "Something went wrong.", 500);
}

export function invalidRequestResponse() {
  return errorResponse("invalidRequest", "Invalid request.", 400);
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
