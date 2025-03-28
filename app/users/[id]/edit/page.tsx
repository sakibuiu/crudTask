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

type FormData = {
  name: string
  email: string
  password: string
  role: string
}

type FormErrors = {
  name?: string
  email?: string
  password?: string
  role?: string
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setFormData({
        name: data.name,
        email: data.email,
        password: "",
        role: data.role,
      })
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Only include password if it's not empty
    const updateData = { ...formData }
    if (!updateData.password) {
      delete updateData.password
    }

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user")
      }

      showToast("User updated successfully", "success")
      router.push(`/users/${params.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error")
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-xl font-semibold">User Information</h2>
          </CardHeader>
          <CardBody>
            <Input
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name}
            />

            <Input
              type="email"
              id="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <Input
              type="password"
              id="password"
              name="password"
              label="Password (leave blank to keep current)"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Select
              id="role"
              name="role"
              label="Role"
              options={[
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
              ]}
              value={formData.role}
              onChange={handleChange}
              required
              error={errors.role}
            />
          </CardBody>
          <CardFooter>
            <div className="flex justify-end space-x-2">
              <Link href={`/users/${params.id}`} className="btn btn-ghost">
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

