"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./toast-context"

type User = {
  id: string
  name: string
  email: string
  role: string
  organizationId: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, organizationName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { showToast } = useToast()

  // Check if user is logged in
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (data && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error loading user session:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserFromSession()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to log in")
      }

      const userData = await response.json()
      setUser(userData)

      showToast("Logged in successfully", "success")
      router.push("/dashboard")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to log in", "error")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string, organizationName: string) => {
    try {
      setLoading(true)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, organizationName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to register")
      }

      const userData = await response.json()
      setUser(userData)

      showToast("Registered successfully", "success")
      router.push("/dashboard")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to register", "error")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)

      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setUser(null)
      showToast("Logged out successfully", "success")
      router.push("/login")
    } catch (error) {
      showToast("Failed to log out", "error")
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

