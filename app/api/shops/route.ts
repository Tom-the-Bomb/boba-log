import { avatarType, deleteAvatars, uploadAvatar } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { addShop, deleteShop } from "@/lib/api/shops";
import { checkTurnstile } from "@/lib/api/turnstile";
import { MAX_SHOP_NAME_LENGTH } from "@/lib/drinks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return invalidRequestResponse();
    }

    const turnstileError = await checkTurnstile(
      request,
      formData.get("turnstileToken"),
    );
    if (turnstileError) {
      return turnstileError;
    }

    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return errorResponse("shopNameRequired", "Shop name is required.", 400);
    }
    if (name.length > MAX_SHOP_NAME_LENGTH) {
      return errorResponse("shopNameTooLong", "Shop name is too long.", 400);
    }

    const avatarFile = formData.get("avatar");
    const avatar =
      avatarFile instanceof File
        ? new Uint8Array(await avatarFile.arrayBuffer())
        : null;
    const contentType = avatar && avatarType(avatar);
    if (avatar && !contentType) {
      return errorResponse("invalidAvatarFormat", "Unsupported image.", 400);
    }

    const shop = await addShop(username, name);
    try {
      if (avatar && contentType) {
        shop.avatar = await uploadAvatar(shop.id, avatar, contentType);
      } else {
        // Shop ids can be reused; clear any avatar an earlier shop left.
        await deleteAvatars([shop.id]);
      }
    } catch {
      if (avatar) {
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
