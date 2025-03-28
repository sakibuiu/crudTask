"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function CreateUserPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
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

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }

      showToast("User created successfully", "success")
      router.push("/users")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>

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
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
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
              <Button type="button" variant="ghost" onClick={() => router.push("/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

