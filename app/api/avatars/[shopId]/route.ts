import { ShopIdParams } from "@/lib/api/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: ShopIdParams) {
  const { shopId } = await params;
  const key = `${shopId}.webp`;

  const { env } = getCloudflareContext();
  const object = await env.R2.get(key);

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
