"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardBody, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

type FormData = {
  email: string
  password: string
}

type FormErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const { login, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
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
      await login(formData.email, formData.password)
      router.push(redirectPath)
    } catch (error) {
      // Error is handled in the login function
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Task Management System</h1>
          <h2 className="mt-6 text-2xl font-bold">Sign in to your account</h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-4">
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
            </CardBody>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" disabled={isSubmitting || loading} fullWidth>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center">
                <p>
                  Don't have an account?{" "}
                  <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                    Register
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

