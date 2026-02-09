"use client"

import React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function SBInput({ label, className = "", ...props }: Props) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      {label ? <span className="sb-label">{label}</span> : null}
      <input className={`sb-input ${className}`} {...props} />
    </label>
  )
}
