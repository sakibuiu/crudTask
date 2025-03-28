"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import { useToast } from "@/contexts/toast-context"
import { useAuth } from "@/contexts/auth-context"

type Task = {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  assigneeId: string
  createdById: string
  teamId: string | null
  createdAt: string
  updatedAt: string
  assignee: {
    id: string
    name: string
    email: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  team?: {
    id: string
    name: string
  }
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const { id } = await params; // Await params before using id
        const response = await fetch(`/api/tasks/${id}`);
        console.log(response)
        if (!response.ok) {
          if (response.status === 404) throw new Error("Task not found");
          throw new Error("Failed to fetch task");
        }
  
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        showToast("Failed to load task", "error");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTask();
  }, [params]); // Remove direct access to params.id
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      showToast("Task deleted successfully", "success")
      router.push("/tasks")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to delete task", "error")
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "TODO":
        return "warning"
      case "IN_PROGRESS":
        return "info"
      case "DONE":
        return "success"
      default:
        return "secondary"
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "secondary"
      case "MEDIUM":
        return "primary"
      case "HIGH":
        return "danger"
      default:
        return "secondary"
    }
  }

  // Check if user can edit/delete this task
  const canEditTask = () => {
    if (!user || !task) return false
    return user.role === "ADMIN" || task.createdById === user.id || task.assigneeId === user.id
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>Error: {error}</p>
        <Button onClick={fetchTask} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Task not found</h2>
        <Link href="/tasks" className="btn btn-primary">
          Back to Tasks
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Details</h1>
        <div className="flex space-x-2">
          <Link href="/tasks" className="btn btn-ghost">
            Back
          </Link>
          {canEditTask() && (
            <>
              <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority} Priority</Badge>
              {task.team && <Badge variant="info">Team: {task.team.name}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description || "No description provided."}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">
                    <Link href={`/users/${task.assignee.id}`} className="text-indigo-600 hover:underline">
                      {task.assignee.name}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">
                    <Link href={`/users/${task.createdBy.id}`} className="text-indigo-600 hover:underline">
                      {task.createdBy.name}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(task.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <Link href={`/users/${task.assignee.id}`} className="btn btn-ghost">
              View Assigned User
            </Link>
            {canEditTask() && (
              <div className="flex space-x-2">
                <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
                  Edit Task
                </Link>
                <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

