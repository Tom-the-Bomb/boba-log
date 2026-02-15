import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }
  return jwtSecret;
}

export interface AuthTokenPayload {
  username: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !("username" in decoded) ||
    typeof decoded.username !== "string"
  ) {
    throw new Error("Invalid token payload.");
  }

  return { username: decoded.username };
}
