import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { getSession } from "@/lib/session"

// GET all users
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get organization ID from session
    const organizationId = session.user.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    // Get team from the same organization
    const teams = await prisma.team.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

// POST create a new user
