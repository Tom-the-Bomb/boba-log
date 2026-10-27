import { clearAuthCookie, comparePassword } from "@/lib/api/auth";
import { deleteAvatars } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { listShopRows } from "@/lib/api/shops";
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
      return errorResponse("invalidPassword", "Invalid password.", 403);
    }

    const shops = await listShopRows(username);
    await deleteUser(username);
    try {
      await deleteAvatars(shops.map((shop) => shop.id));
    } catch {}

    return clearAuthCookie(NextResponse.json({ success: true }));
  } catch {
    return serverErrorResponse();
  }
}
