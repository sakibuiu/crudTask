"use client"

import type React from "react"

type ButtonProps = {
  children: React.ReactNode
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "danger" | "ghost"
  className?: string
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
}

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = "btn"
  const variantClasses = `btn-${variant}`
  const widthClasses = fullWidth ? "w-full" : ""

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

