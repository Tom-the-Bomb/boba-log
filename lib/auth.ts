import jwt from "@tsndr/cloudflare-worker-jwt";

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

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return `${bufToHex(salt)}:${bufToHex(new Uint8Array(hash))}`;
}

export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }
  const salt = hexToBuf(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return bufToHex(new Uint8Array(hash)) === hashHex;
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 },
    getJwtSecret(),
  );
}

export async function verifyToken(
  token: string,
): Promise<{ username: string }> {
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
