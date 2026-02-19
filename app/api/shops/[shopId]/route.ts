import { deleteAvatarFromR2 } from "@/lib/api/r2";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import { ShopIdParams } from "@/lib/api/types";
import { deleteShop } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: ShopIdParams) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    const { shopId } = await params;
    const shopIdNum = Number(shopId);
    const deleted = await deleteShop(username, shopIdNum);
    if (!deleted) {
      return NextResponse.json(
        { error: "Shop not found", code: "shopNotFound" },
        { status: 404 },
      );
    }
    await deleteAvatarFromR2(shopIdNum);

    return NextResponse.json({ success: true });
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
