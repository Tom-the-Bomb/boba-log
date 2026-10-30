import { errorResponse } from "./responses";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstileToken(token: string, ip: string | null) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing TURNSTILE_SECRET_KEY");
  }

  const body = new URLSearchParams();
  body.append("secret", secretKey);
  body.append("response", token);
  if (ip) {
    body.append("remoteip", ip);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

export async function checkTurnstile(request: Request, token: unknown) {
  if (typeof token !== "string" || !token) {
    return errorResponse("turnstileRequired", "Verification is required.", 400);
  }
  const ip = request.headers.get("cf-connecting-ip");
  return (await verifyTurnstileToken(token, ip))
    ? null
    : errorResponse("turnstileFailed", "Verification failed.", 403);
}
