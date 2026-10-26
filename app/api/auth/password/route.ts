import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  comparePassword,
  hashPassword,
  signToken,
} from "@/lib/api/auth";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { getUserByUsername, updatePassword } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (newPassword.length < 6) {
      return errorResponse(
        "passwordMinLength",
        "Password must be at least 6 characters.",
        400,
      );
    }

    const existing = await getUserByUsername(username);
    if (!existing) {
      return unauthorizedResponse();
    }

    if (!(await comparePassword(currentPassword, existing.hashed_password))) {
      return errorResponse("invalidPassword", "Invalid password.", 401);
    }

    await updatePassword(username, await hashPassword(newPassword));

    // Other devices are now signed out; keep this one signed in.
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, await signToken({ username }), {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return serverErrorResponse();
  }
}
