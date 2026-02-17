import { getUsernameFromRequest } from "@/lib/api/request-auth";
import { deleteShop } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ shopId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await params;
    const deleted = await deleteShop(username, Number(shopId));
    if (!deleted) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
