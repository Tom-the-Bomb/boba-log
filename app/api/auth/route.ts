import { NextResponse } from "next/server";
import { comparePassword, hashPassword, signToken } from "@/lib/auth";
import { createUser, getUserByUsername } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const mode = String(body.mode ?? "login") as "login" | "signup";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    const existing = await getUserByUsername(username);

    if (mode === "signup") {
      if (existing) {
        return NextResponse.json(
          { error: "Account already exists. Please login." },
          { status: 409 },
        );
      }

      const hashedPassword = await hashPassword(password);
      const user = await createUser(username, hashedPassword);
      const token = signToken({ username: user.username });
      return NextResponse.json({ token, user });
    }

    if (!existing) {
      return NextResponse.json(
        { error: "No account found. Please sign up." },
        { status: 404 },
      );
    }

    const matches = await comparePassword(password, existing.hashed_password);
    if (!matches) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = signToken({ username: existing.username });
    return NextResponse.json({
      token,
      user: {
        username: existing.username,
        created_at: existing.created_at,
        shops: existing.shops,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
