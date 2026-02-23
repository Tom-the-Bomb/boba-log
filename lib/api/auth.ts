import jwt from "@tsndr/cloudflare-worker-jwt";

export const AUTH_COOKIE_NAME = "boba_jwt";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
} as const;

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }
  return jwtSecret;
}

interface AuthTokenPayload {
  username: string;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt.buffer as ArrayBuffer,
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `${bufToHex(salt)}:${bufToHex(hash)}`;
}

export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }
  const hash = await pbkdf2(password, hexToBuf(saltHex));
  return constantTimeEqual(hash, hexToBuf(hashHex));
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE },
    getJwtSecret(),
  );
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const isValid = await jwt.verify(token, getJwtSecret());
  if (!isValid) {
    throw new Error("Invalid token.");
  }

  const { payload } = jwt.decode<AuthTokenPayload>(token);
  if (!payload || typeof payload.username !== "string") {
    throw new Error("Invalid token payload.");
  }

  return { username: payload.username };
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
