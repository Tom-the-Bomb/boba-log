import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  comparePassword,
} from "@/lib/api/auth";
import { deleteAvatarsFromR2 } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { listShopIds } from "@/lib/api/shops";
import { deleteUser, getUserByUsername } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    const existing = await getUserByUsername(username);
    if (!existing) {
      return unauthorizedResponse();
    }

    const password = String(body.password ?? "");
    if (!(await comparePassword(password, existing.hashed_password))) {
      return errorResponse("invalidPassword", "Invalid password.", 401);
    }

    const shopIds = await listShopIds(username);
    await deleteUser(username);
    try {
      await deleteAvatarsFromR2(shopIds);
    } catch {
      // The account is gone; orphaned avatars are unreachable and harmless.
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0,
    });
    return response;
  } catch {
    return serverErrorResponse();
  }
}
