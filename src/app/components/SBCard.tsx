import React from "react"

type Props = {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function SBCard({ title, subtitle, children, className = "" }: Props) {
  return (
    <section className={`sb-card ${className}`}>
      {title ? (
        <header style={{ marginBottom: 14, textAlign: "center" }}>
          <h1 className="sb-title" data-text={title}>{title}</h1>
          {subtitle ? <p className="sb-subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
