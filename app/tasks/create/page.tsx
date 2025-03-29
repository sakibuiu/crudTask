"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Select from "@/components/ui/select"
import { useToast } from "@/contexts/toast-context"
import { useAuth } from "@/contexts/auth-context"

type User = {
  id: string
  name: string
  email: string
}

type Team = {
  id: string
  name: string
}

type FormData = {
  title: string
  description: string
  status: string
  priority: string
  assigneeId: string
  teamId: string
}

type FormErrors = {
  title?: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string
  teamId?: string
}

export default function CreateTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const { user } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: searchParams.get("userId") || "",
    teamId: searchParams.get("teamId") || "",
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

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true)
      const response = await fetch("/api/teams")

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const data = await response.json()
      setTeams(data)
    } catch (err) {
      showToast("Failed to load teams", "error")
    } finally {
      setLoadingTeams(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [])

  // Add a new useEffect to set the first team ID when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !formData.teamId) {
      setFormData((prev) => ({
        ...prev,
        teamId: teams[0].id,
      }))
    }
  }, [teams])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create task")
      }

      const task = await response.json()
      showToast("Task created successfully", "success")
      router.push(`/tasks/${task.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Task</h1>

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
            {loadingUsers && <p className="text-sm text-gray-500">Loading users...</p>}

            {/* Replace the team Select with a hidden input */}
            <input type="hidden" name="teamId" id="teamId" value={formData.teamId} />
            {loadingTeams && <p className="text-sm text-gray-500">Loading teams...</p>}
          </CardBody>
          <CardFooter>
            <div className="flex justify-end space-x-2">
              <Link href="/tasks" className="btn btn-ghost">
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting || loadingUsers}>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

