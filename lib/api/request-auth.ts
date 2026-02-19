import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function getUsernameFromRequest(request: NextRequest) {
  const token = request.cookies.get("boba_jwt")?.value ?? "";

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
