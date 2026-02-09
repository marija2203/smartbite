"use client"

import React from "react"

type Variant = "primary" | "danger" | "ghost"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export default function SBButton({ variant = "primary", className = "", ...props }: Props) {
  const base = "sb-btn"
  const danger = "sb-btn-danger"
  const ghost = "sb-btn-ghost"

  const v =
    variant === "danger" ? danger : variant === "ghost" ? ghost : base

  return <button className={`${v} ${className}`} {...props} />
}
