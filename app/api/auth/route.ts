import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  comparePassword,
  hashPassword,
  signToken,
} from "@/lib/api/auth";
import { verifyTurnstileToken } from "@/lib/api/turnstile";
import { createUser, getPublicUser, getUserByUsername } from "@/lib/api/users";
import type { AuthMode } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const mode = String(body.mode ?? "login") as AuthMode;
    const turnstileToken = String(body.turnstileToken ?? "");

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verification is required.", code: "turnstileRequired" },
        { status: 400 },
      );
    }

    const ip = request.headers.get("cf-connecting-ip");
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "Verification failed.", code: "turnstileFailed" },
        { status: 403 },
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Username and password are required.",
          code: "fieldsRequired",
        },
        { status: 400 },
      );
    }

    if (mode === "signup") {
      if (username.length < 3) {
        return NextResponse.json(
          {
            error: "Username must be at least 3 characters.",
            code: "usernameMinLength",
          },
          { status: 400 },
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          {
            error: "Password must be at least 6 characters.",
            code: "passwordMinLength",
          },
          { status: 400 },
        );
      }
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
      const response = NextResponse.json({ user });
      response.cookies.set(AUTH_COOKIE_NAME, token, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: AUTH_COOKIE_MAX_AGE,
      });
      return response;
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
    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
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
