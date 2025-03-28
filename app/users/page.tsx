"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  _count: {
    tasks: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { showToast } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to load users", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return

    try {
      const response = await fetch(`/api/users/${deleteUserId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId))
      showToast("User deleted successfully", "success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      showToast("Failed to delete user", "error")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteUserId(null)
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
        <Button onClick={fetchUsers} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link href="/users/create" className="btn btn-primary">
          Add User
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center py-8 text-gray-500">No users found. Create your first user!</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <Badge variant={user.role === "ADMIN" ? "primary" : "secondary"}>{user.role}</Badge>
              </CardHeader>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Tasks: {user._count.tasks}</span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Link href={`/users/${user.id}`} className="btn btn-ghost">
                    View
                  </Link>
                  <Link href={`/users/${user.id}/edit`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <Button variant="danger" onClick={() => handleDeleteClick(user.id)}>
                    Delete
                  </Button>
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
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

