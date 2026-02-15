import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment variables.");
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
  return jwt.sign(payload, jwtSecret, { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret) as AuthTokenPayload;
}
