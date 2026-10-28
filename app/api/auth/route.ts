import { comparePassword, hashPassword, setAuthCookie } from "@/lib/api/auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
} from "@/lib/api/responses";
import { checkTurnstile } from "@/lib/api/turnstile";
import { createUser, getUser } from "@/lib/api/users";
import { MAX_USERNAME_LENGTH } from "@/lib/drinks";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    const turnstileError = await checkTurnstile(request, body.turnstileToken);
    if (turnstileError) {
      return turnstileError;
    }

    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    if (!username || !password) {
      return errorResponse(
        "fieldsRequired",
        "Username and password are required.",
        400,
      );
    }

    if (body.mode === "signup") {
      if (username.length < 3) {
        return errorResponse(
          "usernameMinLength",
          "Username must be at least 3 characters.",
          400,
        );
      }
      if (username.length > MAX_USERNAME_LENGTH) {
        return errorResponse(
          "usernameMaxLength",
          `Username must be at most ${MAX_USERNAME_LENGTH} characters.`,
          400,
        );
      }
      if (password.length < 6) {
        return errorResponse(
          "passwordMinLength",
          "Password must be at least 6 characters.",
          400,
        );
      }
      if (!(await createUser(username, await hashPassword(password)))) {
        return errorResponse("accountExists", "Account already exists.", 409);
      }
      return setAuthCookie(NextResponse.json({ success: true }), username);
    }

    const existing = await getUser(username);
    if (!existing) {
      return errorResponse("accountNotFound", "No account found.", 404);
    }
    if (!(await comparePassword(password, existing.hashed_password))) {
      return errorResponse("invalidPassword", "Invalid password.", 401);
    }
    return setAuthCookie(NextResponse.json({ success: true }), username);
  } catch {
    return serverErrorResponse();
  }
}
