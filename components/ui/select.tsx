"use client"

import type React from "react"
import { forwardRef } from "react"

type Option = {
  value: string
  label: string
}

type SelectProps = {
  id: string
  name: string
  label?: string
  options: Option[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  error?: string
  className?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, name, label, options, value, onChange, required = false, error, className = "" }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={id} className="label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

Select.displayName = "Select"

export default Select

