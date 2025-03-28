import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Secret key for JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development_only")

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, SECRET_KEY)
    return verified.payload
  } catch (err) {
    return null
  }
}

