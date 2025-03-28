"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Select from "@/components/ui/select"
import { useToast } from "@/contexts/toast-context"

type User = {
  id: string
  name: string
  email: string
}

type FormData = {
  title: string
  description: string
  status: string
  priority: string
  assigneeId: string
}

type FormErrors = {
  title?: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingTask, setLoadingTask] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigneeId: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      showToast("Failed to load users", "error")
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchTask = async () => {
    try {
      setLoadingTask(true)
      const response = await fetch(`/api/tasks/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Task not found")
        }
        throw new Error("Failed to fetch task")
      }

      const data = await response.json()
      setFormData({
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
      })
    } catch (err) {
      showToast("Failed to load task", "error")
    } finally {
      setLoadingTask(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchTask()
  }, [params.id])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.assigneeId) {
      newErrors.assigneeId = "Assigned user is required"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    console.log("This is form data from edit ", formData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update task")
      }

      showToast("Task updated successfully", "success")
      router.push(`/tasks/${params.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingTask || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-xl font-semibold">Task Information</h2>
          </CardHeader>
          <CardBody>
            <Input
              id="title"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              required
              error={errors.title}
            />

            <div className="mb-4">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Task description..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <Select
              id="status"
              name="status"
              label="Status"
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" },
              ]}
              value={formData.status}
              onChange={handleChange}
              required
              error={errors.status}
            />

            <Select
              id="priority"
              name="priority"
              label="Priority"
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
              ]}
              value={formData.priority}
              onChange={handleChange}
              required
              error={errors.priority}
            />

            <Select
              id="assigneeId"
              name="assigneeId"
              label="Assign To"
              options={users.map((user) => ({ value: user.id, label: user.name }))}
              value={formData.assigneeId}
              onChange={handleChange}
              required
              error={errors.assigneeId}
            />
          </CardBody>
          <CardFooter>
            <div className="flex justify-end space-x-2">
              <Link href={`/tasks/${params.id}`} className="btn btn-ghost">
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

