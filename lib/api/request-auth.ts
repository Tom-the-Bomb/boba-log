import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./auth";
import { getSessionWindow } from "./users";

/**
 * Returns the signed-in username, or null. A token only counts if the account
 * still exists and the token was issued after the account was created and
 * after the last password change.
 */
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
