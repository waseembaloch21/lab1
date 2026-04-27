import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ✅ FIXED
export async function getAuthUser() {
  const cookieStore = await cookies(); // 🔥 important

  const token = cookieStore.get("hrms_token")?.value;

  if (!token) return null;

  return verifyToken(token);
}