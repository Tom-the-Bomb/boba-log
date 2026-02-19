import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { env } = getCloudflareContext();
  const ip = request.headers.get("cf-connecting-ip") ?? "127.0.0.1";
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const { success } = await env[
      pathname.startsWith("/api/auth")
        ? "AUTH_RATE_LIMIT"
        : "GENERAL_RATE_LIMIT"
    ].limit({ key: ip });
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          code: "tooManyRequests",
        },
        { status: 429 },
      );
    }
  }

  const isLoggedIn = request.cookies.has("boba_jwt");

  if (pathname === "/dashboard" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname === "/auth" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
