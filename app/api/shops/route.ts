import { getPublicAvatarUrl, uploadAvatarToR2 } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { addShop, deleteShop } from "@/lib/api/shops";
import { verifyTurnstileToken } from "@/lib/api/turnstile";
import { MAX_SHOP_NAME_LENGTH } from "@/lib/drinks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const turnstileToken = String(formData.get("turnstileToken") ?? "");

    if (!turnstileToken) {
      return errorResponse(
        "turnstileRequired",
        "Verification is required.",
        400,
      );
    }

    const ip = request.headers.get("cf-connecting-ip");
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return errorResponse("turnstileFailed", "Verification failed.", 403);
    }

    const name = String(formData.get("name") ?? "").trim();
    const avatarFile = formData.get("avatar");

    if (!name) {
      return errorResponse("shopNameRequired", "Shop name is required.", 400);
    }

    if (name.length > MAX_SHOP_NAME_LENGTH) {
      return errorResponse("shopNameTooLong", "Shop name is too long.", 400);
    }

    const shop = await addShop(username, name);

    if (avatarFile instanceof File) {
      try {
        await uploadAvatarToR2({
          shopId: shop.id,
          body: await avatarFile.arrayBuffer(),
        });
        shop.avatar = getPublicAvatarUrl(shop.id);
      } catch {
        await deleteShop(username, shop.id);
        return errorResponse(
          "avatarUploadFailed",
          "Failed to upload avatar.",
          500,
        );
      }
    }

    return NextResponse.json({ shop });
  } catch {
    return serverErrorResponse();
  }
}
