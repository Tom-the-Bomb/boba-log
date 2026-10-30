import { deleteAvatars } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { deleteShop } from "@/lib/api/shops";
import type { ShopIdParams } from "@/lib/api/types";
import { parseId } from "@/lib/api/validation";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: ShopIdParams) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const shopId = parseId((await params).shopId);
    if (!shopId || !(await deleteShop(username, shopId))) {
      return errorResponse("shopNotFound", "Shop not found", 404);
    }
    try {
      await deleteAvatars([shopId]);
    } catch {}

    return NextResponse.json({ success: true });
  } catch {
    return serverErrorResponse();
  }
}
