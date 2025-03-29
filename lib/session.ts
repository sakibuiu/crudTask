import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { SignJWT, jwtVerify } from "jose"
import crypto from "crypto"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  organizationId: string | null
}

export type Session = {
  user: SessionUser
}

// Secret key for JWT
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for")

// Create a new session
export async function createSession(userId: string): Promise<string> {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Generate a secure random token for database
    const dbToken = crypto.randomBytes(64).toString("hex")

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create session in database
    await prisma.session.create({
      data: {
        userId,
        token: dbToken,
        expiresAt,
      },
    })

    // Create JWT token for cookies
    const jwtToken = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET_KEY)

    return jwtToken
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// Get session from server components
export async function getSession(): Promise<Session | null> {
  try {
    // This function should only be used in server components
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return null
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, SECRET_KEY)

      return {
        user: payload as unknown as SessionUser,
      }
    } catch (error) {
      console.error("Invalid token:", error)
      return null
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  // We can't delete the JWT token, but we can delete the database session
  // In a real app, you might want to maintain a blacklist of revoked tokens
  // or use short-lived tokens with refresh tokens
}

