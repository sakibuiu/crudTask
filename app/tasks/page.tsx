"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import Select from "@/components/ui/select"
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const { showToast } = useToast()
  const { user } = useAuth()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const url = new URL("/api/tasks", window.location.origin)
      if (statusFilter) {
        url.searchParams.append("status", statusFilter)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to load tasks", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const handleDeleteClick = (taskId: string) => {
    setDeleteTaskId(taskId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTaskId) return

    try {
      const response = await fetch(`/api/tasks/${deleteTaskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== deleteTaskId))
      showToast("Task deleted successfully", "success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to delete task", "error")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteTaskId(null)
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

  // Check if user can edit/delete a task
  const canEditTask = (task: Task) => {
    if (!user) return false
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
        <Button onClick={fetchTasks} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/create" className="btn btn-primary">
          Add Task
        </Link>
      </div>

      <div className="mb-6">
        <Select
          id="statusFilter"
          name="statusFilter"
          label="Filter by Status"
          options={[
            { value: "", label: "All Statuses" },
            { value: "TODO", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "DONE", label: "Done" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center py-8 text-gray-500">
              {statusFilter
                ? `No tasks with status "${statusFilter}" found.`
                : "No tasks found. Create your first task!"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="flex justify-between items-start">
                <div className="w-full">
                  <h2 className="text-xl font-semibold truncate">{task.title}</h2>
                  <p className="text-gray-500 text-sm">Assigned to: {task.assignee.name}</p>
                  {task.team && <p className="text-gray-500 text-sm">Team: {task.team.name}</p>}
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority} Priority</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {task.description || "No description provided."}
                </p>
                <div className="flex justify-between">
                  <Link href={`/tasks/${task.id}`} className="btn btn-ghost">
                    View
                  </Link>
                  {canEditTask(task) && (
                    <>
                      <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
                        Edit
                      </Link>
                      <Button variant="danger" onClick={() => handleDeleteClick(task.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
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

