import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/api/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
