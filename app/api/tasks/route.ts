import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET all tasks
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const teamId = searchParams.get("teamId")

    // Build query
    const where: any = {
      assignee: {
        organizationId,
      },
    }

    if (userId) where.assigneeId = userId
    if (status) where.status = status
    if (teamId) where.teamId = teamId

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, status, priority, assigneeId, teamId } = body

    // Validate input
    if (!title || !assigneeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists and belongs to the same organization
    const user = await prisma.user.findFirst({
      where: {
        id: assigneeId,
        organizationId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found or not in your organization" }, { status: 404 })
    }

    // Check if team exists and belongs to the same organization (if provided)
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          organizationId,
        },
      })

      if (!team) {
        return NextResponse.json({ error: "Team not found or not in your organization" }, { status: 404 })
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        assigneeId,
        createdById: session.user.id,
        teamId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

