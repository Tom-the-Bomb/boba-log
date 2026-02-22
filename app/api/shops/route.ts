import { getPublicAvatarUrl, uploadAvatarToR2 } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import { verifyTurnstileToken } from "@/lib/api/turnstile";
import { addShop } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const turnstileToken = String(formData.get("turnstileToken") ?? "");

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verification is required.", code: "turnstileRequired" },
        { status: 400 },
      );
    }

    const ip = request.headers.get("cf-connecting-ip");
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "Verification failed.", code: "turnstileFailed" },
        { status: 403 },
      );
    }

    const name = String(formData.get("name") ?? "").trim();
    const avatarFile = formData.get("avatar");

    if (!name) {
      return NextResponse.json(
        { error: "Shop name is required.", code: "shopNameRequired" },
        { status: 400 },
      );
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
        return NextResponse.json(
          {
            error: "Invalid avatar format. Use JPEG, PNG, or WebP.",
            code: "invalidAvatarFormat",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ shop });
  } catch {
    return NextResponse.json(
      {
        error: "Something went wrong.",
        code: "somethingWentWrong",
      },
      { status: 500 },
    );
  }
}
