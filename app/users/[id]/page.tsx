"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import { useToast } from "@/contexts/toast-context"

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  tasks: {
    id: string
    title: string
    status: string
    priority: string
  }[]
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found")
        }
        throw new Error("Failed to fetch user")
      }

      const data = await response.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to load user", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      showToast("User deleted successfully", "success")
      router.push("/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to delete user", "error")
    } finally {
      setIsDeleteModalOpen(false)
    }
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
        <Button onClick={fetchUser} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link href="/users" className="btn btn-primary">
          Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="flex space-x-2">
          <Link href="/users" className="btn btn-ghost">
            Back
          </Link>
          <Link href={`/users/${user.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Profile</h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge variant={user.role === "ADMIN" ? "primary" : "secondary"}>{user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Link href={`/tasks/create?userId=${user.id}`} className="btn btn-primary">
                Add Task
              </Link>
            </CardHeader>
            <CardBody>
              {user.tasks.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No tasks assigned to this user.</p>
              ) : (
                <div className="divide-y">
                  {user.tasks.map((task) => (
                    <div key={task.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge
                            variant={
                              task.status === "TODO" ? "warning" : task.status === "IN_PROGRESS" ? "info" : "success"
                            }
                          >
                            {task.status}
                          </Badge>
                          <Badge
                            variant={
                              task.priority === "LOW" ? "secondary" : task.priority === "MEDIUM" ? "primary" : "danger"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/tasks/${task.id}`} className="btn btn-ghost">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

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
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <p className="mt-2 text-red-500">All tasks associated with this user will also be deleted.</p>
      </Modal>
    </div>
  )
}

