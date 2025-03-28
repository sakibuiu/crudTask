import type React from "react"

type CardProps = {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

type CardHeaderProps = {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`card-header ${className}`}>{children}</div>
}

type CardBodyProps = {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>
}

type CardFooterProps = {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`card-footer ${className}`}>{children}</div>
}

