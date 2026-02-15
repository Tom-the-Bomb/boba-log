import { NextRequest, NextResponse } from "next/server";
import { getUsernameFromRequest } from "@/lib/request-auth";
import { addShop } from "@/lib/users";
import { processAndUploadAvatar } from "@/lib/avatar";
import { getUserByUsername } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const avatarFile = formData.get("avatar");

    if (!name || !(avatarFile instanceof File)) {
      return NextResponse.json(
        { error: "Shop name and avatar are required." },
        { status: 400 },
      );
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await processAndUploadAvatar({
        file: avatarFile,
        userId: user._id.toString(),
        shopName: name,
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid avatar format. Use JPEG, PNG, or WebP." },
        { status: 400 },
      );
    }

    const shop = await addShop(username, name);
    return NextResponse.json({ shop });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
