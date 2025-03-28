"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  // Don't show navbar on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              TaskMaster
            </Link>
          </div>

          {/* Desktop menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md ${isActive("/dashboard") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/users"
                className={`px-3 py-2 rounded-md ${isActive("/users") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              >
                Users
              </Link>
              <Link
                href="/tasks"
                className={`px-3 py-2 rounded-md ${isActive("/tasks") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              >
                Tasks
              </Link>
              <button onClick={() => logout()} className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md ${isActive("/dashboard") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/users"
              className={`block px-3 py-2 rounded-md ${isActive("/users") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Users
            </Link>
            <Link
              href="/tasks"
              className={`block px-3 py-2 rounded-md ${isActive("/tasks") ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tasks
            </Link>
            <button
              onClick={() => {
                logout()
                setIsMenuOpen(false)
              }}
              className="block w-full text-left px-3 py-2 rounded-md hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

