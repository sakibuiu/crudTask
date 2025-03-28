import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, login } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organizationName } = body

    // Validate input
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    })

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
    })

    // Create default team
    const team = await prisma.team.create({
      data: {
        name: "Default Team",
        organizationId: organization.id,
        members: {
          create: {
            userId: user.id,
            role: "LEAD",
          },
        },
      },
    })

    // Log the user in
    await login(user.id)

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

