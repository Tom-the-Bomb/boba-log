import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./auth";
import { getUser } from "./users";

// Tokens issued before sign-up or the last password change don't count.
export async function getUsernameFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const verified = token ? await verifyToken(token).catch(() => null) : null;
  if (!verified) {
    return null;
  }

  const user = await getUser(verified.username);
  if (
    !user ||
    verified.issuedAt < Math.max(user.created_at, user.sessions_valid_after)
  ) {
    return null;
  }
  return verified.username;
}
