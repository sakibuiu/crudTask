import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { createSession } from "./session"

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function login(userId: string): Promise<void> {
  const token = await createSession(userId)

  // Set cookie with the JWT token
  const cookieStore = await cookies()
  cookieStore.set({
    name: "session_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // 7 days
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()

  // Remove the cookie
  cookieStore.set({
    name: "session_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

