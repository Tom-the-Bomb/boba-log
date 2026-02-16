import { processAndUploadAvatar } from "@/lib/avatar";
import { DEFAULT_SHOPS } from "@/lib/default-shops";
import { getUsernameFromRequest } from "@/lib/request-auth";
import { addShop, getUserByUsername } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const avatarFile = formData.get("avatar");

    if (!name) {
      return NextResponse.json(
        { error: "Shop name is required." },
        { status: 400 },
      );
    }

    const hasUploadedAvatar = avatarFile instanceof File;
    const isPresetShop = DEFAULT_SHOPS.some(
      (shop) => shop.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (!hasUploadedAvatar && !isPresetShop) {
      return NextResponse.json(
        { error: "Shop avatar is required for custom shops." },
        { status: 400 },
      );
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = await addShop(username, name);

    if (hasUploadedAvatar) {
      try {
        await processAndUploadAvatar({
          file: avatarFile,
          shopId: shop.id,
        });
      } catch {
        return NextResponse.json(
          { error: "Invalid avatar format. Use JPEG, PNG, or WebP." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ shop });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
