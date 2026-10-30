import { getAvatar } from "@/lib/api/r2";
import type { ShopIdParams } from "@/lib/api/types";
import { parseId } from "@/lib/api/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: ShopIdParams) {
  const shopId = parseId((await params).shopId);
  const object = shopId ? await getAvatar(shopId) : null;
  if (!object) {
    return new NextResponse(null, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  return new NextResponse(object.body as ReadableStream, { headers });
}
