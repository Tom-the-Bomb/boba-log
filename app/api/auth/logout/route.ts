import { clearAuthCookie } from "@/lib/api/auth";
import { NextResponse } from "next/server";

export async function POST() {
  return clearAuthCookie(NextResponse.json({ success: true }));
}
