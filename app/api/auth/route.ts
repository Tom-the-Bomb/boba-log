import {
  AuthMode,
  comparePassword,
  hashPassword,
  signToken,
} from "@/lib/api/auth";
import { createUser, getPublicUser, getUserByUsername } from "@/lib/api/users";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const mode = String(body.mode ?? "login") as AuthMode;

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Username and password are required.",
          code: "fieldsRequired",
        },
        { status: 400 },
      );
    }

    const existing = await getUserByUsername(username);

    if (mode === "signup") {
      if (existing) {
        return NextResponse.json(
          {
            error: "Account already exists. Please login.",
            code: "accountExists",
          },
          { status: 409 },
        );
      }

      const hashedPassword = await hashPassword(password);
      const user = await createUser(username, hashedPassword);
      const token = await signToken({ username: user.username });
      return NextResponse.json({ token, user });
    }

    if (!existing) {
      return NextResponse.json(
        {
          error: "No account found. Please sign up.",
          code: "accountNotFound",
        },
        { status: 404 },
      );
    }

    const matches = await comparePassword(password, existing.hashed_password);
    if (!matches) {
      return NextResponse.json(
        {
          error: "Invalid password.",
          code: "invalidPassword",
        },
        { status: 401 },
      );
    }

    const token = await signToken({ username: existing.username });
    const user = await getPublicUser(existing.username);
    return NextResponse.json({ token, user });
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
