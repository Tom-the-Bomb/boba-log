import { comparePassword, hashPassword, setAuthCookie } from "@/lib/api/auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
} from "@/lib/api/responses";
import { checkTurnstile } from "@/lib/api/turnstile";
import { createUser, getUser } from "@/lib/api/users";
import { passwordProblem, usernameProblem } from "@/lib/drinks";
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
    const mode = body.mode === "signup" ? "signup" : "login";
    const problem =
      usernameProblem(username, mode) ?? passwordProblem(password, mode);
    if (problem) {
      return errorResponse(problem, "Invalid username or password.", 400);
    }

    if (mode === "signup") {
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
