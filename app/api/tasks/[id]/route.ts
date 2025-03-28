import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET a single task
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const params = await context.params; // Await params
      const { id } = params;
  
      // Get session
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              organizationId: true, // Needed for access check
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
      });
  
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
  
      // Check if user has access to this task
      if (task.assignee.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
      }
  
      return NextResponse.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
    }
  }
  

  export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const params = await context.params; // Await params
      const { id } = params;
      const body = await request.json();
      const { title, description, status, priority, assigneeId, teamId } = body;
  
      // Get session
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Check if task exists
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              organizationId: true,
            },
          },
        },
      });
  
      if (!existingTask) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
  
      // Check if user has access to this task
      if (existingTask.assignee.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
      }
  
      // Validate `assigneeId`
      if (assigneeId) {
        const user = await prisma.user.findFirst({
          where: {
            id: assigneeId,
            organizationId: session.user.organizationId,
          },
        });
  
        if (!user) {
          return NextResponse.json({ error: "User not found or not in your organization" }, { status: 404 });
        }
      }
  
      // Validate `teamId`
      if (teamId) {
        const team = await prisma.team.findFirst({
          where: {
            id: teamId,
            organizationId: session.user.organizationId,
          },
        });
  
        if (!team) {
          return NextResponse.json({ error: "Team not found or not in your organization" }, { status: 404 });
        }
      }
  
      // Update task using `Object.assign`
      const updatedTask = await prisma.task.update({
        where: { id },
        data: Object.assign(
          {},
          title !== undefined && { title },
          description !== undefined && { description },
          status !== undefined && { status },
          priority !== undefined && { priority },
          assigneeId !== undefined && { assigneeId },
          teamId !== undefined && { teamId }
        ),
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          team: {
            select: { id: true, name: true },
          },
        },
      });
  
      return NextResponse.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
  }
  
  export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const params = await context.params; // Await params
      const { id } = params;
  
      // Get session
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Check if task exists
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: { select: { organizationId: true } },
          createdBy: { select: { id: true } }, // Include `createdById`
        },
      });
  
      if (!existingTask) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
  
      // Check if user has access to this task
      if (existingTask.assignee.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
      }
  
      // Only admin or task creator can delete tasks
      if (session.user.role !== "ADMIN" && existingTask.createdBy.id !== session.user.id) {
        return NextResponse.json({ error: "You don't have permission to delete this task" }, { status: 403 });
      }
  
      // Delete task
      await prisma.task.delete({ where: { id } });
  
      return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
  }
  