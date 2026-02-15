import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export function getUsernameFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return payload.username;
  } catch {
    return null;
  }
}
