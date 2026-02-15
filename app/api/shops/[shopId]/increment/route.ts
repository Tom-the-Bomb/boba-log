import { getUsernameFromRequest } from "@/lib/request-auth";
import { incrementShop } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ shopId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await params;
    const shop = await incrementShop(username, shopId);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
