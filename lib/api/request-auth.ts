import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./auth";

export async function getUsernameFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? "";

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return payload.username;
  } catch {
    return null;
  }
}
