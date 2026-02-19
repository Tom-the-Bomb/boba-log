import { getUsernameFromRequest } from "@/lib/api/request-auth";
import { getPublicUser } from "@/lib/api/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    const user = await getPublicUser(username);
    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "accountNotFound" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
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
