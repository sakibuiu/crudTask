"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">User Management</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-4">Manage users in your organization.</p>
            <div className="flex space-x-4">
              <Link href="/users" className="btn btn-primary">
                View Users
              </Link>
              <Link href="/users/create" className="btn btn-secondary">
                Add User
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Task Management</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-4">Manage tasks and assign them to users.</p>
            <div className="flex space-x-4">
              <Link href="/tasks" className="btn btn-primary">
                View Tasks
              </Link>
              <Link href="/tasks/create" className="btn btn-secondary">
                Add Task
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          Organization: {user.organizationId ? "Your Organization" : "Not Set"}
        </h2>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <p className="mb-4">
            Welcome, {user.name}! You are logged in as {user.role}.
          </p>
          <p>Use the links above to manage your tasks and users.</p>
        </div>
      </div>
    </div>
  )
}

