"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardBody, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationName: string
}

type FormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  organizationName?: string
}

export default function RegisterPage() {
  const { register, loading } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await register(formData.name, formData.email, formData.password, formData.organizationName)
    } catch (error) {
      // Error is handled in the register function
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Task Management System</h1>
          <h2 className="mt-6 text-2xl font-bold">Create your account</h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-4">
              <Input
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                error={errors.name}
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />

              <Input
                id="organizationName"
                name="organizationName"
                label="Organization Name"
                value={formData.organizationName}
                onChange={handleChange}
                required
                error={errors.organizationName}
              />
            </CardBody>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" disabled={isSubmitting || loading} fullWidth>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

