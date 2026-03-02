import { getPublicAvatar } from "@/lib/api/r2";
import { ShopIdParams } from "@/lib/api/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: ShopIdParams) {
  const { shopId } = await params;

  const object = await getPublicAvatar(Number(shopId));

  if (!object) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(object.body as ReadableStream, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
