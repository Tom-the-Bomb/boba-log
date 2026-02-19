import { getUsernameFromRequest } from "@/lib/api/request-auth";
import { ShopIdParams } from "@/lib/api/types";
import { incrementShop } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: ShopIdParams) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    const { shopId } = await params;
    const shop = await incrementShop(username, Number(shopId));
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found", code: "shopNotFound" },
        { status: 404 },
      );
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
