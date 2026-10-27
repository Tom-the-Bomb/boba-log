import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./auth";
import { getSessionWindow } from "./users";

// Tokens issued before sign-up or the last password change don't count.
export async function getUsernameFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? "";

  if (!token) {
    return null;
  }

  try {
    const { username, issuedAt } = await verifyToken(token);
    const session = await getSessionWindow(username);
    if (
      !session ||
      issuedAt < Math.max(session.created_at, session.sessions_valid_after)
    ) {
      return null;
    }
    return username;
  } catch {
    return null;
  }
}
