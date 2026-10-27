import { comparePassword, hashPassword, setAuthCookie } from "@/lib/api/auth";
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
      return errorResponse("invalidPassword", "Invalid password.", 403);
    }

    await updatePassword(username, await hashPassword(newPassword));

    // Other devices are now signed out; this one gets a fresh token.
    return setAuthCookie(NextResponse.json({ success: true }), username);
  } catch {
    return serverErrorResponse();
  }
}
